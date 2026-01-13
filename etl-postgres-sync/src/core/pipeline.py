"""
Pipeline orchestrator for ETL pipeline.
Coordinates extraction, transformation, validation, and loading.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml

from src.core.extractor import DataExtractor
from src.core.transformer import DataTransformer
from src.core.validator import DataValidator
from src.core.loader import DataLoader, LoadResult
from src.utils.checkpoint import get_checkpoint_manager, CheckpointManager
from src.utils.logger import get_logger, ETLLogger


def load_settings() -> dict:
    """Load settings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'settings.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


class FailedRecordHandler:
    """Handles storage and retrieval of failed records."""
    
    def __init__(self, base_dir: str = None):
        settings = load_settings()
        failed_config = settings.get('failed_records', {})
        
        if base_dir is None:
            base_dir = failed_config.get('directory', 'failed_records')
        
        self.base_dir = Path(__file__).parent.parent.parent / base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def save_failed_records(
        self,
        records: list[dict],
        errors: list[dict],
        table_name: str,
        run_id: str
    ):
        """Save failed records to JSONL file."""
        if not records:
            return
        
        # Create date-based directory
        date_str = datetime.now().strftime('%Y-%m-%d')
        date_dir = self.base_dir / date_str
        date_dir.mkdir(parents=True, exist_ok=True)
        
        # Create file
        timestamp = datetime.now().strftime('%H%M%S')
        filename = f"{table_name}_failures_{timestamp}.jsonl"
        filepath = date_dir / filename
        
        # Build error lookup by record_id
        error_lookup = {}
        for error in errors:
            record_id = error.get('record_id', 'unknown')
            if record_id not in error_lookup:
                error_lookup[record_id] = []
            error_lookup[record_id].append(error)
        
        # Write records with their errors
        with open(filepath, 'w') as f:
            for record in records:
                # Convert any non-serializable types
                clean_record = {}
                for k, v in record.items():
                    if pd.isna(v):
                        clean_record[k] = None
                    elif isinstance(v, datetime):
                        clean_record[k] = v.isoformat()
                    else:
                        clean_record[k] = v
                
                record_id = record.get('id', 'unknown')
                entry = {
                    'record': clean_record,
                    'errors': error_lookup.get(record_id, []),
                    'table': table_name,
                    'run_id': run_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
                f.write(json.dumps(entry) + '\n')
    
    def get_failed_records(
        self,
        table_name: str = None,
        date: str = None
    ) -> list[dict]:
        """Retrieve failed records for review."""
        records = []
        
        # Determine which directories to search
        if date:
            dirs = [self.base_dir / date]
        else:
            dirs = sorted(self.base_dir.iterdir()) if self.base_dir.exists() else []
        
        for dir_path in dirs:
            if not dir_path.is_dir():
                continue
            
            for filepath in dir_path.glob('*.jsonl'):
                if table_name and not filepath.name.startswith(f"{table_name}_"):
                    continue
                
                with open(filepath, 'r') as f:
                    for line in f:
                        records.append(json.loads(line))
        
        return records


class SyncReport:
    """Report for a sync run."""
    
    def __init__(self, run_id: str):
        self.run_id = run_id
        self.start_time = datetime.now(timezone.utc)
        self.end_time: Optional[datetime] = None
        self.tables_processed: int = 0
        self.total_extracted: int = 0
        self.total_transformed: int = 0
        self.total_validated: int = 0
        self.total_loaded: int = 0
        self.total_failed: int = 0
        self.table_reports: dict[str, dict] = {}
        self.errors: list[str] = []
        self.status: str = 'running'
    
    @property
    def duration_seconds(self) -> float:
        end = self.end_time or datetime.now(timezone.utc)
        return (end - self.start_time).total_seconds()
    
    def add_table_report(
        self,
        table_name: str,
        extracted: int,
        transformed: int,
        validated: int,
        loaded: int,
        failed: int,
        duration: float
    ):
        """Add report for a single table."""
        self.table_reports[table_name] = {
            'extracted': extracted,
            'transformed': transformed,
            'validated': validated,
            'loaded': loaded,
            'failed': failed,
            'duration_seconds': duration
        }
        
        self.tables_processed += 1
        self.total_extracted += extracted
        self.total_transformed += transformed
        self.total_validated += validated
        self.total_loaded += loaded
        self.total_failed += failed
    
    def complete(self, success: bool = True):
        """Mark report as complete."""
        self.end_time = datetime.now(timezone.utc)
        self.status = 'completed' if success else 'failed'
    
    def to_dict(self) -> dict:
        """Convert report to dictionary."""
        return {
            'run_id': self.run_id,
            'status': self.status,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_seconds': round(self.duration_seconds, 2),
            'tables_processed': self.tables_processed,
            'totals': {
                'extracted': self.total_extracted,
                'transformed': self.total_transformed,
                'validated': self.total_validated,
                'loaded': self.total_loaded,
                'failed': self.total_failed
            },
            'tables': self.table_reports,
            'errors': self.errors
        }


class ETLPipeline:
    """
    Main ETL pipeline orchestrator.
    
    Coordinates the full ETL flow:
    1. Extract changed records from source
    2. Transform to target schema
    3. Validate data
    4. Load valid records to target
    5. Handle failed records
    6. Update checkpoints
    """
    
    def __init__(self):
        self.extractor = DataExtractor()
        self.transformer = DataTransformer()
        self.validator = DataValidator()
        self.loader = DataLoader()
        self.checkpoint_manager = get_checkpoint_manager()
        self.failed_handler = FailedRecordHandler()
        self.logger = get_logger()
        self.settings = load_settings()
    
    def sync_table(
        self,
        table_name: str,
        full_sync: bool = False,
        run_id: str = None
    ) -> dict:
        """
        Sync a single table from source to target.
        
        Args:
            table_name: Name of the table to sync
            full_sync: If True, ignore checkpoint and sync all records
            run_id: Optional run ID for tracking
        
        Returns:
            Dict with sync statistics
        """
        start_time = datetime.now(timezone.utc)
        
        stats = {
            'table': table_name,
            'extracted': 0,
            'transformed': 0,
            'validated': 0,
            'loaded': 0,
            'failed': 0,
            'batches': 0
        }
        
        # Get checkpoint
        checkpoint = None if full_sync else self.checkpoint_manager.get_checkpoint(table_name)
        checkpoint_ts = checkpoint.last_sync_timestamp if checkpoint else None
        checkpoint_id = checkpoint.last_synced_id if checkpoint else None
        
        self.logger.info(
            'table_sync_started',
            table=table_name,
            full_sync=full_sync,
            checkpoint_ts=checkpoint_ts.isoformat() if checkpoint_ts else None
        )
        
        try:
            # Process in batches
            for batch_df, last_ts, last_id in self.extractor.extract_changes(
                table_name,
                checkpoint_ts,
                checkpoint_id
            ):
                batch_start = datetime.now(timezone.utc)
                batch_num = stats['batches'] + 1
                
                extracted_count = len(batch_df)
                stats['extracted'] += extracted_count
                
                # Transform
                transformed_df = self.transformer.transform_batch(batch_df, table_name)
                transformed_count = len(transformed_df)
                stats['transformed'] += transformed_count
                
                # Validate
                validation_result = self.validator.validate_batch(transformed_df, table_name)
                valid_df, invalid_df = validation_result.to_dataframes()
                
                validated_count = validation_result.valid_count
                failed_count = validation_result.invalid_count
                stats['validated'] += validated_count
                stats['failed'] += failed_count
                
                # Save failed records
                if failed_count > 0:
                    self.failed_handler.save_failed_records(
                        validation_result.invalid_records,
                        validation_result.errors,
                        table_name,
                        run_id or 'unknown'
                    )
                
                # Load valid records
                if not valid_df.empty:
                    load_result = self.loader.load_batch(valid_df, table_name)
                    loaded_count = load_result.total_loaded
                    stats['loaded'] += loaded_count
                    
                    if load_result.records_failed > 0:
                        stats['failed'] += load_result.records_failed
                else:
                    loaded_count = 0
                
                # Update checkpoint after successful batch
                self.checkpoint_manager.update_checkpoint(
                    table_name,
                    last_ts,
                    last_id,
                    loaded_count
                )
                
                stats['batches'] += 1
                
                batch_duration = (datetime.now(timezone.utc) - batch_start).total_seconds()
                self.logger.log_batch_processed(
                    table=table_name,
                    batch_number=batch_num,
                    records_extracted=extracted_count,
                    records_transformed=transformed_count,
                    records_valid=validated_count,
                    records_failed=failed_count,
                    records_loaded=loaded_count,
                    duration_seconds=batch_duration
                )
        
        except Exception as e:
            self.logger.exception(
                'table_sync_error',
                table=table_name,
                error=str(e)
            )
            raise
        
        stats['duration_seconds'] = (datetime.now(timezone.utc) - start_time).total_seconds()
        
        self.logger.info(
            'table_sync_completed',
            table=table_name,
            **stats
        )
        
        return stats
    
    def run(
        self,
        tables: list[str] = None,
        full_sync: bool = False
    ) -> SyncReport:
        """
        Run the full ETL pipeline.
        
        Args:
            tables: List of tables to sync. If None, sync all configured tables.
            full_sync: If True, ignore checkpoints and sync all records.
        
        Returns:
            SyncReport with results
        """
        # Start run
        run_id = self.checkpoint_manager.start_run()
        report = SyncReport(run_id)
        
        self.logger.bind(run_id=run_id)
        self.logger.info('pipeline_started', full_sync=full_sync)
        
        # Get tables to process
        if tables is None:
            tables = self.extractor.get_configured_tables()
        
        try:
            for table_name in tables:
                try:
                    stats = self.sync_table(table_name, full_sync, run_id)
                    
                    report.add_table_report(
                        table_name,
                        extracted=stats['extracted'],
                        transformed=stats['transformed'],
                        validated=stats['validated'],
                        loaded=stats['loaded'],
                        failed=stats['failed'],
                        duration=stats['duration_seconds']
                    )
                
                except Exception as e:
                    error_msg = f"Error syncing table {table_name}: {str(e)}"
                    report.errors.append(error_msg)
                    self.logger.error('table_sync_failed', table=table_name, error=str(e))
            
            # Complete run
            success = len(report.errors) == 0
            report.complete(success)
            
            if success:
                self.checkpoint_manager.complete_run()
            else:
                self.checkpoint_manager.fail_run('; '.join(report.errors))
            
            self.logger.log_sync_complete(
                tables_processed=report.tables_processed,
                total_records_synced=report.total_loaded,
                total_records_failed=report.total_failed,
                total_duration_seconds=report.duration_seconds
            )
        
        except Exception as e:
            report.errors.append(str(e))
            report.complete(success=False)
            self.checkpoint_manager.fail_run(str(e))
            self.logger.exception('pipeline_failed', error=str(e))
        
        finally:
            self.logger.unbind('run_id')
        
        return report
    
    def get_status(self) -> dict:
        """Get current pipeline status."""
        return {
            'checkpoint': self.checkpoint_manager.get_status(),
            'configured_tables': self.extractor.get_configured_tables()
        }


# Convenience function
def create_pipeline() -> ETLPipeline:
    """Create a new ETLPipeline instance."""
    return ETLPipeline()
