"""
Database connection utilities for ETL pipeline.
Handles connection pooling for source and target PostgreSQL databases.
"""

import os
import re
from pathlib import Path
from typing import Any, Generator

import yaml
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

# Load environment variables
load_dotenv()


def interpolate_env_vars(value: str) -> str:
    """Replace ${VAR_NAME} patterns with environment variable values."""
    pattern = r'\$\{([^}]+)\}'
    
    def replace(match):
        var_name = match.group(1)
        return os.environ.get(var_name, '')
    
    return re.sub(pattern, replace, str(value))


def load_database_config(config_path: str = None) -> dict:
    """Load database configuration from YAML file."""
    if config_path is None:
        config_path = Path(__file__).parent.parent.parent / 'config' / 'database.yaml'
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Interpolate environment variables
    for db_name in ['source', 'target']:
        if db_name in config:
            for key, value in config[db_name].items():
                if isinstance(value, str):
                    config[db_name][key] = interpolate_env_vars(value)
    
    return config


def create_connection_url(db_config: dict) -> str:
    """Create PostgreSQL connection URL from config."""
    return (
        f"postgresql://{db_config['user']}:{db_config['password']}"
        f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    )


class DatabaseManager:
    """Manages database connections for source and target databases."""
    
    def __init__(self, config_path: str = None):
        self.config = load_database_config(config_path)
        self._source_engine: Engine = None
        self._target_engine: Engine = None
        self._source_session_factory = None
        self._target_session_factory = None
    
    @property
    def source_engine(self) -> Engine:
        """Get or create source database engine."""
        if self._source_engine is None:
            source_config = self.config['source']
            self._source_engine = create_engine(
                create_connection_url(source_config),
                pool_size=int(source_config.get('pool_size', 5)),
                max_overflow=int(source_config.get('max_overflow', 10)),
                pool_timeout=int(source_config.get('pool_timeout', 30)),
                pool_recycle=int(source_config.get('pool_recycle', 1800)),
                echo=False
            )
        return self._source_engine
    
    @property
    def target_engine(self) -> Engine:
        """Get or create target database engine."""
        if self._target_engine is None:
            target_config = self.config['target']
            self._target_engine = create_engine(
                create_connection_url(target_config),
                pool_size=int(target_config.get('pool_size', 10)),
                max_overflow=int(target_config.get('max_overflow', 20)),
                pool_timeout=int(target_config.get('pool_timeout', 30)),
                pool_recycle=int(target_config.get('pool_recycle', 1800)),
                echo=False
            )
        return self._target_engine
    
    def get_source_session(self) -> Session:
        """Create a new source database session."""
        if self._source_session_factory is None:
            self._source_session_factory = sessionmaker(bind=self.source_engine)
        return self._source_session_factory()
    
    def get_target_session(self) -> Session:
        """Create a new target database session."""
        if self._target_session_factory is None:
            self._target_session_factory = sessionmaker(bind=self.target_engine)
        return self._target_session_factory()
    
    def check_source_connection(self) -> tuple[bool, str]:
        """Check if source database is reachable."""
        try:
            with self.source_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True, "Source database connection successful"
        except Exception as e:
            return False, f"Source database connection failed: {str(e)}"
    
    def check_target_connection(self) -> tuple[bool, str]:
        """Check if target database is reachable."""
        try:
            with self.target_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True, "Target database connection successful"
        except Exception as e:
            return False, f"Target database connection failed: {str(e)}"
    
    def health_check(self) -> dict[str, Any]:
        """Perform health check on both databases."""
        source_ok, source_msg = self.check_source_connection()
        target_ok, target_msg = self.check_target_connection()
        
        return {
            'healthy': source_ok and target_ok,
            'source': {'connected': source_ok, 'message': source_msg},
            'target': {'connected': target_ok, 'message': target_msg}
        }
    
    def close(self):
        """Close all database connections."""
        if self._source_engine:
            self._source_engine.dispose()
            self._source_engine = None
        if self._target_engine:
            self._target_engine.dispose()
            self._target_engine = None


# Global database manager instance
_db_manager: DatabaseManager = None


def get_db_manager(config_path: str = None) -> DatabaseManager:
    """Get or create global database manager instance."""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager(config_path)
    return _db_manager


def reset_db_manager():
    """Reset the global database manager (useful for testing)."""
    global _db_manager
    if _db_manager:
        _db_manager.close()
    _db_manager = None
