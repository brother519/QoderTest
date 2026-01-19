"""Data loader module for loading validated data into target database."""

from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from sqlalchemy.exc import OperationalError, InterfaceError

from ..database.postgres_connector import PostgresConnector
from ..utils.logger import get_logger, SyncLogger

logger = get_logger(__name__)


class LoadError(Exception):
    """Raised when data loading fails."""
    
    def __init__(self, message: str, records: list[dict] | None = None):
        self.message = message
        self.records = records or []
        super().__init__(message)


class Loader:
    """Load validated data into PostgreSQL target database."""
    
    def __init__(
        self,
        connector: PostgresConnector,
        table_config: dict[str, Any]
    ):
        """Initialize loader.
        
        Args:
            connector: PostgreSQL database connector
            table_config: Table mapping configuration
        """
        self.connector = connector
        self.table_config = table_config
        self.target_table = table_config.get("target_table", "")
        self.primary_key = table_config.get("primary_key", "id")
        self.soft_delete_field = table_config.get("soft_delete_field")
        self._logger = SyncLogger(table_name=self.target_table)
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        retry=retry_if_exception_type((OperationalError, InterfaceError)),
        reraise=True
    )
    def load_batch(
        self,
        records: list[dict[str, Any]],
        operation: str = "upsert"
    ) -> tuple[int, list[dict]]:
        """Load a batch of records into target database.
        
        Args:
            records: List of validated records
            operation: Operation type (insert, upsert, update)
            
        Returns:
            Tuple of (success count, failed records)
        """
        if not records:
            return 0, []
        
        failed: list[dict] = []
        success_count = 0
        
        try:
            if operation == "insert":
                success_count = self._execute_insert(records)
            elif operation == "upsert":
                success_count = self._execute_upsert(records)
            elif operation == "update":
                success_count = self._execute_update(records)
            else:
                raise LoadError(f"Unknown operation: {operation}")
            
            self._logger.debug(
                f"Batch loaded successfully",
                operation=operation,
                count=success_count
            )
            
        except Exception as e:
            self._logger.error(
                f"Batch load failed",
                operation=operation,
                error=str(e)
            )
            # On failure, try to load records one by one to identify failures
            success_count, failed = self._load_individually(records, operation)
        
        return success_count, failed
    
    def _execute_insert(self, records: list[dict[str, Any]]) -> int:
        """Execute bulk insert.
        
        Args:
            records: Records to insert
            
        Returns:
            Number of inserted records
        """
        columns = list(records[0].keys())
        return self.connector.bulk_insert(
            self.target_table,
            records,
            columns
        )
    
    def _execute_upsert(self, records: list[dict[str, Any]]) -> int:
        """Execute bulk upsert (insert or update on conflict).
        
        Args:
            records: Records to upsert
            
        Returns:
            Number of affected records
        """
        columns = list(records[0].keys())
        return self.connector.bulk_upsert(
            self.target_table,
            records,
            self.primary_key,
            columns
        )
    
    def _execute_update(self, records: list[dict[str, Any]]) -> int:
        """Execute bulk update.
        
        Args:
            records: Records to update
            
        Returns:
            Number of updated records
        """
        # Update records one by one (for now)
        # Could be optimized with CASE statements for bulk updates
        updated = 0
        
        for record in records:
            pk_value = record.get(self.primary_key)
            if pk_value is None:
                continue
            
            update_fields = {k: v for k, v in record.items() if k != self.primary_key}
            
            set_clause = ", ".join([f"{k} = :{k}" for k in update_fields.keys()])
            query = f"""
                UPDATE {self.target_table}
                SET {set_clause}
                WHERE {self.primary_key} = :pk_value
            """
            
            params = {**update_fields, "pk_value": pk_value}
            
            with self.connector.get_session() as session:
                from sqlalchemy import text
                result = session.execute(text(query), params)
                updated += result.rowcount
        
        return updated
    
    def _load_individually(
        self,
        records: list[dict[str, Any]],
        operation: str
    ) -> tuple[int, list[dict]]:
        """Load records one by one to identify failures.
        
        Args:
            records: Records to load
            operation: Operation type
            
        Returns:
            Tuple of (success count, failed records)
        """
        success_count = 0
        failed: list[dict] = []
        
        for record in records:
            try:
                if operation == "insert":
                    self.connector.bulk_insert(self.target_table, [record])
                elif operation == "upsert":
                    self.connector.bulk_upsert(
                        self.target_table,
                        [record],
                        self.primary_key
                    )
                success_count += 1
            except Exception as e:
                failed.append(record)
                self._logger.record_failed(
                    record.get(self.primary_key),
                    "load",
                    str(e)
                )
        
        return success_count, failed
    
    def delete_records(
        self,
        ids: list[Any],
        soft_delete: bool = True
    ) -> int:
        """Delete records from target database.
        
        Args:
            ids: List of primary key values to delete
            soft_delete: If True, use soft delete; otherwise hard delete
            
        Returns:
            Number of deleted records
        """
        if not ids:
            return 0
        
        if soft_delete and self.soft_delete_field:
            count = self.connector.soft_delete(
                self.target_table,
                ids,
                self.primary_key,
                self.soft_delete_field
            )
        else:
            count = self.connector.bulk_delete(
                self.target_table,
                ids,
                self.primary_key
            )
        
        self._logger.info(
            f"Records deleted",
            count=count,
            soft_delete=soft_delete
        )
        
        return count
    
    def get_existing_ids(self) -> set[Any]:
        """Get all existing primary key values in target table.
        
        Returns:
            Set of primary key values
        """
        query = f"SELECT {self.primary_key} FROM {self.target_table}"
        results = self.connector.fetch_all(query)
        return {row[self.primary_key] for row in results}
    
    def verify_load(self, expected_count: int) -> bool:
        """Verify records were loaded correctly.
        
        Args:
            expected_count: Expected number of records
            
        Returns:
            True if verification passed
        """
        actual_count = self.connector.get_record_count(self.target_table)
        
        if actual_count >= expected_count:
            self._logger.info(
                f"Load verification passed",
                expected=expected_count,
                actual=actual_count
            )
            return True
        else:
            self._logger.warning(
                f"Load verification warning: count mismatch",
                expected=expected_count,
                actual=actual_count
            )
            return False
