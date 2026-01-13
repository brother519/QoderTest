"""
Logging utilities for ETL pipeline.
Provides structured logging with console and file output.
"""

import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path
from typing import Any, Optional

import structlog
import yaml
from rich.console import Console
from rich.logging import RichHandler


def load_settings() -> dict:
    """Load settings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'settings.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


class ETLLogger:
    """
    Structured logger for ETL pipeline.
    
    Provides:
    - JSON-formatted file logs for parsing
    - Rich console output for human readability
    - Contextual logging with run_id, table_name, etc.
    """
    
    def __init__(self, name: str = 'etl_pipeline'):
        settings = load_settings()
        log_config = settings.get('logging', {})
        
        self.log_level = getattr(logging, log_config.get('level', 'INFO').upper())
        self.log_dir = Path(__file__).parent.parent.parent / log_config.get('directory', 'logs')
        self.log_format = log_config.get('format', 'json')
        self.rotation = log_config.get('rotation', 'daily')
        self.retention_count = log_config.get('retention_count', 30)
        
        # Ensure log directory exists
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure structlog
        self._configure_structlog()
        
        # Get logger
        self.logger = structlog.get_logger(name)
        
        # Track current context
        self._context: dict[str, Any] = {}
    
    def _configure_structlog(self):
        """Configure structlog with processors and output."""
        # Shared processors
        shared_processors = [
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt='iso'),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.UnicodeDecoder(),
        ]
        
        # Configure structlog
        structlog.configure(
            processors=shared_processors + [
                structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
            ],
            wrapper_class=structlog.stdlib.BoundLogger,
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
        
        # Configure standard logging
        root_logger = logging.getLogger()
        root_logger.setLevel(self.log_level)
        
        # Remove existing handlers
        root_logger.handlers = []
        
        # Console handler with Rich formatting
        console_handler = RichHandler(
            console=Console(stderr=True),
            show_time=True,
            show_path=False,
            rich_tracebacks=True,
            tracebacks_show_locals=True
        )
        console_handler.setLevel(self.log_level)
        root_logger.addHandler(console_handler)
        
        # File handler with JSON formatting
        log_file = self.log_dir / 'etl_pipeline.log'
        
        if self.rotation == 'daily':
            file_handler = TimedRotatingFileHandler(
                log_file,
                when='midnight',
                interval=1,
                backupCount=self.retention_count
            )
        else:
            file_handler = RotatingFileHandler(
                log_file,
                maxBytes=100 * 1024 * 1024,  # 100MB
                backupCount=self.retention_count
            )
        
        file_handler.setLevel(self.log_level)
        
        # JSON formatter for file
        if self.log_format == 'json':
            file_formatter = structlog.stdlib.ProcessorFormatter(
                processor=structlog.processors.JSONRenderer(),
                foreign_pre_chain=shared_processors,
            )
        else:
            file_formatter = structlog.stdlib.ProcessorFormatter(
                processor=structlog.dev.ConsoleRenderer(colors=False),
                foreign_pre_chain=shared_processors,
            )
        
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)
    
    def bind(self, **kwargs) -> 'ETLLogger':
        """Bind context variables to the logger."""
        self._context.update(kwargs)
        self.logger = self.logger.bind(**kwargs)
        return self
    
    def unbind(self, *keys) -> 'ETLLogger':
        """Remove context variables from the logger."""
        for key in keys:
            self._context.pop(key, None)
        self.logger = self.logger.unbind(*keys)
        return self
    
    def clear_context(self) -> 'ETLLogger':
        """Clear all context variables."""
        self._context = {}
        self.logger = structlog.get_logger('etl_pipeline')
        return self
    
    def debug(self, message: str, **kwargs):
        """Log debug message."""
        self.logger.debug(message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message."""
        self.logger.info(message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message."""
        self.logger.warning(message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message."""
        self.logger.error(message, **kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log exception with traceback."""
        self.logger.exception(message, **kwargs)
    
    # ETL-specific logging methods
    
    def log_extraction_start(self, table: str, checkpoint_timestamp: Optional[datetime] = None):
        """Log start of extraction for a table."""
        self.info(
            'extraction_started',
            table=table,
            checkpoint_timestamp=checkpoint_timestamp.isoformat() if checkpoint_timestamp else None
        )
    
    def log_extraction_complete(self, table: str, records_extracted: int, duration_seconds: float):
        """Log completion of extraction for a table."""
        self.info(
            'extraction_completed',
            table=table,
            records_extracted=records_extracted,
            duration_seconds=round(duration_seconds, 2)
        )
    
    def log_batch_processed(
        self,
        table: str,
        batch_number: int,
        records_extracted: int,
        records_transformed: int,
        records_valid: int,
        records_failed: int,
        records_loaded: int,
        duration_seconds: float
    ):
        """Log batch processing metrics."""
        self.info(
            'batch_processed',
            table=table,
            batch_number=batch_number,
            records_extracted=records_extracted,
            records_transformed=records_transformed,
            records_valid=records_valid,
            records_failed=records_failed,
            records_loaded=records_loaded,
            duration_seconds=round(duration_seconds, 2)
        )
    
    def log_sync_complete(
        self,
        tables_processed: int,
        total_records_synced: int,
        total_records_failed: int,
        total_duration_seconds: float
    ):
        """Log completion of full sync."""
        self.info(
            'sync_completed',
            tables_processed=tables_processed,
            total_records_synced=total_records_synced,
            total_records_failed=total_records_failed,
            total_duration_seconds=round(total_duration_seconds, 2)
        )
    
    def log_validation_error(self, table: str, record_id: Any, errors: list[str]):
        """Log validation error for a record."""
        self.warning(
            'validation_error',
            table=table,
            record_id=record_id,
            errors=errors
        )
    
    def log_load_error(self, table: str, error: str, batch_size: int):
        """Log load error for a batch."""
        self.error(
            'load_error',
            table=table,
            error=error,
            batch_size=batch_size
        )


# Global logger instance
_logger: ETLLogger = None


def get_logger(name: str = 'etl_pipeline') -> ETLLogger:
    """Get or create global logger instance."""
    global _logger
    if _logger is None:
        _logger = ETLLogger(name)
    return _logger


def reset_logger():
    """Reset the global logger (useful for testing)."""
    global _logger
    _logger = None
