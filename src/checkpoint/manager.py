"""Checkpoint manager for tracking sync progress and enabling resume."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Generator

from ..utils.logger import get_logger
from ..utils.config_loader import get_config

logger = get_logger(__name__)


class Checkpoint:
    """Represents a sync checkpoint for a table."""
    
    def __init__(
        self,
        table_name: str,
        last_sync_timestamp: datetime | None = None,
        last_processed_offset: int = 0,
        total_records: int = 0,
        processed_records: int = 0,
        sync_status: str = "pending",
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
        error_message: str | None = None
    ):
        self.table_name = table_name
        self.last_sync_timestamp = last_sync_timestamp
        self.last_processed_offset = last_processed_offset
        self.total_records = total_records
        self.processed_records = processed_records
        self.sync_status = sync_status
        self.started_at = started_at
        self.completed_at = completed_at
        self.error_message = error_message
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "table_name": self.table_name,
            "last_sync_timestamp": self.last_sync_timestamp.isoformat() if self.last_sync_timestamp else None,
            "last_processed_offset": self.last_processed_offset,
            "total_records": self.total_records,
            "processed_records": self.processed_records,
            "sync_status": self.sync_status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error_message": self.error_message
        }
    
    @classmethod
    def from_row(cls, row: tuple) -> "Checkpoint":
        """Create Checkpoint from database row."""
        return cls(
            table_name=row[0],
            last_sync_timestamp=datetime.fromisoformat(row[1]) if row[1] else None,
            last_processed_offset=row[2] or 0,
            total_records=row[3] or 0,
            processed_records=row[4] or 0,
            sync_status=row[5] or "pending",
            started_at=datetime.fromisoformat(row[6]) if row[6] else None,
            completed_at=datetime.fromisoformat(row[7]) if row[7] else None,
            error_message=row[8]
        )


class CheckpointManager:
    """Manage sync checkpoints using SQLite storage."""
    
    def __init__(self, db_path: str | Path | None = None):
        """Initialize checkpoint manager.
        
        Args:
            db_path: Path to checkpoint SQLite database
        """
        if db_path is None:
            config = get_config()
            db_path = config.get("config", "paths.checkpoint_db", "data/checkpoint.db")
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize the checkpoint database schema."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS checkpoints (
                    table_name VARCHAR(100) PRIMARY KEY,
                    last_sync_timestamp TEXT,
                    last_processed_offset INTEGER DEFAULT 0,
                    total_records INTEGER DEFAULT 0,
                    processed_records INTEGER DEFAULT 0,
                    sync_status VARCHAR(20) DEFAULT 'pending',
                    started_at TEXT,
                    completed_at TEXT,
                    error_message TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create index for status queries
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_sync_status 
                ON checkpoints(sync_status)
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
    
    def get_checkpoint(self, table_name: str) -> Checkpoint | None:
        """Get checkpoint for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Checkpoint or None if not found
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT table_name, last_sync_timestamp, last_processed_offset,
                       total_records, processed_records, sync_status,
                       started_at, completed_at, error_message
                FROM checkpoints
                WHERE table_name = ?
                """,
                (table_name,)
            )
            row = cursor.fetchone()
            
            if row:
                return Checkpoint.from_row(row)
            return None
    
    def save_checkpoint(self, checkpoint: Checkpoint) -> None:
        """Save or update a checkpoint.
        
        Args:
            checkpoint: Checkpoint to save
        """
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO checkpoints (
                    table_name, last_sync_timestamp, last_processed_offset,
                    total_records, processed_records, sync_status,
                    started_at, completed_at, error_message, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(table_name) DO UPDATE SET
                    last_sync_timestamp = excluded.last_sync_timestamp,
                    last_processed_offset = excluded.last_processed_offset,
                    total_records = excluded.total_records,
                    processed_records = excluded.processed_records,
                    sync_status = excluded.sync_status,
                    started_at = excluded.started_at,
                    completed_at = excluded.completed_at,
                    error_message = excluded.error_message,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (
                    checkpoint.table_name,
                    checkpoint.last_sync_timestamp.isoformat() if checkpoint.last_sync_timestamp else None,
                    checkpoint.last_processed_offset,
                    checkpoint.total_records,
                    checkpoint.processed_records,
                    checkpoint.sync_status,
                    checkpoint.started_at.isoformat() if checkpoint.started_at else None,
                    checkpoint.completed_at.isoformat() if checkpoint.completed_at else None,
                    checkpoint.error_message
                )
            )
            conn.commit()
        
        logger.debug(
            "Checkpoint saved",
            table=checkpoint.table_name,
            status=checkpoint.sync_status,
            offset=checkpoint.last_processed_offset
        )
    
    def start_sync(self, table_name: str, total_records: int = 0) -> Checkpoint:
        """Mark sync as started for a table.
        
        Args:
            table_name: Name of the table
            total_records: Total records to sync
            
        Returns:
            Updated checkpoint
        """
        existing = self.get_checkpoint(table_name)
        
        checkpoint = Checkpoint(
            table_name=table_name,
            last_sync_timestamp=existing.last_sync_timestamp if existing else None,
            last_processed_offset=existing.last_processed_offset if existing else 0,
            total_records=total_records,
            processed_records=existing.processed_records if existing else 0,
            sync_status="running",
            started_at=datetime.now(),
            completed_at=None,
            error_message=None
        )
        
        self.save_checkpoint(checkpoint)
        return checkpoint
    
    def update_progress(
        self,
        table_name: str,
        processed_count: int,
        last_timestamp: datetime | None = None,
        offset: int | None = None
    ) -> None:
        """Update sync progress.
        
        Args:
            table_name: Name of the table
            processed_count: Number of records processed so far
            last_timestamp: Last processed timestamp
            offset: Current offset
        """
        checkpoint = self.get_checkpoint(table_name)
        if checkpoint:
            checkpoint.processed_records = processed_count
            if last_timestamp:
                checkpoint.last_sync_timestamp = last_timestamp
            if offset is not None:
                checkpoint.last_processed_offset = offset
            self.save_checkpoint(checkpoint)
    
    def complete_sync(
        self,
        table_name: str,
        last_timestamp: datetime | None = None
    ) -> None:
        """Mark sync as completed.
        
        Args:
            table_name: Name of the table
            last_timestamp: Last synced timestamp
        """
        checkpoint = self.get_checkpoint(table_name)
        if checkpoint:
            checkpoint.sync_status = "completed"
            checkpoint.completed_at = datetime.now()
            checkpoint.last_processed_offset = 0  # Reset for next sync
            if last_timestamp:
                checkpoint.last_sync_timestamp = last_timestamp
            checkpoint.error_message = None
            self.save_checkpoint(checkpoint)
            
            logger.info(
                "Sync completed",
                table=table_name,
                processed=checkpoint.processed_records
            )
    
    def fail_sync(self, table_name: str, error_message: str) -> None:
        """Mark sync as failed.
        
        Args:
            table_name: Name of the table
            error_message: Error description
        """
        checkpoint = self.get_checkpoint(table_name)
        if checkpoint:
            checkpoint.sync_status = "failed"
            checkpoint.completed_at = datetime.now()
            checkpoint.error_message = error_message
            self.save_checkpoint(checkpoint)
            
            logger.error(
                "Sync failed",
                table=table_name,
                error=error_message
            )
    
    def get_running_syncs(self) -> list[Checkpoint]:
        """Get all currently running syncs.
        
        Returns:
            List of running checkpoints
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT table_name, last_sync_timestamp, last_processed_offset,
                       total_records, processed_records, sync_status,
                       started_at, completed_at, error_message
                FROM checkpoints
                WHERE sync_status = 'running'
                """
            )
            return [Checkpoint.from_row(row) for row in cursor.fetchall()]
    
    def get_all_checkpoints(self) -> list[Checkpoint]:
        """Get all checkpoints.
        
        Returns:
            List of all checkpoints
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT table_name, last_sync_timestamp, last_processed_offset,
                       total_records, processed_records, sync_status,
                       started_at, completed_at, error_message
                FROM checkpoints
                ORDER BY table_name
                """
            )
            return [Checkpoint.from_row(row) for row in cursor.fetchall()]
    
    def has_incomplete_sync(self, table_name: str) -> bool:
        """Check if a table has an incomplete sync.
        
        Args:
            table_name: Name of the table
            
        Returns:
            True if there's an incomplete sync
        """
        checkpoint = self.get_checkpoint(table_name)
        return checkpoint is not None and checkpoint.sync_status == "running"
    
    def reset_checkpoint(self, table_name: str) -> None:
        """Reset checkpoint for a table (start fresh).
        
        Args:
            table_name: Name of the table
        """
        with self._get_connection() as conn:
            conn.execute(
                "DELETE FROM checkpoints WHERE table_name = ?",
                (table_name,)
            )
            conn.commit()
        
        logger.info("Checkpoint reset", table=table_name)
    
    def clear_all(self) -> None:
        """Clear all checkpoints."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM checkpoints")
            conn.commit()
        
        logger.info("All checkpoints cleared")
