"""Main entry point for ETL Data Sync Pipeline."""

import argparse
import sys
from datetime import datetime

from .core.pipeline import Pipeline
from .scheduler.cron_scheduler import SyncScheduler, run_daemon
from .checkpoint.manager import CheckpointManager
from .failure.handler import FailureHandler
from .utils.config_loader import get_config
from .utils.logger import get_logger, LoggerSetup

logger = get_logger(__name__)


def cmd_sync(args: argparse.Namespace) -> int:
    """Execute sync command."""
    LoggerSetup.setup()
    
    tables = args.tables.split(",") if args.tables else None
    
    logger.info(
        "Starting sync",
        tables=tables or "all",
        full_sync=args.full
    )
    
    try:
        with Pipeline() as pipeline:
            # Test connections first
            conn_status = pipeline.test_connections()
            if not all(conn_status.values()):
                logger.error("Database connection failed", status=conn_status)
                return 1
            
            results = pipeline.run_sync(
                tables=tables,
                full_sync=args.full,
                resume=not args.no_resume
            )
            
            # Print summary
            print("\n--- Sync Summary ---")
            total_success = 0
            total_failed = 0
            
            for table_name, result in results.items():
                status = "ERROR" if result.error else "OK"
                print(f"{table_name}: {status}")
                print(f"  Success: {result.success_count}")
                print(f"  Failed: {result.failed_count}")
                print(f"  Duration: {result.duration_seconds:.2f}s")
                if result.error:
                    print(f"  Error: {result.error}")
                
                total_success += result.success_count
                total_failed += result.failed_count
            
            print(f"\nTotal: {total_success} success, {total_failed} failed")
            
            return 0 if total_failed == 0 else 1
            
    except Exception as e:
        logger.error(f"Sync failed: {e}", exc_info=True)
        return 1


def cmd_start(args: argparse.Namespace) -> int:
    """Start scheduler daemon."""
    LoggerSetup.setup()
    
    logger.info("Starting scheduler daemon")
    
    try:
        run_daemon()
        return 0
    except Exception as e:
        logger.error(f"Daemon failed: {e}", exc_info=True)
        return 1


def cmd_status(args: argparse.Namespace) -> int:
    """Show pipeline status."""
    LoggerSetup.setup()
    
    scheduler = SyncScheduler()
    status = scheduler.get_status()
    
    print("--- Scheduler Status ---")
    print(f"Running: {status['running']}")
    print(f"Currently syncing: {status['is_syncing']}")
    print(f"Last run: {status['last_run'] or 'Never'}")
    
    if status['jobs']:
        print("\nScheduled Jobs:")
        for job in status['jobs']:
            print(f"  {job['id']}: next run at {job['next_run'] or 'N/A'}")
    
    # Get checkpoint status
    checkpoint = CheckpointManager()
    checkpoints = checkpoint.get_all_checkpoints()
    
    if checkpoints:
        print("\n--- Table Status ---")
        for cp in checkpoints:
            print(f"{cp.table_name}:")
            print(f"  Status: {cp.sync_status}")
            print(f"  Last sync: {cp.last_sync_timestamp or 'Never'}")
            if cp.sync_status == "running":
                progress = (cp.processed_records / cp.total_records * 100) if cp.total_records > 0 else 0
                print(f"  Progress: {cp.processed_records}/{cp.total_records} ({progress:.1f}%)")
    
    # Get failure stats
    failures = FailureHandler()
    stats = failures.get_statistics()
    
    print("\n--- Failure Statistics ---")
    print(f"Total: {stats['total']}")
    print(f"Pending: {stats['pending_count']}")
    if stats['by_stage']:
        print("By stage:")
        for stage, count in stats['by_stage'].items():
            print(f"  {stage}: {count}")
    
    return 0


def cmd_reset(args: argparse.Namespace) -> int:
    """Reset checkpoint for a table."""
    LoggerSetup.setup()
    
    checkpoint = CheckpointManager()
    
    if args.table == "all":
        checkpoint.clear_all()
        print("All checkpoints cleared")
    else:
        checkpoint.reset_checkpoint(args.table)
        print(f"Checkpoint reset for: {args.table}")
    
    return 0


def cmd_failures(args: argparse.Namespace) -> int:
    """List or export failure records."""
    LoggerSetup.setup()
    
    failures = FailureHandler()
    
    if args.export:
        count = failures.export_to_json(
            args.export,
            table_name=args.table,
            status=args.status
        )
        print(f"Exported {count} records to {args.export}")
        return 0
    
    records = failures.get_failures(
        table_name=args.table,
        status=args.status,
        limit=args.limit
    )
    
    print(f"--- Failed Records ({len(records)}) ---")
    for record in records:
        print(f"\nID: {record.id}")
        print(f"  Table: {record.table_name}")
        print(f"  Record ID: {record.record_id}")
        print(f"  Stage: {record.failure_stage}")
        print(f"  Error: {record.error_message[:100]}")
        print(f"  Status: {record.status}")
        print(f"  Retries: {record.retry_count}")
    
    return 0


def cmd_test_connection(args: argparse.Namespace) -> int:
    """Test database connections."""
    LoggerSetup.setup()
    
    print("Testing database connections...")
    
    try:
        with Pipeline() as pipeline:
            status = pipeline.test_connections()
            
            for db, connected in status.items():
                result = "OK" if connected else "FAILED"
                print(f"  {db}: {result}")
            
            return 0 if all(status.values()) else 1
            
    except Exception as e:
        print(f"Error: {e}")
        return 1


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="ETL Data Sync Pipeline",
        prog="python -m src"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # sync command
    sync_parser = subparsers.add_parser("sync", help="Run sync immediately")
    sync_parser.add_argument(
        "--tables", "-t",
        help="Comma-separated list of tables to sync"
    )
    sync_parser.add_argument(
        "--full", "-f",
        action="store_true",
        help="Full sync (ignore checkpoints)"
    )
    sync_parser.add_argument(
        "--no-resume",
        action="store_true",
        help="Don't resume from checkpoint"
    )
    sync_parser.set_defaults(func=cmd_sync)
    
    # start command
    start_parser = subparsers.add_parser("start", help="Start scheduler daemon")
    start_parser.set_defaults(func=cmd_start)
    
    # status command
    status_parser = subparsers.add_parser("status", help="Show status")
    status_parser.set_defaults(func=cmd_status)
    
    # reset command
    reset_parser = subparsers.add_parser("reset", help="Reset checkpoint")
    reset_parser.add_argument(
        "table",
        help="Table name or 'all'"
    )
    reset_parser.set_defaults(func=cmd_reset)
    
    # failures command
    failures_parser = subparsers.add_parser("failures", help="Manage failed records")
    failures_parser.add_argument(
        "--table", "-t",
        help="Filter by table name"
    )
    failures_parser.add_argument(
        "--status", "-s",
        choices=["pending", "resolved", "ignored"],
        help="Filter by status"
    )
    failures_parser.add_argument(
        "--export", "-e",
        help="Export to JSON file"
    )
    failures_parser.add_argument(
        "--limit", "-l",
        type=int,
        default=20,
        help="Maximum records to show"
    )
    failures_parser.set_defaults(func=cmd_failures)
    
    # test command
    test_parser = subparsers.add_parser("test", help="Test connections")
    test_parser.set_defaults(func=cmd_test_connection)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
