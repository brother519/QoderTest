"""Scheduler for running sync jobs on a cron schedule."""

import fcntl
import os
import signal
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR, JobExecutionEvent

from ..core.pipeline import Pipeline
from ..utils.config_loader import get_config
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FileLock:
    """Simple file-based lock for preventing concurrent syncs."""
    
    def __init__(self, lock_file: str | Path):
        self.lock_file = Path(lock_file)
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self._fd = None
    
    def acquire(self, blocking: bool = True) -> bool:
        """Acquire the lock.
        
        Args:
            blocking: If True, wait for lock; otherwise return immediately
            
        Returns:
            True if lock acquired
        """
        self._fd = open(self.lock_file, "w")
        try:
            flags = fcntl.LOCK_EX
            if not blocking:
                flags |= fcntl.LOCK_NB
            fcntl.flock(self._fd.fileno(), flags)
            
            # Write PID to lock file
            self._fd.write(str(os.getpid()))
            self._fd.flush()
            
            return True
        except (IOError, OSError):
            if self._fd:
                self._fd.close()
                self._fd = None
            return False
    
    def release(self) -> None:
        """Release the lock."""
        if self._fd:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_UN)
            self._fd.close()
            self._fd = None
            
            # Remove lock file
            try:
                self.lock_file.unlink()
            except FileNotFoundError:
                pass
    
    def is_locked(self) -> bool:
        """Check if lock is currently held."""
        if not self.lock_file.exists():
            return False
        
        try:
            fd = open(self.lock_file, "r")
            fcntl.flock(fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            fcntl.flock(fd.fileno(), fcntl.LOCK_UN)
            fd.close()
            return False
        except (IOError, OSError):
            return True
    
    def __enter__(self) -> "FileLock":
        self.acquire()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.release()


class SyncScheduler:
    """Schedule and manage sync jobs."""
    
    def __init__(self):
        """Initialize scheduler."""
        self.config = get_config()
        self.schedule_config = self.config.schedule_config
        
        # Get lock file path
        concurrency_config = self.schedule_config.get("concurrency", {})
        lock_file = concurrency_config.get("lock_file", "data/sync.lock")
        self.lock = FileLock(lock_file)
        
        # Initialize APScheduler
        self.scheduler = BackgroundScheduler(
            timezone=self.schedule_config.get("scheduler", {}).get("timezone", "UTC")
        )
        
        # Track job execution
        self._last_run: datetime | None = None
        self._is_running = False
        self._callbacks: list[Callable[[dict], None]] = []
        
        # Setup event listeners
        self.scheduler.add_listener(
            self._on_job_event,
            EVENT_JOB_EXECUTED | EVENT_JOB_ERROR
        )
    
    def _on_job_event(self, event: JobExecutionEvent) -> None:
        """Handle job execution events."""
        if event.exception:
            logger.error(
                "Scheduled job failed",
                job_id=event.job_id,
                error=str(event.exception)
            )
        else:
            logger.info(
                "Scheduled job completed",
                job_id=event.job_id
            )
    
    def add_callback(self, callback: Callable[[dict], None]) -> None:
        """Add a callback to be called after sync completion.
        
        Args:
            callback: Function that takes sync result dict
        """
        self._callbacks.append(callback)
    
    def _execute_sync(
        self,
        tables: list[str] | None = None,
        full_sync: bool = False
    ) -> dict[str, Any]:
        """Execute sync job with locking.
        
        Args:
            tables: Tables to sync
            full_sync: Full sync flag
            
        Returns:
            Sync results
        """
        if not self.lock.acquire(blocking=False):
            logger.warning("Sync already running, skipping")
            return {"status": "skipped", "reason": "Another sync is running"}
        
        self._is_running = True
        self._last_run = datetime.now()
        
        try:
            logger.info("Starting scheduled sync")
            
            with Pipeline() as pipeline:
                results = pipeline.run_sync(tables, full_sync)
            
            result_dict = {
                "status": "completed",
                "started_at": self._last_run.isoformat(),
                "completed_at": datetime.now().isoformat(),
                "tables": {k: v.to_dict() for k, v in results.items()}
            }
            
            # Call callbacks
            for callback in self._callbacks:
                try:
                    callback(result_dict)
                except Exception as e:
                    logger.error(f"Callback error: {e}")
            
            return result_dict
            
        except Exception as e:
            logger.error(f"Sync failed: {e}", exc_info=True)
            return {"status": "failed", "error": str(e)}
        finally:
            self._is_running = False
            self.lock.release()
    
    def setup_jobs(self) -> None:
        """Setup scheduled jobs from configuration."""
        jobs_config = self.schedule_config.get("scheduler", {}).get("jobs", [])
        
        for job_config in jobs_config:
            if not job_config.get("enabled", True):
                continue
            
            job_id = job_config.get("id", "sync_job")
            trigger_type = job_config.get("trigger", "cron")
            expression = job_config.get("expression", "0 * * * *")
            tables = job_config.get("tables")
            full_sync = job_config.get("full_sync", False)
            max_instances = job_config.get("max_instances", 1)
            coalesce = job_config.get("coalesce", True)
            
            if tables == "all":
                tables = None
            
            # Parse cron expression
            if trigger_type == "cron":
                parts = expression.split()
                if len(parts) == 5:
                    trigger = CronTrigger(
                        minute=parts[0],
                        hour=parts[1],
                        day=parts[2],
                        month=parts[3],
                        day_of_week=parts[4]
                    )
                else:
                    logger.error(f"Invalid cron expression: {expression}")
                    continue
            else:
                logger.error(f"Unsupported trigger type: {trigger_type}")
                continue
            
            self.scheduler.add_job(
                self._execute_sync,
                trigger=trigger,
                id=job_id,
                kwargs={"tables": tables, "full_sync": full_sync},
                max_instances=max_instances,
                coalesce=coalesce,
                replace_existing=True
            )
            
            logger.info(
                f"Scheduled job added",
                job_id=job_id,
                expression=expression
            )
    
    def start(self) -> None:
        """Start the scheduler."""
        if not self.schedule_config.get("scheduler", {}).get("enabled", True):
            logger.info("Scheduler is disabled in configuration")
            return
        
        self.setup_jobs()
        self.scheduler.start()
        logger.info("Scheduler started")
    
    def stop(self) -> None:
        """Stop the scheduler."""
        self.scheduler.shutdown(wait=True)
        logger.info("Scheduler stopped")
    
    def trigger_sync(
        self,
        tables: list[str] | None = None,
        full_sync: bool = False
    ) -> dict[str, Any]:
        """Manually trigger a sync.
        
        Args:
            tables: Tables to sync
            full_sync: Full sync flag
            
        Returns:
            Sync results
        """
        return self._execute_sync(tables, full_sync)
    
    def get_status(self) -> dict[str, Any]:
        """Get scheduler status.
        
        Returns:
            Status dictionary
        """
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        
        return {
            "running": self.scheduler.running,
            "is_syncing": self._is_running,
            "lock_held": self.lock.is_locked(),
            "last_run": self._last_run.isoformat() if self._last_run else None,
            "jobs": jobs
        }
    
    def get_next_run_time(self) -> datetime | None:
        """Get next scheduled run time.
        
        Returns:
            Next run datetime or None
        """
        jobs = self.scheduler.get_jobs()
        if not jobs:
            return None
        
        next_times = [j.next_run_time for j in jobs if j.next_run_time]
        return min(next_times) if next_times else None


def run_daemon() -> None:
    """Run scheduler as a daemon process."""
    scheduler = SyncScheduler()
    
    # Setup signal handlers
    def signal_handler(signum, frame):
        logger.info("Received shutdown signal")
        scheduler.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start scheduler
    scheduler.start()
    
    logger.info("Scheduler daemon running. Press Ctrl+C to stop.")
    
    # Keep running
    try:
        while True:
            signal.pause()
    except KeyboardInterrupt:
        scheduler.stop()
