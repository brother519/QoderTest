"""Structured logging module with JSON output and daily rotation."""

import logging
import sys
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from typing import Any

import structlog

from .config_loader import get_config


class LoggerSetup:
    """Setup and manage application logging."""
    
    _initialized = False
    
    @classmethod
    def setup(cls, log_dir: str | Path | None = None) -> None:
        """Initialize logging configuration.
        
        Args:
            log_dir: Optional log directory path
        """
        if cls._initialized:
            return
        
        config = get_config()
        
        try:
            log_config = config.get("config", "logging", {})
        except FileNotFoundError:
            log_config = {}
        
        level_str = log_config.get("level", "INFO")
        log_format = log_config.get("format", "json")
        
        if log_dir is None:
            log_dir = Path(__file__).parent.parent.parent / "logs"
        else:
            log_dir = Path(log_dir)
        
        log_dir.mkdir(parents=True, exist_ok=True)
        
        level = getattr(logging, level_str.upper(), logging.INFO)
        
        # Configure structlog
        processors = [
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.UnicodeDecoder(),
        ]
        
        if log_format == "json":
            processors.append(structlog.processors.JSONRenderer())
        else:
            processors.append(structlog.dev.ConsoleRenderer())
        
        structlog.configure(
            processors=processors,
            wrapper_class=structlog.stdlib.BoundLogger,
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(level)
        
        # Clear existing handlers
        root_logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
        
        # File handlers with rotation
        cls._add_file_handler(
            root_logger, log_dir / "sync.log", level
        )
        cls._add_file_handler(
            root_logger, log_dir / "error.log", logging.ERROR
        )
        
        cls._initialized = True
    
    @classmethod
    def _add_file_handler(
        cls,
        logger: logging.Logger,
        filepath: Path,
        level: int
    ) -> None:
        """Add a rotating file handler to the logger."""
        handler = TimedRotatingFileHandler(
            filepath,
            when="midnight",
            interval=1,
            backupCount=30,
            encoding="utf-8"
        )
        handler.setLevel(level)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        ))
        logger.addHandler(handler)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a structured logger instance.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        Configured structlog logger
    """
    LoggerSetup.setup()
    return structlog.get_logger(name)


class SyncLogger:
    """Specialized logger for sync operations with structured context."""
    
    def __init__(self, table_name: str | None = None, batch_id: str | None = None):
        self._logger = get_logger("etl.sync")
        self._context: dict[str, Any] = {}
        if table_name:
            self._context["table"] = table_name
        if batch_id:
            self._context["batch_id"] = batch_id
    
    def _log(self, level: str, message: str, **kwargs: Any) -> None:
        """Log with context."""
        log_method = getattr(self._logger, level)
        log_method(message, **{**self._context, **kwargs})
    
    def info(self, message: str, **kwargs: Any) -> None:
        self._log("info", message, **kwargs)
    
    def warning(self, message: str, **kwargs: Any) -> None:
        self._log("warning", message, **kwargs)
    
    def error(self, message: str, **kwargs: Any) -> None:
        self._log("error", message, **kwargs)
    
    def debug(self, message: str, **kwargs: Any) -> None:
        self._log("debug", message, **kwargs)
    
    def with_context(self, **kwargs: Any) -> "SyncLogger":
        """Create a new logger with additional context."""
        new_logger = SyncLogger()
        new_logger._logger = self._logger
        new_logger._context = {**self._context, **kwargs}
        return new_logger
    
    def sync_started(self, total_tables: int) -> None:
        """Log sync job started."""
        self.info("Sync job started", total_tables=total_tables)
    
    def sync_completed(self, duration_seconds: float, total_records: int) -> None:
        """Log sync job completed."""
        self.info(
            "Sync job completed",
            duration_seconds=round(duration_seconds, 2),
            total_records=total_records
        )
    
    def table_sync_started(self, total_records: int) -> None:
        """Log table sync started."""
        self.info("Table sync started", total_records=total_records)
    
    def table_sync_completed(self, success: int, failed: int, duration_seconds: float) -> None:
        """Log table sync completed."""
        self.info(
            "Table sync completed",
            success_count=success,
            failed_count=failed,
            duration_seconds=round(duration_seconds, 2)
        )
    
    def batch_processed(self, batch_num: int, success: int, failed: int) -> None:
        """Log batch processed."""
        self.info(
            "Batch processed",
            batch_num=batch_num,
            success_count=success,
            failed_count=failed
        )
    
    def record_failed(self, record_id: Any, stage: str, error: str) -> None:
        """Log individual record failure."""
        self.warning(
            "Record sync failed",
            record_id=str(record_id),
            stage=stage,
            error=error
        )
    
    def checkpoint_saved(self, timestamp: datetime, offset: int) -> None:
        """Log checkpoint saved."""
        self.debug(
            "Checkpoint saved",
            timestamp=timestamp.isoformat(),
            offset=offset
        )
