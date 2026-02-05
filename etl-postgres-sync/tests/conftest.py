"""
Pytest configuration and fixtures.
"""

import os
import sys
from pathlib import Path

import pytest

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment variables
os.environ.setdefault('SOURCE_DB_HOST', 'localhost')
os.environ.setdefault('SOURCE_DB_PORT', '5432')
os.environ.setdefault('SOURCE_DB_NAME', 'test_source')
os.environ.setdefault('SOURCE_DB_USER', 'test')
os.environ.setdefault('SOURCE_DB_PASSWORD', 'test')
os.environ.setdefault('TARGET_DB_HOST', 'localhost')
os.environ.setdefault('TARGET_DB_PORT', '5432')
os.environ.setdefault('TARGET_DB_NAME', 'test_target')
os.environ.setdefault('TARGET_DB_USER', 'test')
os.environ.setdefault('TARGET_DB_PASSWORD', 'test')


@pytest.fixture(scope='session')
def project_root():
    """Return project root directory."""
    return Path(__file__).parent.parent


@pytest.fixture(scope='session')
def config_dir(project_root):
    """Return config directory."""
    return project_root / 'config'


@pytest.fixture
def mock_env(monkeypatch):
    """Set up mock environment variables."""
    monkeypatch.setenv('SOURCE_DB_HOST', 'localhost')
    monkeypatch.setenv('SOURCE_DB_PORT', '5432')
    monkeypatch.setenv('SOURCE_DB_NAME', 'test_source')
    monkeypatch.setenv('SOURCE_DB_USER', 'test')
    monkeypatch.setenv('SOURCE_DB_PASSWORD', 'test')
    monkeypatch.setenv('TARGET_DB_HOST', 'localhost')
    monkeypatch.setenv('TARGET_DB_PORT', '5432')
    monkeypatch.setenv('TARGET_DB_NAME', 'test_target')
    monkeypatch.setenv('TARGET_DB_USER', 'test')
    monkeypatch.setenv('TARGET_DB_PASSWORD', 'test')
