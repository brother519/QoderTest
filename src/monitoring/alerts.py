"""Alert module for sending notifications when issues occur."""

import smtplib
from abc import ABC, abstractmethod
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Any
import json

import requests

from ..utils.config_loader import get_config
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AlertChannel(ABC):
    """Abstract base class for alert channels."""
    
    @abstractmethod
    def send(self, title: str, message: str, severity: str = "warning") -> bool:
        """Send an alert.
        
        Args:
            title: Alert title
            message: Alert message
            severity: Alert severity (info, warning, critical)
            
        Returns:
            True if sent successfully
        """
        pass


class EmailAlert(AlertChannel):
    """Send alerts via email."""
    
    def __init__(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        recipients: list[str],
        from_addr: str | None = None
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.recipients = recipients
        self.from_addr = from_addr or username
    
    def send(self, title: str, message: str, severity: str = "warning") -> bool:
        try:
            msg = MIMEMultipart()
            msg["Subject"] = f"[{severity.upper()}] {title}"
            msg["From"] = self.from_addr
            msg["To"] = ", ".join(self.recipients)
            
            body = f"""
            <html>
            <body>
            <h2 style="color: {'red' if severity == 'critical' else 'orange'};">{title}</h2>
            <pre>{message}</pre>
            <hr>
            <p>ETL Data Sync Pipeline Alert</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, "html"))
            
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            logger.info("Email alert sent", title=title, recipients=self.recipients)
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
            return False


class DingTalkAlert(AlertChannel):
    """Send alerts via DingTalk webhook."""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    def send(self, title: str, message: str, severity: str = "warning") -> bool:
        try:
            color_map = {
                "info": "#1890ff",
                "warning": "#faad14",
                "critical": "#f5222d"
            }
            
            data = {
                "msgtype": "markdown",
                "markdown": {
                    "title": title,
                    "text": f"### [{severity.upper()}] {title}\n\n{message}"
                }
            }
            
            response = requests.post(
                self.webhook_url,
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("DingTalk alert sent", title=title)
                return True
            else:
                logger.error(f"DingTalk alert failed: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send DingTalk alert: {e}")
            return False


class SlackAlert(AlertChannel):
    """Send alerts via Slack webhook."""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    def send(self, title: str, message: str, severity: str = "warning") -> bool:
        try:
            color_map = {
                "info": "#36a64f",
                "warning": "#daa038",
                "critical": "#dc3545"
            }
            
            data = {
                "attachments": [{
                    "color": color_map.get(severity, "#daa038"),
                    "title": title,
                    "text": message,
                    "footer": "ETL Data Sync Pipeline"
                }]
            }
            
            response = requests.post(
                self.webhook_url,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("Slack alert sent", title=title)
                return True
            else:
                logger.error(f"Slack alert failed: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
            return False


class AlertManager:
    """Manage alert channels and rules."""
    
    def __init__(self):
        self.channels: list[AlertChannel] = []
        self._setup_channels()
    
    def _setup_channels(self) -> None:
        """Setup alert channels from configuration."""
        import os
        
        # Setup email if configured
        email_host = os.environ.get("ALERT_EMAIL_HOST")
        if email_host:
            self.channels.append(EmailAlert(
                host=email_host,
                port=int(os.environ.get("ALERT_EMAIL_PORT", 587)),
                username=os.environ.get("ALERT_EMAIL_USER", ""),
                password=os.environ.get("ALERT_EMAIL_PASSWORD", ""),
                recipients=os.environ.get("ALERT_EMAIL_RECIPIENTS", "").split(",")
            ))
        
        # Setup DingTalk if configured
        dingtalk_webhook = os.environ.get("DINGTALK_WEBHOOK")
        if dingtalk_webhook:
            self.channels.append(DingTalkAlert(dingtalk_webhook))
        
        # Setup Slack if configured
        slack_webhook = os.environ.get("SLACK_WEBHOOK")
        if slack_webhook:
            self.channels.append(SlackAlert(slack_webhook))
    
    def add_channel(self, channel: AlertChannel) -> None:
        """Add an alert channel.
        
        Args:
            channel: Alert channel to add
        """
        self.channels.append(channel)
    
    def send_alert(
        self,
        title: str,
        message: str,
        severity: str = "warning"
    ) -> bool:
        """Send alert to all channels.
        
        Args:
            title: Alert title
            message: Alert message
            severity: Alert severity
            
        Returns:
            True if at least one channel succeeded
        """
        if not self.channels:
            logger.warning("No alert channels configured")
            return False
        
        success = False
        for channel in self.channels:
            if channel.send(title, message, severity):
                success = True
        
        return success
    
    def alert_high_failure_rate(self, rate: float, threshold: float = 5.0) -> None:
        """Send alert for high failure rate.
        
        Args:
            rate: Current failure rate percentage
            threshold: Threshold percentage
        """
        if rate > threshold:
            self.send_alert(
                "High Failure Rate Detected",
                f"Current failure rate: {rate:.2f}%\nThreshold: {threshold}%",
                severity="warning" if rate < threshold * 2 else "critical"
            )
    
    def alert_sync_failed(self, table_name: str, error: str) -> None:
        """Send alert for sync failure.
        
        Args:
            table_name: Failed table name
            error: Error message
        """
        self.send_alert(
            f"Sync Failed: {table_name}",
            f"Table: {table_name}\nError: {error}",
            severity="critical"
        )
    
    def alert_connection_failed(self, db_type: str, error: str) -> None:
        """Send alert for database connection failure.
        
        Args:
            db_type: Database type (source/target)
            error: Error message
        """
        self.send_alert(
            f"Database Connection Failed: {db_type}",
            f"Failed to connect to {db_type} database.\nError: {error}",
            severity="critical"
        )


# Global alert manager
alert_manager = AlertManager()


def send_alert(title: str, message: str, severity: str = "warning") -> bool:
    """Send an alert using the global alert manager.
    
    Args:
        title: Alert title
        message: Alert message
        severity: Alert severity
        
    Returns:
        True if sent successfully
    """
    return alert_manager.send_alert(title, message, severity)
