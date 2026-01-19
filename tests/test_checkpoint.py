"""Tests for the checkpoint manager module."""

import pytest
import tempfile
from datetime import datetime
from pathlib import Path

from src.checkpoint.manager import CheckpointManager, Checkpoint


class TestCheckpoint:
    """Test Checkpoint class."""
    
    def test_create_checkpoint(self):
        """Test creating a checkpoint."""
        cp = Checkpoint(
            table_name="users",
            last_sync_timestamp=datetime(2024, 1, 1, 12, 0, 0),
            sync_status="completed"
        )
        
        assert cp.table_name == "users"
        assert cp.sync_status == "completed"
        assert cp.last_processed_offset == 0
    
    def test_to_dict(self):
        """Test converting to dictionary."""
        cp = Checkpoint(
            table_name="users",
            last_sync_timestamp=datetime(2024, 1, 1, 12, 0, 0),
            sync_status="running"
        )
        
        d = cp.to_dict()
        
        assert d["table_name"] == "users"
        assert d["sync_status"] == "running"
        assert "2024-01-01" in d["last_sync_timestamp"]


class TestCheckpointManager:
    """Test CheckpointManager class."""
    
    @pytest.fixture
    def manager(self, tmp_path):
        """Create checkpoint manager with temp database."""
        db_path = tmp_path / "test_checkpoint.db"
        return CheckpointManager(db_path)
    
    def test_save_and_get_checkpoint(self, manager):
        """Test saving and retrieving checkpoint."""
        cp = Checkpoint(
            table_name="test_table",
            last_sync_timestamp=datetime(2024, 1, 1),
            sync_status="completed",
            processed_records=100
        )
        
        manager.save_checkpoint(cp)
        retrieved = manager.get_checkpoint("test_table")
        
        assert retrieved is not None
        assert retrieved.table_name == "test_table"
        assert retrieved.processed_records == 100
    
    def test_get_nonexistent_checkpoint(self, manager):
        """Test getting non-existent checkpoint."""
        result = manager.get_checkpoint("nonexistent")
        assert result is None
    
    def test_start_sync(self, manager):
        """Test starting a sync."""
        cp = manager.start_sync("users", total_records=1000)
        
        assert cp.sync_status == "running"
        assert cp.total_records == 1000
        assert cp.started_at is not None
    
    def test_update_progress(self, manager):
        """Test updating progress."""
        manager.start_sync("users", 1000)
        manager.update_progress("users", 500, offset=500)
        
        cp = manager.get_checkpoint("users")
        assert cp.processed_records == 500
        assert cp.last_processed_offset == 500
    
    def test_complete_sync(self, manager):
        """Test completing a sync."""
        manager.start_sync("users", 1000)
        manager.update_progress("users", 1000)
        manager.complete_sync("users", datetime.now())
        
        cp = manager.get_checkpoint("users")
        assert cp.sync_status == "completed"
        assert cp.completed_at is not None
        assert cp.last_processed_offset == 0  # Reset for next sync
    
    def test_fail_sync(self, manager):
        """Test failing a sync."""
        manager.start_sync("users", 1000)
        manager.fail_sync("users", "Connection timeout")
        
        cp = manager.get_checkpoint("users")
        assert cp.sync_status == "failed"
        assert cp.error_message == "Connection timeout"
    
    def test_get_running_syncs(self, manager):
        """Test getting running syncs."""
        manager.start_sync("table1", 100)
        manager.start_sync("table2", 200)
        manager.complete_sync("table2")
        
        running = manager.get_running_syncs()
        
        assert len(running) == 1
        assert running[0].table_name == "table1"
    
    def test_get_all_checkpoints(self, manager):
        """Test getting all checkpoints."""
        manager.start_sync("table1", 100)
        manager.start_sync("table2", 200)
        
        all_cps = manager.get_all_checkpoints()
        
        assert len(all_cps) == 2
    
    def test_has_incomplete_sync(self, manager):
        """Test checking for incomplete sync."""
        manager.start_sync("users", 1000)
        
        assert manager.has_incomplete_sync("users")
        
        manager.complete_sync("users")
        
        assert not manager.has_incomplete_sync("users")
    
    def test_reset_checkpoint(self, manager):
        """Test resetting checkpoint."""
        manager.start_sync("users", 1000)
        manager.reset_checkpoint("users")
        
        cp = manager.get_checkpoint("users")
        assert cp is None
    
    def test_clear_all(self, manager):
        """Test clearing all checkpoints."""
        manager.start_sync("table1", 100)
        manager.start_sync("table2", 200)
        
        manager.clear_all()
        
        assert len(manager.get_all_checkpoints()) == 0
