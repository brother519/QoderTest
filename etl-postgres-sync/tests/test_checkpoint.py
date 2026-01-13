"""
Tests for checkpoint system.
"""

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pytest

# Add parent to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.checkpoint import CheckpointManager, TableCheckpoint


class TestTableCheckpoint:
    """Tests for TableCheckpoint class."""
    
    def test_create_empty_checkpoint(self):
        """Test creating a checkpoint with no data."""
        cp = TableCheckpoint('test_table')
        
        assert cp.table_name == 'test_table'
        assert cp.last_sync_timestamp is None
        assert cp.last_synced_id is None
        assert cp.records_synced == 0
        assert cp.last_successful_run is None
    
    def test_checkpoint_to_dict(self):
        """Test serialization to dictionary."""
        now = datetime.now(timezone.utc)
        cp = TableCheckpoint(
            table_name='users',
            last_sync_timestamp=now,
            last_synced_id=100,
            records_synced=500,
            last_successful_run=now
        )
        
        data = cp.to_dict()
        
        assert data['last_sync_timestamp'] == now.isoformat()
        assert data['last_synced_id'] == 100
        assert data['records_synced'] == 500
        assert data['last_successful_run'] == now.isoformat()
    
    def test_checkpoint_from_dict(self):
        """Test deserialization from dictionary."""
        now = datetime.now(timezone.utc)
        data = {
            'last_sync_timestamp': now.isoformat(),
            'last_synced_id': 200,
            'records_synced': 1000,
            'last_successful_run': now.isoformat()
        }
        
        cp = TableCheckpoint.from_dict('orders', data)
        
        assert cp.table_name == 'orders'
        assert cp.last_synced_id == 200
        assert cp.records_synced == 1000


class TestCheckpointManager:
    """Tests for CheckpointManager class."""
    
    @pytest.fixture
    def temp_checkpoint_dir(self):
        """Create temporary directory for checkpoints."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield tmpdir
    
    def test_create_manager(self, temp_checkpoint_dir):
        """Test creating checkpoint manager."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        assert manager.checkpoint_dir.exists()
        assert manager._status == 'idle'
    
    def test_update_checkpoint(self, temp_checkpoint_dir):
        """Test updating checkpoint for a table."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        now = datetime.now(timezone.utc)
        manager.update_checkpoint(
            table_name='users',
            last_sync_timestamp=now,
            last_synced_id=50,
            records_synced=100
        )
        
        cp = manager.get_checkpoint('users')
        assert cp is not None
        assert cp.last_synced_id == 50
        assert cp.records_synced == 100
    
    def test_checkpoint_persistence(self, temp_checkpoint_dir):
        """Test that checkpoints persist across manager instances."""
        now = datetime.now(timezone.utc)
        
        # Create and update
        manager1 = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        manager1.update_checkpoint('users', now, 100, 500)
        
        # Create new manager and verify data persisted
        manager2 = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        cp = manager2.get_checkpoint('users')
        
        assert cp is not None
        assert cp.last_synced_id == 100
    
    def test_start_and_complete_run(self, temp_checkpoint_dir):
        """Test run lifecycle."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        run_id = manager.start_run()
        assert run_id is not None
        assert manager._status == 'running'
        
        manager.complete_run()
        assert manager._status == 'completed'
    
    def test_reset_table(self, temp_checkpoint_dir):
        """Test resetting a single table checkpoint."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        now = datetime.now(timezone.utc)
        manager.update_checkpoint('users', now, 100, 500)
        manager.update_checkpoint('orders', now, 200, 1000)
        
        manager.reset_table('users')
        
        assert manager.get_checkpoint('users') is None
        assert manager.get_checkpoint('orders') is not None
    
    def test_reset_all(self, temp_checkpoint_dir):
        """Test resetting all checkpoints."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        now = datetime.now(timezone.utc)
        manager.update_checkpoint('users', now, 100, 500)
        manager.update_checkpoint('orders', now, 200, 1000)
        
        manager.reset_all()
        
        assert manager.get_checkpoint('users') is None
        assert manager.get_checkpoint('orders') is None
        assert manager._status == 'idle'
    
    def test_get_status(self, temp_checkpoint_dir):
        """Test getting pipeline status."""
        manager = CheckpointManager(checkpoint_dir=temp_checkpoint_dir)
        
        now = datetime.now(timezone.utc)
        manager.update_checkpoint('users', now, 100, 500)
        
        status = manager.get_status()
        
        assert 'pipeline_run_id' in status
        assert 'status' in status
        assert 'tables' in status
        assert 'users' in status['tables']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
