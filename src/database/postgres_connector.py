"""PostgreSQL database connector."""

from typing import Any

from sqlalchemy import text

from .base import BaseConnector
from ..utils.logger import get_logger

logger = get_logger(__name__)


class PostgresConnector(BaseConnector):
    """PostgreSQL database connector with connection pooling."""
    
    def _build_connection_url(self) -> str:
        """Build PostgreSQL connection URL."""
        host = self.config.get("host", "localhost")
        port = self.config.get("port", 5432)
        database = self.config.get("database", "")
        user = self.config.get("user", "postgres")
        password = self.config.get("password", "")
        
        # URL encode password if it contains special characters
        from urllib.parse import quote_plus
        encoded_password = quote_plus(password) if password else ""
        
        url = f"postgresql+psycopg2://{user}:{encoded_password}@{host}:{port}/{database}"
        
        return url
    
    def bulk_insert(
        self,
        table_name: str,
        records: list[dict[str, Any]],
        columns: list[str] | None = None
    ) -> int:
        """Bulk insert records into a table.
        
        Args:
            table_name: Target table name
            records: List of record dictionaries
            columns: Optional list of columns to insert
            
        Returns:
            Number of inserted records
        """
        if not records:
            return 0
        
        if columns is None:
            columns = list(records[0].keys())
        
        placeholders = ", ".join([f":{col}" for col in columns])
        columns_str = ", ".join(columns)
        
        query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
        
        with self.get_session() as session:
            session.execute(text(query), records)
        
        return len(records)
    
    def bulk_upsert(
        self,
        table_name: str,
        records: list[dict[str, Any]],
        primary_key: str | list[str],
        columns: list[str] | None = None
    ) -> int:
        """Bulk upsert (insert or update) records.
        
        Args:
            table_name: Target table name
            records: List of record dictionaries
            primary_key: Primary key column(s)
            columns: Optional list of columns
            
        Returns:
            Number of affected records
        """
        if not records:
            return 0
        
        if columns is None:
            columns = list(records[0].keys())
        
        if isinstance(primary_key, str):
            primary_key = [primary_key]
        
        placeholders = ", ".join([f":{col}" for col in columns])
        columns_str = ", ".join(columns)
        pk_str = ", ".join(primary_key)
        
        # Build UPDATE SET clause (exclude primary key columns)
        update_cols = [c for c in columns if c not in primary_key]
        update_str = ", ".join([f"{col} = EXCLUDED.{col}" for col in update_cols])
        
        query = f"""
            INSERT INTO {table_name} ({columns_str}) 
            VALUES ({placeholders})
            ON CONFLICT ({pk_str}) 
            DO UPDATE SET {update_str}
        """
        
        with self.get_session() as session:
            session.execute(text(query), records)
        
        return len(records)
    
    def bulk_delete(
        self,
        table_name: str,
        ids: list[Any],
        id_column: str = "id"
    ) -> int:
        """Bulk delete records by IDs.
        
        Args:
            table_name: Target table name
            ids: List of IDs to delete
            id_column: ID column name
            
        Returns:
            Number of deleted records
        """
        if not ids:
            return 0
        
        # Use ANY for efficient bulk delete
        query = f"DELETE FROM {table_name} WHERE {id_column} = ANY(:ids)"
        
        with self.get_session() as session:
            result = session.execute(text(query), {"ids": ids})
            return result.rowcount
    
    def soft_delete(
        self,
        table_name: str,
        ids: list[Any],
        id_column: str = "id",
        deleted_field: str = "deleted_at"
    ) -> int:
        """Soft delete records by setting deleted timestamp.
        
        Args:
            table_name: Target table name
            ids: List of IDs to soft delete
            id_column: ID column name
            deleted_field: Deleted timestamp field name
            
        Returns:
            Number of updated records
        """
        if not ids:
            return 0
        
        query = f"""
            UPDATE {table_name} 
            SET {deleted_field} = NOW() 
            WHERE {id_column} = ANY(:ids)
        """
        
        with self.get_session() as session:
            result = session.execute(text(query), {"ids": ids})
            return result.rowcount
    
    def get_table_columns(self, table_name: str) -> list[dict[str, Any]]:
        """Get column information for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of column info dictionaries
        """
        query = """
            SELECT 
                column_name as name,
                data_type as type,
                is_nullable as nullable,
                column_default as default_value,
                character_maximum_length as max_length,
                numeric_precision as precision,
                numeric_scale as scale
            FROM information_schema.columns
            WHERE table_name = :table_name
            ORDER BY ordinal_position
        """
        return self.fetch_all(query, {"table_name": table_name})
    
    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists.
        
        Args:
            table_name: Name of the table
            
        Returns:
            True if table exists
        """
        query = """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = :table_name
            )
        """
        result = self.fetch_all(query, {"table_name": table_name})
        return result[0]["exists"] if result else False
    
    def get_record_count(self, table_name: str) -> int:
        """Get total record count for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Record count
        """
        query = f"SELECT COUNT(*) as cnt FROM {table_name}"
        result = self.fetch_all(query)
        return result[0]["cnt"] if result else 0
