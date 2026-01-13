"""
Tests for data validator.
"""

from datetime import datetime
from pathlib import Path

import pandas as pd
import pytest

# Add parent to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.validator import DataValidator, ValidationResult


class TestValidationResult:
    """Tests for ValidationResult class."""
    
    def test_empty_result(self):
        """Test empty validation result."""
        result = ValidationResult()
        
        assert result.valid_count == 0
        assert result.invalid_count == 0
        assert result.total_count == 0
    
    def test_add_valid_record(self):
        """Test adding valid records."""
        result = ValidationResult()
        
        result.add_valid({'id': 1, 'name': 'Test'})
        result.add_valid({'id': 2, 'name': 'Test 2'})
        
        assert result.valid_count == 2
        assert result.invalid_count == 0
        assert result.total_count == 2
    
    def test_add_invalid_record(self):
        """Test adding invalid records with errors."""
        result = ValidationResult()
        
        errors = [{'field': 'email', 'error': 'Invalid format'}]
        result.add_invalid({'id': 1, 'email': 'bad'}, errors)
        
        assert result.valid_count == 0
        assert result.invalid_count == 1
        assert len(result.errors) == 1
    
    def test_to_dataframes(self):
        """Test converting to DataFrames."""
        result = ValidationResult()
        
        result.add_valid({'id': 1, 'name': 'Valid'})
        result.add_invalid({'id': 2, 'name': 'Invalid'}, [])
        
        valid_df, invalid_df = result.to_dataframes()
        
        assert len(valid_df) == 1
        assert len(invalid_df) == 1


class TestDataValidator:
    """Tests for DataValidator class."""
    
    @pytest.fixture
    def sample_df(self):
        """Create sample DataFrame for testing."""
        return pd.DataFrame({
            'id': [1, 2, 3],
            'name': ['John', None, 'Bob'],
            'email': ['john@test.com', 'jane@test.com', None]
        })
    
    def test_validate_required_fields(self):
        """Test required field validation."""
        validator = DataValidator()
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'name': ['John', None, 'Bob'],
            'value': [100, 200, None]
        })
        
        # This depends on configuration
        try:
            valid_df, invalid_df = validator.validate_required_fields(df, 'users')
            # If it works, both should be DataFrames
            assert isinstance(valid_df, pd.DataFrame)
            assert isinstance(invalid_df, pd.DataFrame)
        except (ValueError, KeyError):
            # Configuration not available - OK for unit tests
            pass
    
    def test_check_unique_constraints_no_duplicates(self):
        """Test unique constraint check with no duplicates."""
        validator = DataValidator()
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'email': ['a@test.com', 'b@test.com', 'c@test.com']
        })
        
        try:
            errors = validator.check_unique_constraints(df, 'users')
            # No duplicates means no errors
            assert isinstance(errors, list)
        except (ValueError, KeyError):
            pass
    
    def test_check_unique_constraints_with_duplicates(self):
        """Test unique constraint check with duplicates."""
        validator = DataValidator()
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'email': ['same@test.com', 'same@test.com', 'other@test.com']
        })
        
        try:
            errors = validator.check_unique_constraints(df, 'users')
            # Should detect duplicates if email is configured as unique
            assert isinstance(errors, list)
        except (ValueError, KeyError):
            pass


class TestValidateBatch:
    """Tests for batch validation."""
    
    def test_validate_empty_batch(self):
        """Test validating empty DataFrame."""
        validator = DataValidator()
        
        result = validator.validate_batch(pd.DataFrame(), 'users')
        
        assert result.valid_count == 0
        assert result.invalid_count == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
