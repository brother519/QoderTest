"""Metrics collection and storage for monitoring."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Generator

from ..utils.config_loader import get_config
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MetricsCollector:
    """Collect and store sync metrics."""
    
    def __init__(self, db_path: str | Path | None = None):
        """Initialize metrics collector.
        
        Args:
            db_path: Path to metrics SQLite database
        """
        if db_path is None:
            config = get_config()
            db_path = config.get("config", "paths.metrics_db", "data/metrics.db")
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize metrics database schema."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sync_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    batch_id VARCHAR(50),
                    table_name VARCHAR(100),
                    started_at TEXT,
                    completed_at TEXT,
                    duration_seconds REAL,
                    total_records INTEGER DEFAULT 0,
                    success_count INTEGER DEFAULT 0,
                    failed_count INTEGER DEFAULT 0,
                    deleted_count INTEGER DEFAULT 0,
                    extract_duration REAL,
                    transform_duration REAL,
                    validate_duration REAL,
                    load_duration REAL,
                    status VARCHAR(20),
                    error_message TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_table 
                ON sync_metrics(table_name, created_at)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_batch 
                ON sync_metrics(batch_id)
            """)
            
            # Health check metrics
            conn.execute("""
                CREATE TABLE IF NOT EXISTS health_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name VARCHAR(50),
                    metric_value REAL,
                    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    @contextmanager
    def _get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Get database connection."""
        conn = sqlite3.connect(str(self.db_path))
        try:
            yield conn
        finally:
            conn.close()
    
    def record_sync(
        self,
        batch_id: str,
        table_name: str,
        started_at: datetime,
        completed_at: datetime,
        success_count: int,
        failed_count: int,
        deleted_count: int = 0,
        status: str = "completed",
        error_message: str | None = None,
        phase_durations: dict[str, float] | None = None
    ) -> None:
        """Record a sync operation metrics.
        
        Args:
            batch_id: Sync batch ID
            table_name: Table name
            started_at: Start time
            completed_at: Completion time
            success_count: Successful records
            failed_count: Failed records
            deleted_count: Deleted records
            status: Sync status
            error_message: Error message if failed
            phase_durations: Dictionary of phase durations
        """
        duration = (completed_at - started_at).total_seconds()
        phase_durations = phase_durations or {}
        
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sync_metrics (
                    batch_id, table_name, started_at, completed_at,
                    duration_seconds, total_records, success_count, failed_count, deleted_count,
                    extract_duration, transform_duration, validate_duration, load_duration,
                    status, error_message
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    batch_id,
                    table_name,
                    started_at.isoformat(),
                    completed_at.isoformat(),
                    duration,
                    success_count + failed_count,
                    success_count,
                    failed_count,
                    deleted_count,
                    phase_durations.get("extract"),
                    phase_durations.get("transform"),
                    phase_durations.get("validate"),
                    phase_durations.get("load"),
                    status,
                    error_message
                )
            )
            conn.commit()
    
    def record_health_metric(self, metric_name: str, value: float) -> None:
        """Record a health metric.
        
        Args:
            metric_name: Name of the metric
            value: Metric value
        """
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO health_metrics (metric_name, metric_value) VALUES (?, ?)",
                (metric_name, value)
            )
            conn.commit()
    
    def get_recent_syncs(
        self,
        table_name: str | None = None,
        limit: int = 10
    ) -> list[dict[str, Any]]:
        """Get recent sync metrics.
        
        Args:
            table_name: Filter by table name
            limit: Maximum records
            
        Returns:
            List of sync metrics
        """
        with self._get_connection() as conn:
            if table_name:
                cursor = conn.execute(
                    """
                    SELECT * FROM sync_metrics
                    WHERE table_name = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (table_name, limit)
                )
            else:
                cursor = conn.execute(
                    """
                    SELECT * FROM sync_metrics
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (limit,)
                )
            
            columns = [d[0] for d in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_daily_stats(self, days: int = 7) -> list[dict[str, Any]]:
        """Get daily aggregated statistics.
        
        Args:
            days: Number of days to include
            
        Returns:
            List of daily stats
        """
        since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT 
                    date(created_at) as date,
                    COUNT(*) as sync_count,
                    SUM(success_count) as total_success,
                    SUM(failed_count) as total_failed,
                    AVG(duration_seconds) as avg_duration,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as error_count
                FROM sync_metrics
                WHERE date(created_at) >= ?
                GROUP BY date(created_at)
                ORDER BY date DESC
                """,
                (since,)
            )
            
            columns = [d[0] for d in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_table_stats(self) -> list[dict[str, Any]]:
        """Get per-table statistics.
        
        Returns:
            List of table stats
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT 
                    table_name,
                    COUNT(*) as sync_count,
                    SUM(success_count) as total_success,
                    SUM(failed_count) as total_failed,
                    AVG(duration_seconds) as avg_duration,
                    MAX(completed_at) as last_sync,
                    ROUND(SUM(failed_count) * 100.0 / NULLIF(SUM(success_count + failed_count), 0), 2) as failure_rate
                FROM sync_metrics
                GROUP BY table_name
                ORDER BY table_name
                """
            )
            
            columns = [d[0] for d in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_hourly_throughput(self, hours: int = 24) -> list[dict[str, Any]]:
        """Get hourly throughput statistics.
        
        Args:
            hours: Number of hours to include
            
        Returns:
            List of hourly stats
        """
        since = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT 
                    strftime('%Y-%m-%d %H:00', created_at) as hour,
                    SUM(success_count + failed_count) as records,
                    SUM(success_count) as success,
                    SUM(failed_count) as failed,
                    AVG(duration_seconds) as avg_duration
                FROM sync_metrics
                WHERE created_at >= ?
                GROUP BY strftime('%Y-%m-%d %H:00', created_at)
                ORDER BY hour
                """,
                (since,)
            )
            
            columns = [d[0] for d in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_current_failure_rate(self, hours: int = 24) -> float:
        """Get current failure rate over specified period.
        
        Args:
            hours: Period in hours
            
        Returns:
            Failure rate percentage
        """
        since = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT 
                    SUM(failed_count) as failed,
                    SUM(success_count + failed_count) as total
                FROM sync_metrics
                WHERE created_at >= ?
                """,
                (since,)
            )
            row = cursor.fetchone()
            
            if row and row[1] and row[1] > 0:
                return round((row[0] or 0) / row[1] * 100, 2)
            return 0.0
    
    def cleanup_old_metrics(self, days: int = 90) -> int:
        """Delete metrics older than specified days.
        
        Args:
            days: Records older than this will be deleted
            
        Returns:
            Number of deleted records
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                DELETE FROM sync_metrics
                WHERE created_at < datetime('now', ?)
                """,
                (f"-{days} days",)
            )
            
            cursor.execute(
                """
                DELETE FROM health_metrics
                WHERE recorded_at < datetime('now', ?)
                """,
                (f"-{days} days",)
            )
            
            conn.commit()
            return cursor.rowcount
