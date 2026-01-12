"""Failure handler for storing and managing failed records."""

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Generator
from uuid import uuid4

from ..utils.logger import get_logger
from ..utils.config_loader import get_config

logger = get_logger(__name__)


class FailedRecord:
    """Represents a failed sync record."""
    
    def __init__(
        self,
        id: int | None = None,
        sync_batch_id: str = "",
        table_name: str = "",
        record_id: str = "",
        source_data: dict | None = None,
        transformed_data: dict | None = None,
        failure_stage: str = "",
        error_type: str = "",
        error_message: str = "",
        error_details: str = "",
        retry_count: int = 0,
        status: str = "pending",
        created_at: datetime | None = None,
        updated_at: datetime | None = None
    ):
        self.id = id
        self.sync_batch_id = sync_batch_id
        self.table_name = table_name
        self.record_id = record_id
        self.source_data = source_data or {}
        self.transformed_data = transformed_data or {}
        self.failure_stage = failure_stage
        self.error_type = error_type
        self.error_message = error_message
        self.error_details = error_details
        self.retry_count = retry_count
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "sync_batch_id": self.sync_batch_id,
            "table_name": self.table_name,
            "record_id": self.record_id,
            "source_data": self.source_data,
            "transformed_data": self.transformed_data,
            "failure_stage": self.failure_stage,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "error_details": self.error_details,
            "retry_count": self.retry_count,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_row(cls, row: tuple) -> "FailedRecord":
        """Create FailedRecord from database row."""
        return cls(
            id=row[0],
            sync_batch_id=row[1],
            table_name=row[2],
            record_id=row[3],
            source_data=json.loads(row[4]) if row[4] else {},
            transformed_data=json.loads(row[5]) if row[5] else {},
            failure_stage=row[6],
            error_type=row[7],
            error_message=row[8],
            error_details=row[9],
            retry_count=row[10],
            status=row[11],
            created_at=datetime.fromisoformat(row[12]) if row[12] else None,
            updated_at=datetime.fromisoformat(row[13]) if row[13] else None
        )


class FailureHandler:
    """Handle and store failed sync records."""
    
    def __init__(self, db_path: str | Path | None = None):
        """Initialize failure handler.
        
        Args:
            db_path: Path to failures SQLite database
        """
        if db_path is None:
            config = get_config()
            db_path = config.get("config", "paths.failures_db", "data/failures.db")
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._batch_id: str = ""
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize the failures database schema."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS failed_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sync_batch_id VARCHAR(50),
                    table_name VARCHAR(100),
                    record_id VARCHAR(100),
                    source_data TEXT,
                    transformed_data TEXT,
                    failure_stage VARCHAR(20),
                    error_type VARCHAR(50),
                    error_message TEXT,
                    error_details TEXT,
                    retry_count INTEGER DEFAULT 0,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_sync_batch 
                ON failed_records(sync_batch_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_table_status 
                ON failed_records(table_name, status)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_created_at 
                ON failed_records(created_at)
            """)
            
            conn.commit()
    
    @contextmanager
    def _get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Get a database connection."""
        conn = sqlite3.connect(str(self.db_path))
        try:
            yield conn
        finally:
            conn.close()
    
    def start_batch(self) -> str:
        """Start a new sync batch.
        
        Returns:
            Batch ID
        """
        self._batch_id = str(uuid4())[:8]
        return self._batch_id
    
    def save_failure(
        self,
        table_name: str,
        record_id: Any,
        source_data: dict | None,
        transformed_data: dict | None,
        failure_stage: str,
        error: Exception | str,
        error_details: str = ""
    ) -> int:
        """Save a failed record.
        
        Args:
            table_name: Name of the table
            record_id: Primary key value of the record
            source_data: Original source data
            transformed_data: Transformed data (if available)
            failure_stage: Stage where failure occurred (transform/validate/load)
            error: Exception or error message
            error_details: Additional error details
            
        Returns:
            ID of the saved failure record
        """
        error_type = type(error).__name__ if isinstance(error, Exception) else "Error"
        error_message = str(error)
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO failed_records (
                    sync_batch_id, table_name, record_id,
                    source_data, transformed_data,
                    failure_stage, error_type, error_message, error_details,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                """,
                (
                    self._batch_id,
                    table_name,
                    str(record_id),
                    json.dumps(source_data, default=str) if source_data else None,
                    json.dumps(transformed_data, default=str) if transformed_data else None,
                    failure_stage,
                    error_type,
                    error_message,
                    error_details
                )
            )
            conn.commit()
            return cursor.lastrowid
    
    def save_failures_batch(
        self,
        table_name: str,
        failures: list[tuple[dict, Any]],
        failure_stage: str
    ) -> int:
        """Save multiple failed records.
        
        Args:
            table_name: Name of the table
            failures: List of (record, error) tuples
            failure_stage: Stage where failure occurred
            
        Returns:
            Number of saved records
        """
        if not failures:
            return 0
        
        with self._get_connection() as conn:
            for record, error in failures:
                pk_field = "id"  # Default primary key
                record_id = record.get(pk_field, "unknown")
                
                error_type = type(error).__name__ if isinstance(error, Exception) else "Error"
                error_message = str(error)
                
                # Try to get more details from validation errors
                error_details = ""
                if hasattr(error, "errors"):
                    error_details = json.dumps(error.errors, default=str)
                elif hasattr(error, "to_dict"):
                    error_details = json.dumps(error.to_dict(), default=str)
                
                conn.execute(
                    """
                    INSERT INTO failed_records (
                        sync_batch_id, table_name, record_id,
                        source_data, transformed_data,
                        failure_stage, error_type, error_message, error_details,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                    """,
                    (
                        self._batch_id,
                        table_name,
                        str(record_id),
                        json.dumps(record, default=str),
                        None,
                        failure_stage,
                        error_type,
                        error_message,
                        error_details
                    )
                )
            conn.commit()
        
        logger.info(
            "Saved failed records",
            table=table_name,
            stage=failure_stage,
            count=len(failures)
        )
        
        return len(failures)
    
    def get_failure(self, failure_id: int) -> FailedRecord | None:
        """Get a specific failure record.
        
        Args:
            failure_id: ID of the failure record
            
        Returns:
            FailedRecord or None
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT id, sync_batch_id, table_name, record_id,
                       source_data, transformed_data,
                       failure_stage, error_type, error_message, error_details,
                       retry_count, status, created_at, updated_at
                FROM failed_records
                WHERE id = ?
                """,
                (failure_id,)
            )
            row = cursor.fetchone()
            
            if row:
                return FailedRecord.from_row(row)
            return None
    
    def get_failures(
        self,
        table_name: str | None = None,
        status: str | None = None,
        failure_stage: str | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[FailedRecord]:
        """Get failed records with optional filters.
        
        Args:
            table_name: Filter by table name
            status: Filter by status
            failure_stage: Filter by failure stage
            limit: Maximum records to return
            offset: Offset for pagination
            
        Returns:
            List of FailedRecord
        """
        conditions = []
        params = []
        
        if table_name:
            conditions.append("table_name = ?")
            params.append(table_name)
        if status:
            conditions.append("status = ?")
            params.append(status)
        if failure_stage:
            conditions.append("failure_stage = ?")
            params.append(failure_stage)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                f"""
                SELECT id, sync_batch_id, table_name, record_id,
                       source_data, transformed_data,
                       failure_stage, error_type, error_message, error_details,
                       retry_count, status, created_at, updated_at
                FROM failed_records
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                params + [limit, offset]
            )
            return [FailedRecord.from_row(row) for row in cursor.fetchall()]
    
    def get_failure_count(
        self,
        table_name: str | None = None,
        status: str | None = None
    ) -> int:
        """Get count of failed records.
        
        Args:
            table_name: Filter by table name
            status: Filter by status
            
        Returns:
            Count of matching records
        """
        conditions = []
        params = []
        
        if table_name:
            conditions.append("table_name = ?")
            params.append(table_name)
        if status:
            conditions.append("status = ?")
            params.append(status)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                f"SELECT COUNT(*) FROM failed_records WHERE {where_clause}",
                params
            )
            return cursor.fetchone()[0]
    
    def mark_resolved(self, failure_id: int) -> None:
        """Mark a failure as resolved.
        
        Args:
            failure_id: ID of the failure record
        """
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE failed_records
                SET status = 'resolved', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (failure_id,)
            )
            conn.commit()
    
    def mark_ignored(self, failure_id: int) -> None:
        """Mark a failure as ignored.
        
        Args:
            failure_id: ID of the failure record
        """
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE failed_records
                SET status = 'ignored', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (failure_id,)
            )
            conn.commit()
    
    def increment_retry(self, failure_id: int) -> int:
        """Increment retry count and return new count.
        
        Args:
            failure_id: ID of the failure record
            
        Returns:
            New retry count
        """
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE failed_records
                SET retry_count = retry_count + 1,
                    status = 'retrying',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (failure_id,)
            )
            conn.commit()
            
            cursor = conn.execute(
                "SELECT retry_count FROM failed_records WHERE id = ?",
                (failure_id,)
            )
            row = cursor.fetchone()
            return row[0] if row else 0
    
    def get_statistics(self) -> dict[str, Any]:
        """Get failure statistics.
        
        Returns:
            Statistics dictionary
        """
        with self._get_connection() as conn:
            # Total counts by status
            cursor = conn.execute("""
                SELECT status, COUNT(*) as count
                FROM failed_records
                GROUP BY status
            """)
            status_counts = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Counts by table
            cursor = conn.execute("""
                SELECT table_name, COUNT(*) as count
                FROM failed_records
                WHERE status = 'pending'
                GROUP BY table_name
            """)
            table_counts = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Counts by failure stage
            cursor = conn.execute("""
                SELECT failure_stage, COUNT(*) as count
                FROM failed_records
                WHERE status = 'pending'
                GROUP BY failure_stage
            """)
            stage_counts = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Total
            cursor = conn.execute("SELECT COUNT(*) FROM failed_records")
            total = cursor.fetchone()[0]
            
            return {
                "total": total,
                "by_status": status_counts,
                "by_table": table_counts,
                "by_stage": stage_counts,
                "pending_count": status_counts.get("pending", 0)
            }
    
    def export_to_json(
        self,
        output_path: str | Path,
        table_name: str | None = None,
        status: str | None = None
    ) -> int:
        """Export failed records to JSON file.
        
        Args:
            output_path: Output file path
            table_name: Filter by table name
            status: Filter by status
            
        Returns:
            Number of exported records
        """
        failures = self.get_failures(table_name, status, limit=100000)
        
        data = [f.to_dict() for f in failures]
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(
            "Exported failures to JSON",
            path=str(output_path),
            count=len(data)
        )
        
        return len(data)
    
    def cleanup_old_records(self, days: int = 30) -> int:
        """Delete resolved/ignored records older than specified days.
        
        Args:
            days: Records older than this will be deleted
            
        Returns:
            Number of deleted records
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                DELETE FROM failed_records
                WHERE status IN ('resolved', 'ignored')
                  AND created_at < datetime('now', ?)
                """,
                (f"-{days} days",)
            )
            conn.commit()
            
            deleted = cursor.rowcount
            logger.info(
                "Cleaned up old failure records",
                deleted=deleted,
                older_than_days=days
            )
            
            return deleted
