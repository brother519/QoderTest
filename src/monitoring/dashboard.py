"""Flask-based monitoring dashboard."""

from datetime import datetime
from flask import Flask, render_template, jsonify, request
from typing import Any

from ..checkpoint.manager import CheckpointManager
from ..failure.handler import FailureHandler
from ..scheduler.cron_scheduler import SyncScheduler
from ..utils.config_loader import get_config
from ..utils.logger import get_logger
from .metrics import MetricsCollector

logger = get_logger(__name__)


def create_app() -> Flask:
    """Create and configure Flask application."""
    app = Flask(
        __name__,
        template_folder="../../dashboard/templates",
        static_folder="../../dashboard/static"
    )
    
    # Initialize components
    checkpoint_manager = CheckpointManager()
    failure_handler = FailureHandler()
    metrics_collector = MetricsCollector()
    scheduler = SyncScheduler()
    
    @app.route("/")
    def index():
        """Dashboard home page."""
        return render_template("index.html")
    
    @app.route("/api/status")
    def api_status():
        """Get overall pipeline status."""
        checkpoints = checkpoint_manager.get_all_checkpoints()
        running = [c for c in checkpoints if c.sync_status == "running"]
        
        scheduler_status = scheduler.get_status()
        failure_stats = failure_handler.get_statistics()
        failure_rate = metrics_collector.get_current_failure_rate()
        
        return jsonify({
            "status": "running" if running else "idle",
            "is_syncing": len(running) > 0,
            "running_tables": [c.table_name for c in running],
            "scheduler": scheduler_status,
            "failure_rate": failure_rate,
            "pending_failures": failure_stats.get("pending_count", 0),
            "timestamp": datetime.now().isoformat()
        })
    
    @app.route("/api/tables")
    def api_tables():
        """Get table sync status."""
        checkpoints = checkpoint_manager.get_all_checkpoints()
        
        tables = []
        for cp in checkpoints:
            progress = 0
            if cp.total_records > 0:
                progress = round(cp.processed_records / cp.total_records * 100, 1)
            
            tables.append({
                "name": cp.table_name,
                "status": cp.sync_status,
                "last_sync": cp.last_sync_timestamp.isoformat() if cp.last_sync_timestamp else None,
                "progress": progress,
                "processed": cp.processed_records,
                "total": cp.total_records,
                "error": cp.error_message
            })
        
        return jsonify(tables)
    
    @app.route("/api/metrics")
    def api_metrics():
        """Get sync metrics."""
        daily_stats = metrics_collector.get_daily_stats(7)
        hourly_throughput = metrics_collector.get_hourly_throughput(24)
        table_stats = metrics_collector.get_table_stats()
        
        return jsonify({
            "daily": daily_stats,
            "hourly": hourly_throughput,
            "tables": table_stats
        })
    
    @app.route("/api/recent-syncs")
    def api_recent_syncs():
        """Get recent sync operations."""
        limit = request.args.get("limit", 10, type=int)
        table = request.args.get("table")
        
        syncs = metrics_collector.get_recent_syncs(table, limit)
        return jsonify(syncs)
    
    @app.route("/api/failures")
    def api_failures():
        """Get failed records."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        table = request.args.get("table")
        status = request.args.get("status")
        
        offset = (page - 1) * per_page
        
        failures = failure_handler.get_failures(
            table_name=table,
            status=status,
            limit=per_page,
            offset=offset
        )
        
        total = failure_handler.get_failure_count(table, status)
        
        return jsonify({
            "data": [f.to_dict() for f in failures],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page
        })
    
    @app.route("/api/failures/stats")
    def api_failure_stats():
        """Get failure statistics."""
        stats = failure_handler.get_statistics()
        return jsonify(stats)
    
    @app.route("/api/failures/<int:failure_id>/resolve", methods=["POST"])
    def api_resolve_failure(failure_id: int):
        """Mark a failure as resolved."""
        failure_handler.mark_resolved(failure_id)
        return jsonify({"status": "ok"})
    
    @app.route("/api/failures/<int:failure_id>/ignore", methods=["POST"])
    def api_ignore_failure(failure_id: int):
        """Mark a failure as ignored."""
        failure_handler.mark_ignored(failure_id)
        return jsonify({"status": "ok"})
    
    @app.route("/api/sync/trigger", methods=["POST"])
    def api_trigger_sync():
        """Manually trigger a sync."""
        data = request.get_json() or {}
        tables = data.get("tables")
        full_sync = data.get("full_sync", False)
        
        result = scheduler.trigger_sync(tables, full_sync)
        return jsonify(result)
    
    @app.route("/api/checkpoints/<table_name>/reset", methods=["POST"])
    def api_reset_checkpoint(table_name: str):
        """Reset checkpoint for a table."""
        checkpoint_manager.reset_checkpoint(table_name)
        return jsonify({"status": "ok"})
    
    @app.route("/api/health")
    def api_health():
        """Health check endpoint."""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        })
    
    return app


def run_dashboard(host: str = "0.0.0.0", port: int = 5000, debug: bool = False) -> None:
    """Run the dashboard server.
    
    Args:
        host: Host to bind to
        port: Port to listen on
        debug: Enable debug mode
    """
    config = get_config()
    
    dashboard_config = config.get("config", "monitoring", {})
    host = dashboard_config.get("dashboard_host", host)
    port = dashboard_config.get("dashboard_port", port)
    
    app = create_app()
    
    logger.info(f"Starting dashboard on {host}:{port}")
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    run_dashboard(debug=True)
