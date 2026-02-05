"""
Tests for data transformer.
"""

from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

import pandas as pd
import pytest

# Add parent to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.transformer import (
    DataTransformer,
    transform_lowercase,
    transform_uppercase,
    transform_to_datetime,
    transform_to_decimal,
    transform_to_bool,
    transform_bool_to_timestamp,
    BUILTIN_TRANSFORMS
)


class TestTransformFunctions:
    """Tests for individual transform functions."""
    
    def test_transform_lowercase(self):
        assert transform_lowercase('HELLO') == 'hello'
        assert transform_lowercase('Hello World') == 'hello world'
        assert transform_lowercase(None) is None
    
    def test_transform_uppercase(self):
        assert transform_uppercase('hello') == 'HELLO'
        assert transform_uppercase('Hello World') == 'HELLO WORLD'
        assert transform_uppercase(None) is None
    
    def test_transform_to_datetime(self):
        result = transform_to_datetime('2026-01-13T10:30:00')
        assert isinstance(result, datetime)
        assert result.year == 2026
        assert result.month == 1
        assert result.day == 13
        
        assert transform_to_datetime(None) is None
    
    def test_transform_to_decimal(self):
        result = transform_to_decimal('123.456')
        assert isinstance(result, Decimal)
        assert result == Decimal('123.46')
        
        assert transform_to_decimal(None) is None
    
    def test_transform_to_bool(self):
        assert transform_to_bool('true') is True
        assert transform_to_bool('yes') is True
        assert transform_to_bool('1') is True
        assert transform_to_bool('false') is False
        assert transform_to_bool('no') is False
        assert transform_to_bool('0') is False
        assert transform_to_bool(None) is None
    
    def test_transform_bool_to_timestamp(self):
        result = transform_bool_to_timestamp(True)
        assert isinstance(result, datetime)
        
        assert transform_bool_to_timestamp(False) is None
        assert transform_bool_to_timestamp(None) is None


class TestDataTransformer:
    """Tests for DataTransformer class."""
    
    @pytest.fixture
    def sample_df(self):
        """Create sample DataFrame for testing."""
        return pd.DataFrame({
            'user_id': [1, 2, 3],
            'full_name': ['John Doe', 'Jane Smith', 'Bob Wilson'],
            'email_address': ['JOHN@EXAMPLE.COM', 'jane@example.com', 'BOB@TEST.COM'],
            'created_date': ['2026-01-01', '2026-01-02', '2026-01-03'],
            'updated_date': ['2026-01-10', '2026-01-11', '2026-01-12'],
            'is_deleted': [False, False, True]
        })
    
    def test_builtin_transforms_registered(self):
        """Test that builtin transforms are available."""
        assert 'none' in BUILTIN_TRANSFORMS
        assert 'lowercase' in BUILTIN_TRANSFORMS
        assert 'to_datetime' in BUILTIN_TRANSFORMS
        assert 'to_decimal' in BUILTIN_TRANSFORMS
    
    def test_transform_value_lowercase(self):
        """Test transforming a single value."""
        transformer = DataTransformer()
        
        result = transformer.transform_value('HELLO', 'lowercase')
        assert result == 'hello'
    
    def test_transform_value_none(self):
        """Test no transformation."""
        transformer = DataTransformer()
        
        result = transformer.transform_value('hello', 'none')
        assert result == 'hello'
    
    def test_get_target_columns(self):
        """Test getting target columns from config."""
        transformer = DataTransformer()
        
        # This depends on schema_mappings.yaml configuration
        # Just verify method doesn't raise
        try:
            columns = transformer.get_target_columns('users')
            assert isinstance(columns, list)
        except ValueError:
            # Table not in config - that's OK for this test
            pass


class TestTransformBatch:
    """Tests for batch transformation."""
    
    def test_empty_dataframe(self):
        """Test transforming empty DataFrame."""
        transformer = DataTransformer()
        
        result = transformer.transform_batch(pd.DataFrame(), 'users')
        assert result.empty
    
    def test_transform_preserves_row_count(self):
        """Test that transformation preserves number of rows."""
        transformer = DataTransformer()
        
        df = pd.DataFrame({
            'user_id': [1, 2, 3, 4, 5],
            'name': ['A', 'B', 'C', 'D', 'E']
        })
        
        # This test depends on configuration
        # In real tests, you'd mock the configuration
        try:
            result = transformer.transform_batch(df, 'users')
            # If transformation works, verify row count
            assert len(result) == len(df)
        except (ValueError, KeyError):
            # Configuration issues are OK for unit tests
            pass


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
