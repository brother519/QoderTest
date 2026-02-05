"""
Checkpoint management for ETL pipeline.
Tracks sync progress to enable resume from interruption.
"""

import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import yaml


def load_settings() -> dict:
    """Load settings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'settings.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


class TableCheckpoint:
    """Checkpoint data for a single table."""
    
    def __init__(
        self,
        table_name: str,
        last_sync_timestamp: Optional[datetime] = None,
        last_synced_id: Optional[int] = None,
        records_synced: int = 0,
        last_successful_run: Optional[datetime] = None
    ):
        self.table_name = table_name
        self.last_sync_timestamp = last_sync_timestamp
        self.last_synced_id = last_synced_id
        self.records_synced = records_synced
        self.last_successful_run = last_successful_run
    
    def to_dict(self) -> dict:
        """Convert to dictionary for serialization."""
        return {
            'last_sync_timestamp': self.last_sync_timestamp.isoformat() if self.last_sync_timestamp else None,
            'last_synced_id': self.last_synced_id,
            'records_synced': self.records_synced,
            'last_successful_run': self.last_successful_run.isoformat() if self.last_successful_run else None
        }
    
    @classmethod
    def from_dict(cls, table_name: str, data: dict) -> 'TableCheckpoint':
        """Create from dictionary."""
        return cls(
            table_name=table_name,
            last_sync_timestamp=datetime.fromisoformat(data['last_sync_timestamp']) if data.get('last_sync_timestamp') else None,
            last_synced_id=data.get('last_synced_id'),
            records_synced=data.get('records_synced', 0),
            last_successful_run=datetime.fromisoformat(data['last_successful_run']) if data.get('last_successful_run') else None
        )


class CheckpointManager:
    """
    Manages checkpoint state for the ETL pipeline.
    
    Checkpoint file format:
    {
        "tables": {
            "users": {
                "last_sync_timestamp": "2026-01-13T10:30:00Z",
                "last_synced_id": 123456,
                "records_synced": 5000,
                "last_successful_run": "2026-01-13T10:35:00Z"
            }
        },
        "pipeline_run_id": "run_20260113_103500",
        "status": "completed",
        "last_updated": "2026-01-13T10:35:00Z"
    }
    """
    
    def __init__(self, checkpoint_dir: str = None):
        settings = load_settings()
        checkpoint_config = settings.get('checkpoint', {})
        
        if checkpoint_dir is None:
            checkpoint_dir = checkpoint_config.get('directory', 'checkpoints')
        
        self.checkpoint_dir = Path(__file__).parent.parent.parent / checkpoint_dir
        self.checkpoint_file = self.checkpoint_dir / 'checkpoint.json'
        self.backup_enabled = checkpoint_config.get('backup_enabled', True)
        self.backup_count = checkpoint_config.get('backup_count', 5)
        
        # Ensure directory exists
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        # In-memory checkpoint state
        self._checkpoints: dict[str, TableCheckpoint] = {}
        self._pipeline_run_id: Optional[str] = None
        self._status: str = 'idle'
        
        # Load existing checkpoint
        self._load()
    
    def _load(self):
        """Load checkpoint from file."""
        if not self.checkpoint_file.exists():
            return
        
        try:
            with open(self.checkpoint_file, 'r') as f:
                data = json.load(f)
            
            self._pipeline_run_id = data.get('pipeline_run_id')
            self._status = data.get('status', 'idle')
            
            for table_name, table_data in data.get('tables', {}).items():
                self._checkpoints[table_name] = TableCheckpoint.from_dict(table_name, table_data)
        
        except (json.JSONDecodeError, KeyError) as e:
            # Corrupted checkpoint, start fresh but backup old file
            backup_path = self.checkpoint_file.with_suffix('.json.corrupted')
            shutil.copy2(self.checkpoint_file, backup_path)
            self._checkpoints = {}
    
    def _save(self):
        """Save checkpoint to file atomically."""
        # Create backup if enabled
        if self.backup_enabled and self.checkpoint_file.exists():
            self._rotate_backups()
        
        # Prepare data
        data = {
            'tables': {name: cp.to_dict() for name, cp in self._checkpoints.items()},
            'pipeline_run_id': self._pipeline_run_id,
            'status': self._status,
            'last_updated': datetime.now(timezone.utc).isoformat()
        }
        
        # Write to temp file first, then rename (atomic operation)
        temp_file = self.checkpoint_file.with_suffix('.json.tmp')
        with open(temp_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Atomic rename
        temp_file.rename(self.checkpoint_file)
    
    def _rotate_backups(self):
        """Rotate backup files."""
        # Get existing backups
        backups = sorted(self.checkpoint_dir.glob('checkpoint.json.bak.*'))
        
        # Remove old backups if we have too many
        while len(backups) >= self.backup_count:
            backups[0].unlink()
            backups.pop(0)
        
        # Create new backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = self.checkpoint_dir / f'checkpoint.json.bak.{timestamp}'
        shutil.copy2(self.checkpoint_file, backup_path)
    
    def get_checkpoint(self, table_name: str) -> Optional[TableCheckpoint]:
        """Get checkpoint for a specific table."""
        return self._checkpoints.get(table_name)
    
    def update_checkpoint(
        self,
        table_name: str,
        last_sync_timestamp: datetime,
        last_synced_id: int,
        records_synced: int,
        save: bool = True
    ):
        """Update checkpoint for a table after successful batch."""
        checkpoint = self._checkpoints.get(table_name)
        
        if checkpoint is None:
            checkpoint = TableCheckpoint(table_name)
            self._checkpoints[table_name] = checkpoint
        
        checkpoint.last_sync_timestamp = last_sync_timestamp
        checkpoint.last_synced_id = last_synced_id
        checkpoint.records_synced += records_synced
        checkpoint.last_successful_run = datetime.now(timezone.utc)
        
        if save:
            self._save()
    
    def start_run(self, run_id: str = None):
        """Mark the start of a pipeline run."""
        if run_id is None:
            run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self._pipeline_run_id = run_id
        self._status = 'running'
        self._save()
        
        return run_id
    
    def complete_run(self):
        """Mark the pipeline run as completed."""
        self._status = 'completed'
        self._save()
    
    def fail_run(self, error: str = None):
        """Mark the pipeline run as failed."""
        self._status = f'failed: {error}' if error else 'failed'
        self._save()
    
    def reset_table(self, table_name: str):
        """Reset checkpoint for a specific table (for full sync)."""
        if table_name in self._checkpoints:
            del self._checkpoints[table_name]
            self._save()
    
    def reset_all(self):
        """Reset all checkpoints (for full sync of all tables)."""
        self._checkpoints = {}
        self._pipeline_run_id = None
        self._status = 'idle'
        self._save()
    
    def get_status(self) -> dict[str, Any]:
        """Get current checkpoint status."""
        return {
            'pipeline_run_id': self._pipeline_run_id,
            'status': self._status,
            'tables': {
                name: {
                    'last_sync': cp.last_sync_timestamp.isoformat() if cp.last_sync_timestamp else None,
                    'records_synced': cp.records_synced,
                    'last_run': cp.last_successful_run.isoformat() if cp.last_successful_run else None
                }
                for name, cp in self._checkpoints.items()
            }
        }


# Global checkpoint manager instance
_checkpoint_manager: CheckpointManager = None


def get_checkpoint_manager(checkpoint_dir: str = None) -> CheckpointManager:
    """Get or create global checkpoint manager instance."""
    global _checkpoint_manager
    if _checkpoint_manager is None:
        _checkpoint_manager = CheckpointManager(checkpoint_dir)
    return _checkpoint_manager


def reset_checkpoint_manager():
    """Reset the global checkpoint manager (useful for testing)."""
    global _checkpoint_manager
    _checkpoint_manager = None
