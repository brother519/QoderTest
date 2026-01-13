"""Pipeline orchestrator for coordinating the ETL sync process."""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Any

from tqdm import tqdm

from ..database.mysql_connector import MySQLConnector
from ..database.postgres_connector import PostgresConnector
from ..checkpoint.manager import CheckpointManager
from ..failure.handler import FailureHandler
from ..utils.config_loader import get_config
from ..utils.logger import get_logger, SyncLogger
from .extractor import Extractor
from .transformer import Transformer
from .validator import Validator
from .loader import Loader

logger = get_logger(__name__)


class SyncResult:
    """Result of a sync operation."""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.success_count = 0
        self.failed_count = 0
        self.deleted_count = 0
        self.duration_seconds = 0.0
        self.error: str | None = None
        self.started_at: datetime | None = None
        self.completed_at: datetime | None = None
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "table_name": self.table_name,
            "success_count": self.success_count,
            "failed_count": self.failed_count,
            "deleted_count": self.deleted_count,
            "duration_seconds": round(self.duration_seconds, 2),
            "error": self.error,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class Pipeline:
    """Orchestrate the ETL sync pipeline."""
    
    def __init__(
        self,
        source_connector: MySQLConnector | None = None,
        target_connector: PostgresConnector | None = None,
        checkpoint_manager: CheckpointManager | None = None,
        failure_handler: FailureHandler | None = None
    ):
        """Initialize pipeline.
        
        Args:
            source_connector: MySQL source connector
            target_connector: PostgreSQL target connector
            checkpoint_manager: Checkpoint manager
            failure_handler: Failure handler
        """
        self.config = get_config()
        
        # Initialize connectors if not provided
        db_config = self.config.database_config
        self.source = source_connector or MySQLConnector(db_config["source"])
        self.target = target_connector or PostgresConnector(db_config["target"])
        
        # Initialize managers
        self.checkpoint = checkpoint_manager or CheckpointManager()
        self.failures = failure_handler or FailureHandler()
        
        # Load sync config
        sync_config = self.config.get("config", "sync", {})
        self.batch_size = sync_config.get("batch_size", 2000)
        self.max_workers = sync_config.get("max_workers", 4)
        
        # Load table mappings
        self.mapping_config = self.config.mapping_config
        self.table_mappings = self.mapping_config.get("table_mappings", {})
        self.global_settings = self.mapping_config.get("global_settings", {})
        
        self._logger = SyncLogger()
    
    def run_sync(
        self,
        tables: list[str] | None = None,
        full_sync: bool = False,
        resume: bool = True
    ) -> dict[str, SyncResult]:
        """Run sync for specified tables or all tables.
        
        Args:
            tables: List of tables to sync, or None for all
            full_sync: If True, ignore checkpoints and sync all data
            resume: If True, resume from last checkpoint
            
        Returns:
            Dictionary of table name to SyncResult
        """
        start_time = time.time()
        
        # Determine tables to sync
        if tables is None:
            tables = list(self.table_mappings.keys())
        
        self._logger.sync_started(len(tables))
        self.failures.start_batch()
        
        results: dict[str, SyncResult] = {}
        
        # Check for incomplete syncs if resuming
        if resume and not full_sync:
            incomplete = self.checkpoint.get_running_syncs()
            if incomplete:
                logger.warning(
                    "Found incomplete syncs",
                    tables=[c.table_name for c in incomplete]
                )
        
        # Sync tables
        if self.max_workers > 1 and len(tables) > 1:
            # Parallel execution
            results = self._sync_parallel(tables, full_sync)
        else:
            # Sequential execution
            for table_name in tables:
                results[table_name] = self._sync_table(table_name, full_sync)
        
        # Calculate totals
        total_success = sum(r.success_count for r in results.values())
        total_failed = sum(r.failed_count for r in results.values())
        total_duration = time.time() - start_time
        
        self._logger.sync_completed(total_duration, total_success + total_failed)
        
        return results
    
    def _sync_parallel(
        self,
        tables: list[str],
        full_sync: bool
    ) -> dict[str, SyncResult]:
        """Sync multiple tables in parallel.
        
        Args:
            tables: Tables to sync
            full_sync: Full sync flag
            
        Returns:
            Dictionary of results
        """
        results: dict[str, SyncResult] = {}
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self._sync_table, table, full_sync): table
                for table in tables
            }
            
            for future in as_completed(futures):
                table = futures[future]
                try:
                    results[table] = future.result()
                except Exception as e:
                    result = SyncResult(table)
                    result.error = str(e)
                    results[table] = result
                    logger.error(f"Parallel sync failed for {table}", error=str(e))
        
        return results
    
    def _sync_table(self, table_name: str, full_sync: bool = False) -> SyncResult:
        """Sync a single table.
        
        Args:
            table_name: Name of the table (mapping key)
            full_sync: If True, sync all data ignoring checkpoint
            
        Returns:
            SyncResult
        """
        result = SyncResult(table_name)
        result.started_at = datetime.now()
        start_time = time.time()
        
        table_config = self.table_mappings.get(table_name)
        if not table_config:
            result.error = f"No mapping found for table: {table_name}"
            logger.error(result.error)
            return result
        
        sync_logger = SyncLogger(table_name=table_name)
        
        try:
            # Initialize components
            extractor = Extractor(self.source, table_config, self.batch_size)
            transformer = Transformer(table_config, self.global_settings)
            validator = Validator(table_config)
            loader = Loader(self.target, table_config)
            
            # Get checkpoint
            checkpoint = self.checkpoint.get_checkpoint(table_name)
            
            # Determine starting point
            if full_sync:
                since = None
                offset = 0
            elif checkpoint and checkpoint.sync_status == "running":
                # Resume from incomplete sync
                since = checkpoint.last_sync_timestamp
                offset = checkpoint.last_processed_offset
                logger.info(f"Resuming sync from offset {offset}")
            else:
                since = checkpoint.last_sync_timestamp if checkpoint else None
                offset = 0
            
            # Get total count
            total_count = extractor.get_total_count(since)
            
            if total_count == 0:
                sync_logger.info("No records to sync")
                result.completed_at = datetime.now()
                result.duration_seconds = time.time() - start_time
                return result
            
            sync_logger.table_sync_started(total_count)
            
            # Start checkpoint
            self.checkpoint.start_sync(table_name, total_count)
            
            # Process in batches
            processed = offset
            batch_num = 0
            last_timestamp = since
            
            # Use tqdm for progress
            with tqdm(
                total=total_count,
                initial=processed,
                desc=f"Syncing {table_name}",
                unit="records"
            ) as pbar:
                for batch in extractor.detect_changes(since, offset):
                    batch_num += 1
                    
                    # Transform
                    transformed, transform_failed = transformer.transform_batch(batch)
                    
                    if transform_failed:
                        self.failures.save_failures_batch(
                            table_name,
                            [(r, e) for r, e in transform_failed],
                            "transform"
                        )
                        result.failed_count += len(transform_failed)
                    
                    # Validate
                    valid, validate_failed = validator.validate_batch(transformed)
                    
                    if validate_failed:
                        self.failures.save_failures_batch(
                            table_name,
                            [(r, v) for r, v in validate_failed],
                            "validate"
                        )
                        result.failed_count += len(validate_failed)
                    
                    # Load
                    if valid:
                        success_count, load_failed = loader.load_batch(valid)
                        result.success_count += success_count
                        
                        if load_failed:
                            self.failures.save_failures_batch(
                                table_name,
                                [(r, "Load failed") for r in load_failed],
                                "load"
                            )
                            result.failed_count += len(load_failed)
                    
                    # Update progress
                    processed += len(batch)
                    pbar.update(len(batch))
                    
                    # Update checkpoint
                    if batch:
                        ts_field = table_config.get("timestamp_field", "updated_at")
                        last_record = batch[-1]
                        if ts_field in last_record and last_record[ts_field]:
                            last_timestamp = last_record[ts_field]
                    
                    self.checkpoint.update_progress(
                        table_name,
                        processed,
                        last_timestamp,
                        processed
                    )
                    
                    sync_logger.batch_processed(
                        batch_num,
                        result.success_count,
                        result.failed_count
                    )
            
            # Handle deletes
            deleted = self._process_deletes(table_name, table_config, extractor, loader, since)
            result.deleted_count = deleted
            
            # Complete sync
            self.checkpoint.complete_sync(table_name, last_timestamp or datetime.now())
            
            result.completed_at = datetime.now()
            result.duration_seconds = time.time() - start_time
            
            sync_logger.table_sync_completed(
                result.success_count,
                result.failed_count,
                result.duration_seconds
            )
            
        except Exception as e:
            result.error = str(e)
            result.completed_at = datetime.now()
            result.duration_seconds = time.time() - start_time
            
            self.checkpoint.fail_sync(table_name, str(e))
            logger.error(f"Table sync failed: {table_name}", error=str(e), exc_info=True)
        
        return result
    
    def _process_deletes(
        self,
        table_name: str,
        table_config: dict,
        extractor: Extractor,
        loader: Loader,
        since: datetime | None
    ) -> int:
        """Process deleted records.
        
        Args:
            table_name: Table name
            table_config: Table configuration
            extractor: Extractor instance
            loader: Loader instance
            since: Timestamp for incremental delete detection
            
        Returns:
            Number of deleted records
        """
        deleted = 0
        
        # Process soft deletes
        soft_delete_field = table_config.get("soft_delete_field")
        if soft_delete_field:
            for batch in extractor.detect_soft_deletes(since):
                pk_field = table_config.get("primary_key", "id")
                ids = [r[pk_field] for r in batch]
                deleted += loader.delete_records(ids, soft_delete=True)
        
        return deleted
    
    def test_connections(self) -> dict[str, bool]:
        """Test database connections.
        
        Returns:
            Dictionary of connection status
        """
        return {
            "source": self.source.test_connection(),
            "target": self.target.test_connection()
        }
    
    def get_status(self) -> dict[str, Any]:
        """Get current pipeline status.
        
        Returns:
            Status dictionary
        """
        checkpoints = self.checkpoint.get_all_checkpoints()
        failure_stats = self.failures.get_statistics()
        
        running = [c for c in checkpoints if c.sync_status == "running"]
        
        return {
            "is_running": len(running) > 0,
            "running_tables": [c.table_name for c in running],
            "total_tables": len(self.table_mappings),
            "checkpoints": [c.to_dict() for c in checkpoints],
            "failure_statistics": failure_stats
        }
    
    def close(self) -> None:
        """Close database connections."""
        self.source.close()
        self.target.close()
    
    def __enter__(self) -> "Pipeline":
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()
