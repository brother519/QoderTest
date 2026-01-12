"""MySQL database connector."""

from typing import Any

from .base import BaseConnector


class MySQLConnector(BaseConnector):
    """MySQL database connector with connection pooling."""
    
    def _build_connection_url(self) -> str:
        """Build MySQL connection URL."""
        host = self.config.get("host", "localhost")
        port = self.config.get("port", 3306)
        database = self.config.get("database", "")
        user = self.config.get("user", "root")
        password = self.config.get("password", "")
        charset = self.config.get("charset", "utf8mb4")
        
        # URL encode password if it contains special characters
        from urllib.parse import quote_plus
        encoded_password = quote_plus(password) if password else ""
        
        url = f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{database}"
        url += f"?charset={charset}"
        
        return url
    
    def get_table_columns(self, table_name: str) -> list[dict[str, Any]]:
        """Get column information for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of column info dictionaries
        """
        query = """
            SELECT 
                COLUMN_NAME as name,
                DATA_TYPE as type,
                IS_NULLABLE as nullable,
                COLUMN_DEFAULT as default_value,
                CHARACTER_MAXIMUM_LENGTH as max_length,
                NUMERIC_PRECISION as precision,
                NUMERIC_SCALE as scale
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = :database AND TABLE_NAME = :table_name
            ORDER BY ORDINAL_POSITION
        """
        return self.fetch_all(query, {
            "database": self.config.get("database"),
            "table_name": table_name
        })
    
    def get_primary_key(self, table_name: str) -> list[str]:
        """Get primary key columns for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of primary key column names
        """
        query = """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = :database 
              AND TABLE_NAME = :table_name
              AND CONSTRAINT_NAME = 'PRIMARY'
            ORDER BY ORDINAL_POSITION
        """
        result = self.fetch_all(query, {
            "database": self.config.get("database"),
            "table_name": table_name
        })
        return [row["COLUMN_NAME"] for row in result]
    
    def get_record_count(
        self,
        table_name: str,
        timestamp_field: str | None = None,
        since: str | None = None
    ) -> int:
        """Get count of records, optionally filtered by timestamp.
        
        Args:
            table_name: Name of the table
            timestamp_field: Optional timestamp field name
            since: Optional timestamp to filter records after
            
        Returns:
            Record count
        """
        if timestamp_field and since:
            query = f"SELECT COUNT(*) as cnt FROM {table_name} WHERE {timestamp_field} > :since"
            result = self.fetch_all(query, {"since": since})
        else:
            query = f"SELECT COUNT(*) as cnt FROM {table_name}"
            result = self.fetch_all(query)
        
        return result[0]["cnt"] if result else 0
    
    def get_all_primary_keys(self, table_name: str, pk_column: str) -> set[Any]:
        """Get all primary key values from a table.
        
        Used for deletion detection via snapshot comparison.
        
        Args:
            table_name: Name of the table
            pk_column: Primary key column name
            
        Returns:
            Set of primary key values
        """
        query = f"SELECT {pk_column} FROM {table_name}"
        result = self.fetch_all(query)
        return {row[pk_column] for row in result}
