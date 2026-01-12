"""Tests for the transformer module."""

import pytest
from datetime import datetime
from decimal import Decimal

from src.core.transformer import Transformer, TransformError


class TestTransformer:
    """Test cases for Transformer class."""
    
    @pytest.fixture
    def sample_config(self):
        """Sample table configuration."""
        return {
            "source_table": "old_users",
            "target_table": "new_users",
            "primary_key": "id",
            "field_mappings": [
                {"source": "user_id", "target": "id", "type": "bigint"},
                {"source": "user_name", "target": "username", "type": "varchar", "max_length": 100},
                {"source": "email", "target": "email", "type": "varchar"},
                {
                    "source": "status",
                    "target": "status",
                    "transform": "value_map",
                    "map": {0: "inactive", 1: "active", 2: "suspended"}
                },
                {"source": "created_at", "target": "created_at", "type": "timestamp"},
            ]
        }
    
    @pytest.fixture
    def transformer(self, sample_config):
        """Create transformer instance."""
        return Transformer(sample_config)
    
    def test_basic_field_mapping(self, transformer):
        """Test basic field mapping."""
        record = {
            "user_id": 123,
            "user_name": "john_doe",
            "email": "john@example.com",
            "status": 1,
            "created_at": datetime(2024, 1, 1, 12, 0, 0)
        }
        
        result = transformer.transform_record(record)
        
        assert result["id"] == 123
        assert result["username"] == "john_doe"
        assert result["email"] == "john@example.com"
        assert result["status"] == "active"
        assert result["created_at"] == datetime(2024, 1, 1, 12, 0, 0)
    
    def test_value_map_transform(self, transformer):
        """Test value map transformation."""
        records = [
            {"user_id": 1, "user_name": "a", "email": "a@b.com", "status": 0, "created_at": None},
            {"user_id": 2, "user_name": "b", "email": "b@b.com", "status": 1, "created_at": None},
            {"user_id": 3, "user_name": "c", "email": "c@b.com", "status": 2, "created_at": None},
        ]
        
        results = [transformer.transform_record(r) for r in records]
        
        assert results[0]["status"] == "inactive"
        assert results[1]["status"] == "active"
        assert results[2]["status"] == "suspended"
    
    def test_type_conversion_int(self, transformer):
        """Test integer type conversion."""
        record = {
            "user_id": "456",  # String that should be converted to int
            "user_name": "test",
            "email": "test@test.com",
            "status": 1,
            "created_at": None
        }
        
        result = transformer.transform_record(record)
        
        assert result["id"] == 456
        assert isinstance(result["id"], int)
    
    def test_null_handling(self, transformer):
        """Test handling of null values."""
        record = {
            "user_id": 1,
            "user_name": None,
            "email": None,
            "status": 1,
            "created_at": None
        }
        
        result = transformer.transform_record(record)
        
        assert result["username"] is None
        assert result["email"] is None
    
    def test_batch_transform(self, transformer):
        """Test batch transformation."""
        records = [
            {"user_id": 1, "user_name": "a", "email": "a@b.com", "status": 1, "created_at": None},
            {"user_id": 2, "user_name": "b", "email": "b@b.com", "status": 0, "created_at": None},
        ]
        
        successful, failed = transformer.transform_batch(records)
        
        assert len(successful) == 2
        assert len(failed) == 0
    
    def test_get_target_columns(self, transformer):
        """Test getting target column names."""
        columns = transformer.get_target_columns()
        
        assert "id" in columns
        assert "username" in columns
        assert "email" in columns
        assert "status" in columns
        assert "created_at" in columns


class TestTransformerWithGlobalSettings:
    """Test transformer with global settings."""
    
    @pytest.fixture
    def config_with_global(self):
        return {
            "source_table": "test",
            "target_table": "test_new",
            "field_mappings": [
                {"source": "name", "target": "name", "type": "varchar"},
                {"source": "value", "target": "value", "type": "varchar"},
            ]
        }
    
    @pytest.fixture
    def global_settings(self):
        return {
            "trim_strings": True,
            "null_string_replacement": ""
        }
    
    def test_trim_strings(self, config_with_global, global_settings):
        """Test string trimming."""
        transformer = Transformer(config_with_global, global_settings)
        
        record = {"name": "  test  ", "value": "hello"}
        result = transformer.transform_record(record)
        
        assert result["name"] == "test"
        assert result["value"] == "hello"


class TestBuiltinTransforms:
    """Test built-in transform functions."""
    
    @pytest.fixture
    def transformer(self):
        config = {
            "source_table": "test",
            "target_table": "test_new",
            "field_mappings": []
        }
        return Transformer(config)
    
    def test_transform_to_string(self, transformer):
        """Test to_string transform."""
        result = transformer._transform_to_string(123, {})
        assert result == "123"
        
        result = transformer._transform_to_string(None, {})
        assert result is None
    
    def test_transform_to_int(self, transformer):
        """Test to_int transform."""
        result = transformer._transform_to_int("456", {})
        assert result == 456
        
        result = transformer._transform_to_int(None, {})
        assert result is None
    
    def test_transform_to_decimal(self, transformer):
        """Test to_decimal transform."""
        result = transformer._transform_to_decimal("123.456", {"scale": 2})
        assert result == Decimal("123.46")
    
    def test_transform_lowercase(self, transformer):
        """Test lowercase transform."""
        result = transformer._transform_lowercase("HELLO", {})
        assert result == "hello"
    
    def test_transform_uppercase(self, transformer):
        """Test uppercase transform."""
        result = transformer._transform_uppercase("hello", {})
        assert result == "HELLO"
    
    def test_transform_trim(self, transformer):
        """Test trim transform."""
        result = transformer._transform_trim("  hello  ", {})
        assert result == "hello"
    
    def test_transform_concat(self, transformer):
        """Test concat transform."""
        result = transformer._transform_concat(["John", "Doe"], {"separator": " "})
        assert result == "John Doe"
        
        result = transformer._transform_concat(["a", "b", "c"], {"separator": "-"})
        assert result == "a-b-c"
