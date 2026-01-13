"""
Data loader for ETL pipeline.
Loads validated data into target database.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from src.utils.db import get_db_manager
from src.utils.logger import get_logger


def load_schema_mappings() -> dict:
    """Load schema mappings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'schema_mappings.yaml'
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def load_settings() -> dict:
    """Load settings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'settings.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


class LoadResult:
    """Result of a load operation."""
    
    def __init__(self):
        self.records_inserted: int = 0
        self.records_updated: int = 0
        self.records_deleted: int = 0
        self.records_failed: int = 0
        self.errors: list[dict] = []
    
    @property
    def total_loaded(self) -> int:
        return self.records_inserted + self.records_updated
    
    def add_error(self, error: str, batch_size: int = 0):
        """Add an error to the result."""
        self.errors.append({
            'error': error,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'batch_size': batch_size
        })
        self.records_failed += batch_size


class DataLoader:
    """
    Loads data into target database.
    
    Supports:
    - Bulk insert
    - Upsert (INSERT ... ON CONFLICT UPDATE)
    - Soft delete handling
    - Transaction management
    - Retry logic for transient failures
    """
    
    def __init__(self):
        self.db_manager = get_db_manager()
        self.logger = get_logger()
        self.schema_mappings = load_schema_mappings()
        self.settings = load_settings()
        
        pipeline_config = self.settings.get('pipeline', {})
        self.max_retries = pipeline_config.get('max_retries', 3)
        self.retry_delay = pipeline_config.get('retry_delay', 5)
        self.dry_run = pipeline_config.get('dry_run', False)
    
    def get_table_config(self, table_name: str) -> dict:
        """Get configuration for a specific table."""
        tables = self.schema_mappings.get('tables', {})
        if table_name not in tables:
            raise ValueError(f"Table '{table_name}' not found in schema mappings")
        return tables[table_name]
    
    def _build_upsert_query(
        self,
        table_name: str,
        columns: list[str]
    ) -> str:
        """Build PostgreSQL upsert query."""
        table_config = self.get_table_config(table_name)
        target_table = table_config['target_table']
        pk_field = table_config.get('primary_key', 'id')
        
        # Column placeholders
        col_names = ', '.join(columns)
        placeholders = ', '.join(f':{col}' for col in columns)
        
        # Update clause (exclude primary key)
        update_cols = [c for c in columns if c != pk_field]
        update_clause = ', '.join(f'{col} = EXCLUDED.{col}' for col in update_cols)
        
        query = f"""
            INSERT INTO {target_table} ({col_names})
            VALUES ({placeholders})
            ON CONFLICT ({pk_field})
            DO UPDATE SET {update_clause}
        """
        
        return query.strip()
    
    def _build_insert_query(
        self,
        table_name: str,
        columns: list[str]
    ) -> str:
        """Build simple INSERT query."""
        table_config = self.get_table_config(table_name)
        target_table = table_config['target_table']
        
        col_names = ', '.join(columns)
        placeholders = ', '.join(f':{col}' for col in columns)
        
        query = f"""
            INSERT INTO {target_table} ({col_names})
            VALUES ({placeholders})
        """
        
        return query.strip()
    
    def _build_delete_query(self, table_name: str) -> str:
        """Build soft delete query."""
        table_config = self.get_table_config(table_name)
        target_table = table_config['target_table']
        pk_field = table_config.get('primary_key', 'id')
        
        # For soft delete, we update the deleted_at column
        query = f"""
            UPDATE {target_table}
            SET deleted_at = :deleted_at
            WHERE {pk_field} = :id
        """
        
        return query.strip()
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type(SQLAlchemyError),
        reraise=True
    )
    def _execute_batch(
        self,
        query: str,
        records: list[dict],
        table_name: str
    ) -> int:
        """Execute a batch of records with retry logic."""
        if self.dry_run:
            self.logger.info(
                'dry_run_batch',
                table=table_name,
                records=len(records),
                query=query[:100]
            )
            return len(records)
        
        with self.db_manager.target_engine.begin() as conn:
            for record in records:
                # Convert pandas NaT/NaN to None
                clean_record = {
                    k: (None if pd.isna(v) else v)
                    for k, v in record.items()
                }
                conn.execute(text(query), clean_record)
        
        return len(records)
    
    def load_batch(
        self,
        df: pd.DataFrame,
        table_name: str,
        mode: str = 'upsert'
    ) -> LoadResult:
        """
        Load a batch of records into target database.
        
        Args:
            df: DataFrame with records to load
            table_name: Name of the table (from schema mappings)
            mode: 'upsert' (default), 'insert', or 'replace'
        
        Returns:
            LoadResult with counts and errors
        """
        result = LoadResult()
        
        if df.empty:
            return result
        
        columns = list(df.columns)
        records = df.to_dict('records')
        
        # Build query based on mode
        if mode == 'upsert':
            query = self._build_upsert_query(table_name, columns)
        elif mode == 'insert':
            query = self._build_insert_query(table_name, columns)
        else:
            raise ValueError(f"Unsupported mode: {mode}")
        
        self.logger.debug(
            'loading_batch',
            table=table_name,
            records=len(records),
            mode=mode
        )
        
        try:
            loaded = self._execute_batch(query, records, table_name)
            
            if mode == 'upsert':
                # We can't easily distinguish inserts from updates
                result.records_updated = loaded
            else:
                result.records_inserted = loaded
            
            self.logger.debug(
                'batch_loaded',
                table=table_name,
                loaded=loaded
            )
        
        except SQLAlchemyError as e:
            error_msg = str(e)
            self.logger.log_load_error(table_name, error_msg, len(records))
            result.add_error(error_msg, len(records))
        
        return result
    
    def load_batch_chunked(
        self,
        df: pd.DataFrame,
        table_name: str,
        chunk_size: int = 1000,
        mode: str = 'upsert'
    ) -> LoadResult:
        """
        Load a batch in smaller chunks for better transaction management.
        
        Args:
            df: DataFrame with records to load
            table_name: Name of the table
            chunk_size: Number of records per chunk
            mode: 'upsert' or 'insert'
        
        Returns:
            Combined LoadResult
        """
        result = LoadResult()
        
        if df.empty:
            return result
        
        total_records = len(df)
        chunks = [df[i:i + chunk_size] for i in range(0, total_records, chunk_size)]
        
        self.logger.debug(
            'loading_chunked',
            table=table_name,
            total_records=total_records,
            chunks=len(chunks),
            chunk_size=chunk_size
        )
        
        for i, chunk_df in enumerate(chunks):
            chunk_result = self.load_batch(chunk_df, table_name, mode)
            
            result.records_inserted += chunk_result.records_inserted
            result.records_updated += chunk_result.records_updated
            result.records_failed += chunk_result.records_failed
            result.errors.extend(chunk_result.errors)
            
            self.logger.debug(
                'chunk_loaded',
                table=table_name,
                chunk=i + 1,
                of=len(chunks),
                loaded=chunk_result.total_loaded,
                failed=chunk_result.records_failed
            )
        
        return result
    
    def delete_records(
        self,
        record_ids: list[Any],
        table_name: str,
        hard_delete: bool = False
    ) -> LoadResult:
        """
        Delete records from target table.
        
        Args:
            record_ids: List of primary key values to delete
            table_name: Name of the table
            hard_delete: If True, permanently delete; if False, soft delete
        
        Returns:
            LoadResult with deletion count
        """
        result = LoadResult()
        
        if not record_ids:
            return result
        
        table_config = self.get_table_config(table_name)
        target_table = table_config['target_table']
        pk_field = table_config.get('primary_key', 'id')
        
        if hard_delete:
            query = f"DELETE FROM {target_table} WHERE {pk_field} = :id"
        else:
            query = self._build_delete_query(table_name)
        
        self.logger.debug(
            'deleting_records',
            table=table_name,
            count=len(record_ids),
            hard_delete=hard_delete
        )
        
        if self.dry_run:
            self.logger.info(
                'dry_run_delete',
                table=table_name,
                count=len(record_ids)
            )
            result.records_deleted = len(record_ids)
            return result
        
        try:
            with self.db_manager.target_engine.begin() as conn:
                for record_id in record_ids:
                    params = {'id': record_id}
                    if not hard_delete:
                        params['deleted_at'] = datetime.now(timezone.utc)
                    conn.execute(text(query), params)
            
            result.records_deleted = len(record_ids)
            
        except SQLAlchemyError as e:
            error_msg = str(e)
            self.logger.error(
                'delete_error',
                table=table_name,
                error=error_msg
            )
            result.add_error(error_msg, len(record_ids))
        
        return result
    
    def verify_load(
        self,
        table_name: str,
        expected_count: int,
        since_timestamp: Optional[datetime] = None
    ) -> bool:
        """
        Verify that records were loaded correctly.
        
        Returns:
            True if verification passes
        """
        table_config = self.get_table_config(table_name)
        target_table = table_config['target_table']
        timestamp_col = table_config.get('timestamp_column', 'updated_at')
        
        params = {}
        where_clause = ""
        
        if since_timestamp:
            where_clause = f"WHERE {timestamp_col} >= :since_ts"
            params['since_ts'] = since_timestamp
        
        query = f"SELECT COUNT(*) as count FROM {target_table} {where_clause}"
        
        try:
            with self.db_manager.target_engine.connect() as conn:
                result = conn.execute(text(query), params)
                row = result.fetchone()
                actual_count = row[0] if row else 0
            
            self.logger.debug(
                'load_verified',
                table=table_name,
                expected=expected_count,
                actual=actual_count
            )
            
            return actual_count >= expected_count
        
        except SQLAlchemyError as e:
            self.logger.error(
                'verification_error',
                table=table_name,
                error=str(e)
            )
            return False


# Convenience function
def create_loader() -> DataLoader:
    """Create a new DataLoader instance."""
    return DataLoader()
