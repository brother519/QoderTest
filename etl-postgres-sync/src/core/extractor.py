"""
Data extractor for ETL pipeline.
Extracts changed records from source database using timestamp-based change detection.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator, Optional

import pandas as pd
import yaml
from sqlalchemy import text

from src.utils.db import get_db_manager
from src.utils.logger import get_logger


def load_schema_mappings() -> dict:
    """Load schema mappings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'schema_mappings.yaml'
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


class DataExtractor:
    """
    Extracts data from source database in batches.
    
    Uses timestamp-based change detection to identify new/updated records.
    Supports cursor-based pagination for efficient extraction of large datasets.
    """
    
    def __init__(self):
        self.db_manager = get_db_manager()
        self.logger = get_logger()
        self.schema_mappings = load_schema_mappings()
    
    def get_table_config(self, table_name: str) -> dict:
        """Get configuration for a specific table."""
        tables = self.schema_mappings.get('tables', {})
        if table_name not in tables:
            raise ValueError(f"Table '{table_name}' not found in schema mappings")
        return tables[table_name]
    
    def get_configured_tables(self) -> list[str]:
        """Get list of all configured tables."""
        return list(self.schema_mappings.get('tables', {}).keys())
    
    def build_extraction_query(
        self,
        table_config: dict,
        checkpoint_timestamp: Optional[datetime] = None,
        checkpoint_id: Optional[int] = None,
        batch_size: int = 5000
    ) -> tuple[str, dict]:
        """
        Build SQL query for extracting changed records.
        
        Uses composite cursor (timestamp, id) for deterministic ordering.
        """
        source_table = table_config['source_table']
        timestamp_col = table_config['timestamp_column']
        pk_col = table_config['primary_key']
        deleted_col = table_config.get('deleted_column')
        
        # Build WHERE clause
        conditions = []
        params = {'batch_size': batch_size}
        
        if checkpoint_timestamp is not None:
            # Use composite cursor for deterministic pagination
            conditions.append(f"""
                ({timestamp_col} > :checkpoint_ts 
                 OR ({timestamp_col} = :checkpoint_ts AND {pk_col} > :checkpoint_id))
            """)
            params['checkpoint_ts'] = checkpoint_timestamp
            params['checkpoint_id'] = checkpoint_id or 0
        
        # Include soft-deleted records in the extraction
        # (they will be handled during transformation/loading)
        
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        
        query = f"""
            SELECT *
            FROM {source_table}
            {where_clause}
            ORDER BY {timestamp_col}, {pk_col}
            LIMIT :batch_size
        """
        
        return query.strip(), params
    
    def build_deleted_records_query(
        self,
        table_config: dict,
        checkpoint_timestamp: Optional[datetime] = None
    ) -> tuple[str, dict]:
        """Build query to extract soft-deleted records since checkpoint."""
        source_table = table_config['source_table']
        deleted_col = table_config.get('deleted_column')
        pk_col = table_config['primary_key']
        
        if not deleted_col:
            return None, None
        
        params = {}
        conditions = [f"{deleted_col} IS NOT NULL"]
        
        if checkpoint_timestamp:
            conditions.append(f"{deleted_col} > :checkpoint_ts")
            params['checkpoint_ts'] = checkpoint_timestamp
        
        where_clause = f"WHERE {' AND '.join(conditions)}"
        
        query = f"""
            SELECT {pk_col}, {deleted_col}
            FROM {source_table}
            {where_clause}
            ORDER BY {deleted_col}, {pk_col}
        """
        
        return query.strip(), params
    
    def extract_batch(
        self,
        table_name: str,
        checkpoint_timestamp: Optional[datetime] = None,
        checkpoint_id: Optional[int] = None,
        batch_size: int = None
    ) -> pd.DataFrame:
        """
        Extract a single batch of records from source database.
        
        Returns a pandas DataFrame with the extracted records.
        """
        table_config = self.get_table_config(table_name)
        
        if batch_size is None:
            batch_size = table_config.get('batch_size', 5000)
        
        query, params = self.build_extraction_query(
            table_config,
            checkpoint_timestamp,
            checkpoint_id,
            batch_size
        )
        
        self.logger.debug(
            'executing_extraction_query',
            table=table_name,
            checkpoint_ts=checkpoint_timestamp.isoformat() if checkpoint_timestamp else None,
            batch_size=batch_size
        )
        
        with self.db_manager.source_engine.connect() as conn:
            df = pd.read_sql(text(query), conn, params=params)
        
        return df
    
    def extract_changes(
        self,
        table_name: str,
        checkpoint_timestamp: Optional[datetime] = None,
        checkpoint_id: Optional[int] = None,
        batch_size: int = None
    ) -> Generator[tuple[pd.DataFrame, datetime, int], None, None]:
        """
        Generator that yields batches of changed records.
        
        Yields:
            Tuple of (DataFrame, last_timestamp, last_id) for checkpoint updates
        """
        table_config = self.get_table_config(table_name)
        timestamp_col = table_config['timestamp_column']
        pk_col = table_config['primary_key']
        
        if batch_size is None:
            batch_size = table_config.get('batch_size', 5000)
        
        current_ts = checkpoint_timestamp
        current_id = checkpoint_id
        total_extracted = 0
        
        self.logger.log_extraction_start(table_name, checkpoint_timestamp)
        start_time = datetime.now(timezone.utc)
        
        while True:
            df = self.extract_batch(
                table_name,
                current_ts,
                current_id,
                batch_size
            )
            
            if df.empty:
                break
            
            # Get last record's timestamp and ID for next iteration
            last_row = df.iloc[-1]
            current_ts = pd.to_datetime(last_row[timestamp_col])
            current_id = int(last_row[pk_col])
            
            total_extracted += len(df)
            
            self.logger.debug(
                'batch_extracted',
                table=table_name,
                records=len(df),
                total=total_extracted,
                last_ts=current_ts.isoformat(),
                last_id=current_id
            )
            
            yield df, current_ts, current_id
            
            # If we got less than batch_size, we've reached the end
            if len(df) < batch_size:
                break
        
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        self.logger.log_extraction_complete(table_name, total_extracted, duration)
    
    def extract_all(
        self,
        table_name: str,
        checkpoint_timestamp: Optional[datetime] = None,
        checkpoint_id: Optional[int] = None,
        max_records: int = None
    ) -> pd.DataFrame:
        """
        Extract all changed records into a single DataFrame.
        
        Warning: Use with caution for large datasets. Prefer extract_changes() generator.
        """
        dfs = []
        total = 0
        
        for df, _, _ in self.extract_changes(table_name, checkpoint_timestamp, checkpoint_id):
            dfs.append(df)
            total += len(df)
            
            if max_records and total >= max_records:
                break
        
        if not dfs:
            return pd.DataFrame()
        
        return pd.concat(dfs, ignore_index=True)
    
    def get_record_count(
        self,
        table_name: str,
        checkpoint_timestamp: Optional[datetime] = None
    ) -> int:
        """Get count of records to be extracted (for progress tracking)."""
        table_config = self.get_table_config(table_name)
        source_table = table_config['source_table']
        timestamp_col = table_config['timestamp_column']
        
        params = {}
        where_clause = ""
        
        if checkpoint_timestamp:
            where_clause = f"WHERE {timestamp_col} > :checkpoint_ts"
            params['checkpoint_ts'] = checkpoint_timestamp
        
        query = f"SELECT COUNT(*) as count FROM {source_table} {where_clause}"
        
        with self.db_manager.source_engine.connect() as conn:
            result = conn.execute(text(query), params)
            row = result.fetchone()
            return row[0] if row else 0
    
    def get_latest_timestamp(self, table_name: str) -> Optional[datetime]:
        """Get the latest timestamp in source table."""
        table_config = self.get_table_config(table_name)
        source_table = table_config['source_table']
        timestamp_col = table_config['timestamp_column']
        
        query = f"SELECT MAX({timestamp_col}) as max_ts FROM {source_table}"
        
        with self.db_manager.source_engine.connect() as conn:
            result = conn.execute(text(query))
            row = result.fetchone()
            return row[0] if row and row[0] else None


# Convenience function
def create_extractor() -> DataExtractor:
    """Create a new DataExtractor instance."""
    return DataExtractor()
