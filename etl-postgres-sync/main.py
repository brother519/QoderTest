#!/usr/bin/env python3
"""
ETL Pipeline for PostgreSQL Data Sync

Main entry point with scheduler support.

Usage:
    # Run CLI commands
    python main.py sync              # Run sync now
    python main.py sync --full       # Full sync (ignore checkpoints)
    python main.py status            # Show status
    python main.py health            # Health check
    python main.py logs              # View logs
    
    # Run as daemon with scheduler
    python main.py daemon            # Start scheduled sync (every hour)
"""

import signal
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import click
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import yaml

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.cli.commands import cli as cli_group
from src.core.pipeline import create_pipeline
from src.utils.logger import get_logger


def load_settings() -> dict:
    """Load settings from configuration file."""
    config_path = Path(__file__).parent / 'config' / 'settings.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


class PipelineScheduler:
    """
    Scheduler for running ETL pipeline at regular intervals.
    
    Uses APScheduler for job scheduling with:
    - Configurable interval
    - Max instances (prevent overlapping runs)
    - Graceful shutdown
    """
    
    def __init__(self):
        self.settings = load_settings()
        self.scheduler_config = self.settings.get('scheduler', {})
        self.logger = get_logger()
        
        self.scheduler = BackgroundScheduler()
        self.running = False
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Setup handlers for graceful shutdown."""
        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)
    
    def _handle_shutdown(self, signum, frame):
        """Handle shutdown signals."""
        self.logger.info('shutdown_signal_received', signal=signum)
        self.stop()
    
    def _run_sync(self):
        """Execute sync job."""
        self.logger.info('scheduled_sync_started')
        
        try:
            pipeline = create_pipeline()
            report = pipeline.run()
            
            self.logger.info(
                'scheduled_sync_completed',
                status=report.status,
                records_loaded=report.total_loaded,
                records_failed=report.total_failed,
                duration=report.duration_seconds
            )
        
        except Exception as e:
            self.logger.exception('scheduled_sync_failed', error=str(e))
    
    def start(self):
        """Start the scheduler."""
        interval_minutes = self.scheduler_config.get('interval_minutes', 60)
        max_instances = self.scheduler_config.get('max_instances', 1)
        misfire_grace_time = self.scheduler_config.get('misfire_grace_time', 300)
        coalesce = self.scheduler_config.get('coalesce', True)
        
        self.logger.info(
            'scheduler_starting',
            interval_minutes=interval_minutes,
            max_instances=max_instances
        )
        
        # Add sync job
        self.scheduler.add_job(
            self._run_sync,
            trigger=IntervalTrigger(minutes=interval_minutes),
            id='etl_sync',
            name='ETL Sync Job',
            max_instances=max_instances,
            misfire_grace_time=misfire_grace_time,
            coalesce=coalesce
        )
        
        self.scheduler.start()
        self.running = True
        
        # Run immediately on start
        self.logger.info('running_initial_sync')
        self._run_sync()
        
        self.logger.info('scheduler_started', next_run=self._get_next_run())
    
    def _get_next_run(self) -> Optional[str]:
        """Get next scheduled run time."""
        job = self.scheduler.get_job('etl_sync')
        if job and job.next_run_time:
            return job.next_run_time.isoformat()
        return None
    
    def stop(self):
        """Stop the scheduler."""
        if self.running:
            self.logger.info('scheduler_stopping')
            self.scheduler.shutdown(wait=True)
            self.running = False
            self.logger.info('scheduler_stopped')
    
    def run_forever(self):
        """Run the scheduler until interrupted."""
        self.start()
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.stop()


@click.command()
@click.option('--interval', '-i', type=int, help='Override sync interval (minutes)')
def daemon(interval: Optional[int]):
    """Run as daemon with scheduled sync."""
    from rich.console import Console
    console = Console()
    
    scheduler = PipelineScheduler()
    
    if interval:
        scheduler.scheduler_config['interval_minutes'] = interval
    
    console.print(f"\n[bold green]ETL Pipeline Daemon[/bold green]")
    console.print(f"Sync interval: {scheduler.scheduler_config.get('interval_minutes', 60)} minutes")
    console.print("Press Ctrl+C to stop\n")
    
    scheduler.run_forever()
    
    console.print("\n[yellow]Daemon stopped[/yellow]")


# Add daemon command to CLI group
cli_group.add_command(daemon)


def main():
    """Main entry point."""
    cli_group()


if __name__ == '__main__':
    main()
