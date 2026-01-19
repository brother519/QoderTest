"""Base database connector with connection pooling."""

from abc import ABC, abstractmethod
from contextlib import contextmanager
from typing import Any, Generator, Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool

from ..utils.logger import get_logger

logger = get_logger(__name__)


class BaseConnector(ABC):
    """Abstract base class for database connectors."""
    
    def __init__(self, config: dict[str, Any]):
        """Initialize connector with configuration.
        
        Args:
            config: Database configuration dictionary
        """
        self.config = config
        self._engine: Engine | None = None
        self._session_factory: sessionmaker | None = None
    
    @abstractmethod
    def _build_connection_url(self) -> str:
        """Build database connection URL."""
        pass
    
    def _create_engine(self) -> Engine:
        """Create SQLAlchemy engine with connection pooling."""
        url = self._build_connection_url()
        
        pool_size = self.config.get("pool_size", 10)
        max_overflow = self.config.get("max_overflow", 5)
        pool_timeout = self.config.get("pool_timeout", 30)
        echo = self.config.get("echo", False)
        
        engine = create_engine(
            url,
            poolclass=QueuePool,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_timeout=pool_timeout,
            pool_pre_ping=True,  # Enable connection health checks
            echo=echo,
        )
        
        logger.info(
            "Database engine created",
            db_type=self.config.get("type"),
            host=self.config.get("host"),
            database=self.config.get("database"),
            pool_size=pool_size
        )
        
        return engine
    
    @property
    def engine(self) -> Engine:
        """Get or create the SQLAlchemy engine."""
        if self._engine is None:
            self._engine = self._create_engine()
        return self._engine
    
    @property
    def session_factory(self) -> sessionmaker:
        """Get or create session factory."""
        if self._session_factory is None:
            self._session_factory = sessionmaker(bind=self.engine)
        return self._session_factory
    
    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """Get a database session with automatic cleanup.
        
        Yields:
            SQLAlchemy session
        """
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    @contextmanager
    def get_connection(self):
        """Get a raw database connection.
        
        Yields:
            SQLAlchemy connection
        """
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()
    
    def execute(self, query: str, params: dict[str, Any] | None = None) -> Any:
        """Execute a SQL query.
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Returns:
            Query result
        """
        with self.get_connection() as conn:
            result = conn.execute(text(query), params or {})
            return result
    
    def fetch_all(self, query: str, params: dict[str, Any] | None = None) -> list[dict]:
        """Execute query and fetch all results as dictionaries.
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Returns:
            List of row dictionaries
        """
        with self.get_connection() as conn:
            result = conn.execute(text(query), params or {})
            columns = result.keys()
            return [dict(zip(columns, row)) for row in result.fetchall()]
    
    def fetch_batches(
        self,
        query: str,
        params: dict[str, Any] | None = None,
        batch_size: int = 1000
    ) -> Iterator[list[dict]]:
        """Execute query and yield results in batches.
        
        Args:
            query: SQL query string
            params: Query parameters
            batch_size: Number of rows per batch
            
        Yields:
            Batches of row dictionaries
        """
        with self.get_connection() as conn:
            result = conn.execute(text(query), params or {})
            columns = list(result.keys())
            
            while True:
                rows = result.fetchmany(batch_size)
                if not rows:
                    break
                yield [dict(zip(columns, row)) for row in rows]
    
    def test_connection(self) -> bool:
        """Test database connection.
        
        Returns:
            True if connection successful
        """
        try:
            with self.get_connection() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            return True
        except Exception as e:
            logger.error("Database connection test failed", error=str(e))
            return False
    
    def close(self) -> None:
        """Close the database engine and all connections."""
        if self._engine:
            self._engine.dispose()
            self._engine = None
            self._session_factory = None
            logger.info("Database connection closed")
    
    def __enter__(self) -> "BaseConnector":
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()
