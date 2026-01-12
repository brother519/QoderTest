"""Tests for the validator module."""

import pytest
from datetime import datetime

from src.core.validator import Validator, ValidationResult


class TestValidator:
    """Test cases for Validator class."""
    
    @pytest.fixture
    def sample_config(self):
        """Sample table configuration."""
        return {
            "target_table": "new_users",
            "primary_key": "id",
            "field_mappings": [
                {"target": "id", "type": "bigint"},
                {"target": "username", "type": "varchar", "max_length": 100},
                {"target": "email", "type": "varchar", "validators": ["email_format"]},
                {"target": "age", "type": "int"},
                {"target": "status", "type": "varchar"},
            ],
            "validators": [
                {"field": "username", "rule": "not_empty"},
                {"field": "age", "rule": "min_value", "value": 0},
                {"field": "age", "rule": "max_value", "value": 150},
            ]
        }
    
    @pytest.fixture
    def validator(self, sample_config):
        """Create validator instance."""
        return Validator(sample_config)
    
    def test_valid_record(self, validator):
        """Test validation of a valid record."""
        record = {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "age": 25,
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_invalid_email(self, validator):
        """Test email validation failure."""
        record = {
            "id": 1,
            "username": "john_doe",
            "email": "invalid-email",
            "age": 25,
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert not result.is_valid
        assert any(e["rule"] == "email_format" for e in result.errors)
    
    def test_empty_username(self, validator):
        """Test not_empty validation failure."""
        record = {
            "id": 1,
            "username": "",
            "email": "john@example.com",
            "age": 25,
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert not result.is_valid
        assert any(e["rule"] == "not_empty" for e in result.errors)
    
    def test_age_out_of_range(self, validator):
        """Test min/max value validation."""
        record = {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "age": 200,  # Too high
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert not result.is_valid
        assert any(e["rule"] == "max_value" for e in result.errors)
    
    def test_negative_age(self, validator):
        """Test negative age validation."""
        record = {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "age": -5,  # Negative
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert not result.is_valid
        assert any(e["rule"] == "min_value" for e in result.errors)
    
    def test_max_length_violation(self, validator):
        """Test max length validation."""
        record = {
            "id": 1,
            "username": "a" * 150,  # Exceeds max_length of 100
            "email": "john@example.com",
            "age": 25,
            "status": "active"
        }
        
        result = validator.validate_record(record)
        
        assert not result.is_valid
        assert any(e["rule"] == "max_length" for e in result.errors)
    
    def test_batch_validation(self, validator):
        """Test batch validation."""
        records = [
            {"id": 1, "username": "user1", "email": "u1@test.com", "age": 25, "status": "active"},
            {"id": 2, "username": "", "email": "invalid", "age": 200, "status": "active"},  # Invalid
            {"id": 3, "username": "user3", "email": "u3@test.com", "age": 30, "status": "active"},
        ]
        
        valid, invalid = validator.validate_batch(records)
        
        assert len(valid) == 2
        assert len(invalid) == 1
        assert invalid[0][0]["id"] == 2


class TestValidationRules:
    """Test individual validation rules."""
    
    @pytest.fixture
    def validator(self):
        config = {
            "target_table": "test",
            "field_mappings": []
        }
        return Validator(config)
    
    def test_not_null(self, validator):
        """Test not_null rule."""
        is_valid, msg = validator._validate_not_null(None, {})
        assert not is_valid
        
        is_valid, msg = validator._validate_not_null("value", {})
        assert is_valid
    
    def test_not_empty(self, validator):
        """Test not_empty rule."""
        is_valid, msg = validator._validate_not_empty("", {})
        assert not is_valid
        
        is_valid, msg = validator._validate_not_empty(None, {})
        assert not is_valid
        
        is_valid, msg = validator._validate_not_empty("value", {})
        assert is_valid
    
    def test_email_format(self, validator):
        """Test email format validation."""
        valid_emails = ["test@example.com", "user.name@domain.co.uk", "user+tag@example.org"]
        invalid_emails = ["invalid", "no@domain", "@example.com", "user@"]
        
        for email in valid_emails:
            is_valid, _ = validator._validate_email(email, {})
            assert is_valid, f"Expected {email} to be valid"
        
        for email in invalid_emails:
            is_valid, _ = validator._validate_email(email, {})
            assert not is_valid, f"Expected {email} to be invalid"
    
    def test_phone_format(self, validator):
        """Test phone format validation."""
        valid_phones = ["1234567890", "+1 234 567 8901", "(123) 456-7890"]
        invalid_phones = ["123", "abcdefghij", ""]
        
        for phone in valid_phones:
            is_valid, _ = validator._validate_phone(phone, {})
            assert is_valid, f"Expected {phone} to be valid"
        
        for phone in invalid_phones:
            is_valid, _ = validator._validate_phone(phone, {})
            assert not is_valid, f"Expected {phone} to be invalid"
    
    def test_regex(self, validator):
        """Test regex validation."""
        is_valid, _ = validator._validate_regex("ABC123", {"pattern": r"^[A-Z]+\d+$"})
        assert is_valid
        
        is_valid, _ = validator._validate_regex("abc123", {"pattern": r"^[A-Z]+\d+$"})
        assert not is_valid
    
    def test_in_list(self, validator):
        """Test in_list validation."""
        config = {"values": ["a", "b", "c"]}
        
        is_valid, _ = validator._validate_in_list("a", config)
        assert is_valid
        
        is_valid, _ = validator._validate_in_list("d", config)
        assert not is_valid
    
    def test_positive(self, validator):
        """Test positive validation."""
        is_valid, _ = validator._validate_positive(5, {})
        assert is_valid
        
        is_valid, _ = validator._validate_positive(0, {})
        assert not is_valid
        
        is_valid, _ = validator._validate_positive(-1, {})
        assert not is_valid
    
    def test_non_negative(self, validator):
        """Test non_negative validation."""
        is_valid, _ = validator._validate_non_negative(5, {})
        assert is_valid
        
        is_valid, _ = validator._validate_non_negative(0, {})
        assert is_valid
        
        is_valid, _ = validator._validate_non_negative(-1, {})
        assert not is_valid


class TestValidationResult:
    """Test ValidationResult class."""
    
    def test_create_result(self):
        """Test creating validation result."""
        record = {"id": 1, "name": "test"}
        result = ValidationResult(record, record_id=1)
        
        assert result.is_valid
        assert result.record_id == 1
        assert len(result.errors) == 0
        assert len(result.warnings) == 0
    
    def test_add_error(self):
        """Test adding errors."""
        result = ValidationResult({}, record_id=1)
        result.add_error("email", "email_format", "Invalid email", "invalid")
        
        assert not result.is_valid
        assert len(result.errors) == 1
        assert result.errors[0]["field"] == "email"
    
    def test_add_warning(self):
        """Test adding warnings."""
        result = ValidationResult({}, record_id=1)
        result.add_warning("name", "length", "Name is short", "a")
        
        assert result.is_valid  # Warnings don't affect validity
        assert len(result.warnings) == 1
    
    def test_to_dict(self):
        """Test converting to dictionary."""
        result = ValidationResult({"id": 1}, record_id=1)
        result.add_error("email", "format", "Invalid")
        
        d = result.to_dict()
        
        assert d["record_id"] == 1
        assert d["is_valid"] is False
        assert d["error_count"] == 1
