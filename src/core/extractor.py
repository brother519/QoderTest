"""Data extractor module for detecting and fetching changes from source database."""

from datetime import datetime
from typing import Any, Iterator

from ..database.mysql_connector import MySQLConnector
from ..utils.logger import get_logger, SyncLogger

logger = get_logger(__name__)


class Extractor:
    """Extract changed records from MySQL source database."""
    
    def __init__(
        self,
        connector: MySQLConnector,
        table_config: dict[str, Any],
        batch_size: int = 2000
    ):
        """Initialize extractor.
        
        Args:
            connector: MySQL database connector
            table_config: Table mapping configuration
            batch_size: Number of records per batch
        """
        self.connector = connector
        self.table_config = table_config
        self.batch_size = batch_size
        self.source_table = table_config["source_table"]
        self.timestamp_field = table_config.get("timestamp_field", "updated_at")
        self.primary_key = table_config.get("primary_key", "id")
        self.soft_delete_field = table_config.get("soft_delete_field")
        self._logger = SyncLogger(table_name=self.source_table)
    
    def get_total_count(self, since: datetime | None = None) -> int:
        """Get total count of records to sync.
        
        Args:
            since: Optional timestamp to filter records after
            
        Returns:
            Total record count
        """
        since_str = since.strftime("%Y-%m-%d %H:%M:%S") if since else None
        return self.connector.get_record_count(
            self.source_table,
            self.timestamp_field,
            since_str
        )
    
    def detect_changes(
        self,
        since: datetime | None = None,
        offset: int = 0
    ) -> Iterator[list[dict[str, Any]]]:
        """Detect and yield changed records in batches.
        
        Args:
            since: Timestamp to get records updated after
            offset: Starting offset for pagination
            
        Yields:
            Batches of changed records
        """
        if since:
            since_str = since.strftime("%Y-%m-%d %H:%M:%S")
            query = f"""
                SELECT * FROM {self.source_table}
                WHERE {self.timestamp_field} > :since
                ORDER BY {self.timestamp_field} ASC, {self.primary_key} ASC
            """
            params = {"since": since_str}
        else:
            # Full sync - get all records
            query = f"""
                SELECT * FROM {self.source_table}
                ORDER BY {self.primary_key} ASC
            """
            params = {}
        
        current_offset = offset
        
        while True:
            paginated_query = f"{query} LIMIT :limit OFFSET :offset"
            params_with_pagination = {
                **params,
                "limit": self.batch_size,
                "offset": current_offset
            }
            
            records = self.connector.fetch_all(paginated_query, params_with_pagination)
            
            if not records:
                break
            
            self._logger.debug(
                f"Fetched batch",
                offset=current_offset,
                count=len(records)
            )
            
            yield records
            
            if len(records) < self.batch_size:
                break
            
            current_offset += self.batch_size
    
    def fetch_batch(
        self,
        offset: int,
        limit: int | None = None,
        since: datetime | None = None
    ) -> list[dict[str, Any]]:
        """Fetch a specific batch of records.
        
        Args:
            offset: Starting offset
            limit: Number of records (defaults to batch_size)
            since: Optional timestamp filter
            
        Returns:
            List of records
        """
        limit = limit or self.batch_size
        
        if since:
            since_str = since.strftime("%Y-%m-%d %H:%M:%S")
            query = f"""
                SELECT * FROM {self.source_table}
                WHERE {self.timestamp_field} > :since
                ORDER BY {self.timestamp_field} ASC, {self.primary_key} ASC
                LIMIT :limit OFFSET :offset
            """
            params = {"since": since_str, "limit": limit, "offset": offset}
        else:
            query = f"""
                SELECT * FROM {self.source_table}
                ORDER BY {self.primary_key} ASC
                LIMIT :limit OFFSET :offset
            """
            params = {"limit": limit, "offset": offset}
        
        return self.connector.fetch_all(query, params)
    
    def detect_soft_deletes(
        self,
        since: datetime | None = None
    ) -> Iterator[list[dict[str, Any]]]:
        """Detect soft-deleted records.
        
        Args:
            since: Timestamp to get records deleted after
            
        Yields:
            Batches of soft-deleted records
        """
        if not self.soft_delete_field:
            return
        
        if since:
            since_str = since.strftime("%Y-%m-%d %H:%M:%S")
            query = f"""
                SELECT {self.primary_key}, {self.soft_delete_field}
                FROM {self.source_table}
                WHERE {self.soft_delete_field} IS NOT NULL
                  AND {self.soft_delete_field} > :since
                ORDER BY {self.soft_delete_field} ASC
            """
            params = {"since": since_str}
        else:
            query = f"""
                SELECT {self.primary_key}, {self.soft_delete_field}
                FROM {self.source_table}
                WHERE {self.soft_delete_field} IS NOT NULL
                ORDER BY {self.soft_delete_field} ASC
            """
            params = {}
        
        offset = 0
        while True:
            paginated_query = f"{query} LIMIT :limit OFFSET :offset"
            params_with_pagination = {
                **params,
                "limit": self.batch_size,
                "offset": offset
            }
            
            records = self.connector.fetch_all(paginated_query, params_with_pagination)
            
            if not records:
                break
            
            yield records
            
            if len(records) < self.batch_size:
                break
            
            offset += self.batch_size
    
    def get_all_ids(self) -> set[Any]:
        """Get all primary key values for deletion detection via snapshot.
        
        Returns:
            Set of all primary key values
        """
        return self.connector.get_all_primary_keys(
            self.source_table,
            self.primary_key
        )
    
    def detect_hard_deletes(
        self,
        previous_ids: set[Any],
        current_ids: set[Any] | None = None
    ) -> list[Any]:
        """Detect hard-deleted records by comparing ID snapshots.
        
        Args:
            previous_ids: Set of IDs from previous sync
            current_ids: Current IDs (fetched if not provided)
            
        Returns:
            List of deleted IDs
        """
        if current_ids is None:
            current_ids = self.get_all_ids()
        
        deleted_ids = previous_ids - current_ids
        
        if deleted_ids:
            self._logger.info(
                f"Detected hard deletes",
                count=len(deleted_ids)
            )
        
        return list(deleted_ids)
    
    def get_latest_timestamp(self) -> datetime | None:
        """Get the latest timestamp from the source table.
        
        Returns:
            Latest timestamp or None if table is empty
        """
        query = f"""
            SELECT MAX({self.timestamp_field}) as max_ts
            FROM {self.source_table}
        """
        result = self.connector.fetch_all(query)
        
        if result and result[0]["max_ts"]:
            return result[0]["max_ts"]
        return None
