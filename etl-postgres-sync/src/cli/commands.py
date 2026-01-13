"""
CLI commands for ETL pipeline.
Provides commands for running, monitoring, and managing the pipeline.
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import box

from src.core.pipeline import create_pipeline, FailedRecordHandler
from src.utils.checkpoint import get_checkpoint_manager
from src.utils.db import get_db_manager
from src.utils.logger import get_logger


console = Console()


@click.group()
def cli():
    """ETL Pipeline for PostgreSQL Data Sync"""
    pass


@cli.command()
@click.option('--tables', '-t', multiple=True, help='Specific tables to sync (default: all)')
@click.option('--full', is_flag=True, help='Full sync (ignore checkpoints)')
@click.option('--dry-run', is_flag=True, help='Preview changes without writing')
def sync(tables: tuple, full: bool, dry_run: bool):
    """Run the ETL sync pipeline."""
    pipeline = create_pipeline()
    
    if dry_run:
        pipeline.loader.dry_run = True
        console.print("[yellow]DRY RUN MODE - No changes will be written[/yellow]\n")
    
    table_list = list(tables) if tables else None
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Running sync...", total=None)
        
        try:
            report = pipeline.run(tables=table_list, full_sync=full)
            progress.remove_task(task)
        except Exception as e:
            progress.remove_task(task)
            console.print(f"[red]Pipeline failed: {e}[/red]")
            sys.exit(1)
    
    # Display results
    _display_sync_report(report.to_dict())
    
    if report.status == 'failed':
        sys.exit(1)


@cli.command()
def status():
    """Show current pipeline status."""
    checkpoint_mgr = get_checkpoint_manager()
    status = checkpoint_mgr.get_status()
    
    # Pipeline status panel
    status_color = {
        'idle': 'white',
        'running': 'yellow',
        'completed': 'green',
        'failed': 'red'
    }.get(status['status'].split(':')[0], 'white')
    
    console.print(Panel(
        f"[{status_color}]{status['status']}[/{status_color}]",
        title="Pipeline Status",
        subtitle=f"Run ID: {status['pipeline_run_id'] or 'N/A'}"
    ))
    
    # Tables status table
    if status['tables']:
        table = Table(title="Table Sync Status", box=box.ROUNDED)
        table.add_column("Table", style="cyan")
        table.add_column("Last Sync", style="green")
        table.add_column("Records Synced", justify="right")
        table.add_column("Last Run", style="yellow")
        
        for table_name, table_status in status['tables'].items():
            table.add_row(
                table_name,
                table_status['last_sync'] or 'Never',
                str(table_status['records_synced']),
                table_status['last_run'] or 'Never'
            )
        
        console.print(table)
    else:
        console.print("[dim]No tables have been synced yet[/dim]")


@cli.command()
def health():
    """Check database connections and configuration."""
    db_manager = get_db_manager()
    
    console.print("\n[bold]Health Check[/bold]\n")
    
    # Check source database
    source_ok, source_msg = db_manager.check_source_connection()
    source_status = "[green]OK[/green]" if source_ok else "[red]FAILED[/red]"
    console.print(f"Source Database: {source_status}")
    if not source_ok:
        console.print(f"  [dim]{source_msg}[/dim]")
    
    # Check target database
    target_ok, target_msg = db_manager.check_target_connection()
    target_status = "[green]OK[/green]" if target_ok else "[red]FAILED[/red]"
    console.print(f"Target Database: {target_status}")
    if not target_ok:
        console.print(f"  [dim]{target_msg}[/dim]")
    
    # Check configuration
    config_path = Path(__file__).parent.parent.parent / 'config'
    config_files = ['database.yaml', 'schema_mappings.yaml', 'settings.yaml']
    
    console.print("\n[bold]Configuration Files[/bold]")
    for filename in config_files:
        exists = (config_path / filename).exists()
        status = "[green]Found[/green]" if exists else "[red]Missing[/red]"
        console.print(f"  {filename}: {status}")
    
    # Check directories
    console.print("\n[bold]Directories[/bold]")
    base_path = Path(__file__).parent.parent.parent
    directories = ['checkpoints', 'failed_records', 'logs']
    for dirname in directories:
        dir_path = base_path / dirname
        exists = dir_path.exists()
        status = "[green]OK[/green]" if exists else "[yellow]Will be created[/yellow]"
        console.print(f"  {dirname}: {status}")
    
    # Overall health
    overall_ok = source_ok and target_ok
    console.print()
    if overall_ok:
        console.print("[green]System is healthy and ready to sync[/green]")
    else:
        console.print("[red]System has issues that need to be resolved[/red]")
        sys.exit(1)


@cli.command()
@click.option('--table', '-t', help='Filter by table name')
@click.option('--date', '-d', help='Filter by date (YYYY-MM-DD)')
@click.option('--limit', '-l', default=20, help='Number of records to show')
def failed(table: Optional[str], date: Optional[str], limit: int):
    """Show failed records for manual review."""
    handler = FailedRecordHandler()
    records = handler.get_failed_records(table_name=table, date=date)
    
    if not records:
        console.print("[dim]No failed records found[/dim]")
        return
    
    console.print(f"\n[bold]Failed Records[/bold] (showing {min(limit, len(records))} of {len(records)})\n")
    
    for i, record in enumerate(records[:limit]):
        console.print(Panel(
            f"[cyan]Table:[/cyan] {record['table']}\n"
            f"[cyan]Timestamp:[/cyan] {record['timestamp']}\n"
            f"[cyan]Run ID:[/cyan] {record['run_id']}\n"
            f"[cyan]Errors:[/cyan]\n" + 
            '\n'.join(f"  - {e.get('field', 'unknown')}: {e.get('error', 'Unknown error')}" 
                     for e in record.get('errors', [])),
            title=f"Record {i+1}",
            border_style="red"
        ))


@cli.command('retry-failed')
@click.option('--table', '-t', required=True, help='Table to retry')
@click.option('--date', '-d', help='Date of failed records (YYYY-MM-DD)')
@click.option('--dry-run', is_flag=True, help='Preview without writing')
def retry_failed(table: str, date: Optional[str], dry_run: bool):
    """Retry loading failed records after manual correction."""
    handler = FailedRecordHandler()
    records = handler.get_failed_records(table_name=table, date=date)
    
    if not records:
        console.print("[dim]No failed records found[/dim]")
        return
    
    console.print(f"Found {len(records)} failed records for table '{table}'")
    
    if dry_run:
        console.print("[yellow]DRY RUN - would attempt to reload these records[/yellow]")
        return
    
    # This is a placeholder - actual implementation would:
    # 1. Load the failed records from the files
    # 2. Re-validate them
    # 3. Attempt to load them again
    console.print("[yellow]Retry functionality not yet implemented[/yellow]")
    console.print("Please manually fix and reload the records.")


@cli.command()
@click.option('--table', '-t', help='Reset specific table (default: all)')
@click.option('--confirm', is_flag=True, help='Confirm reset without prompting')
def reset(table: Optional[str], confirm: bool):
    """Reset checkpoints (for full re-sync)."""
    checkpoint_mgr = get_checkpoint_manager()
    
    if table:
        msg = f"Reset checkpoint for table '{table}'?"
    else:
        msg = "Reset ALL checkpoints? This will trigger a full sync."
    
    if not confirm:
        if not click.confirm(msg):
            console.print("Cancelled")
            return
    
    if table:
        checkpoint_mgr.reset_table(table)
        console.print(f"[green]Checkpoint reset for table '{table}'[/green]")
    else:
        checkpoint_mgr.reset_all()
        console.print("[green]All checkpoints reset[/green]")


@cli.command()
@click.option('--tail', '-n', default=50, help='Number of lines to show')
@click.option('--level', '-l', type=click.Choice(['DEBUG', 'INFO', 'WARNING', 'ERROR']), help='Filter by level')
def logs(tail: int, level: Optional[str]):
    """View recent log entries."""
    log_dir = Path(__file__).parent.parent.parent / 'logs'
    log_file = log_dir / 'etl_pipeline.log'
    
    if not log_file.exists():
        console.print("[dim]No log file found[/dim]")
        return
    
    # Read last N lines
    with open(log_file, 'r') as f:
        lines = f.readlines()
    
    lines = lines[-tail:]
    
    for line in lines:
        try:
            entry = json.loads(line)
            entry_level = entry.get('level', 'INFO')
            
            if level and entry_level != level:
                continue
            
            # Color by level
            level_colors = {
                'DEBUG': 'dim',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red'
            }
            color = level_colors.get(entry_level, 'white')
            
            timestamp = entry.get('timestamp', '')[:19]
            event = entry.get('event', 'unknown')
            
            # Format extra fields
            extras = {k: v for k, v in entry.items() 
                     if k not in ['timestamp', 'level', 'event', 'logger']}
            extras_str = ' '.join(f"{k}={v}" for k, v in extras.items())
            
            console.print(f"[dim]{timestamp}[/dim] [{color}]{entry_level:7}[/{color}] {event} [dim]{extras_str}[/dim]")
        
        except json.JSONDecodeError:
            # Plain text log line
            console.print(line.strip())


def _display_sync_report(report: dict):
    """Display sync report in a formatted table."""
    console.print()
    
    # Summary panel
    status_color = 'green' if report['status'] == 'completed' else 'red'
    console.print(Panel(
        f"[{status_color}]{report['status'].upper()}[/{status_color}]\n"
        f"Duration: {report['duration_seconds']:.1f}s",
        title=f"Sync Report - {report['run_id']}",
        subtitle=f"{report['tables_processed']} tables processed"
    ))
    
    # Totals
    totals = report['totals']
    console.print(f"\n[bold]Totals:[/bold]")
    console.print(f"  Extracted:   {totals['extracted']:,}")
    console.print(f"  Transformed: {totals['transformed']:,}")
    console.print(f"  Validated:   {totals['validated']:,}")
    console.print(f"  Loaded:      [green]{totals['loaded']:,}[/green]")
    console.print(f"  Failed:      [red]{totals['failed']:,}[/red]")
    
    # Per-table breakdown
    if report['tables']:
        table = Table(title="\nPer-Table Results", box=box.ROUNDED)
        table.add_column("Table", style="cyan")
        table.add_column("Extracted", justify="right")
        table.add_column("Loaded", justify="right", style="green")
        table.add_column("Failed", justify="right", style="red")
        table.add_column("Duration", justify="right")
        
        for table_name, stats in report['tables'].items():
            table.add_row(
                table_name,
                str(stats['extracted']),
                str(stats['loaded']),
                str(stats['failed']),
                f"{stats['duration_seconds']:.1f}s"
            )
        
        console.print(table)
    
    # Errors
    if report['errors']:
        console.print("\n[red bold]Errors:[/red bold]")
        for error in report['errors']:
            console.print(f"  [red]- {error}[/red]")
    
    console.print()


def main():
    """Entry point for CLI."""
    cli()


if __name__ == '__main__':
    main()
