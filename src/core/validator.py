"""Data validator module for validating transformed records before loading."""

import re
from datetime import datetime
from decimal import Decimal
from typing import Any, Callable

from pydantic import BaseModel, ValidationError, field_validator, create_model

from ..utils.logger import get_logger, SyncLogger

logger = get_logger(__name__)


class ValidationResult:
    """Result of validating a single record."""
    
    def __init__(self, record: dict[str, Any], record_id: Any = None):
        self.record = record
        self.record_id = record_id
        self.errors: list[dict[str, Any]] = []
        self.warnings: list[dict[str, Any]] = []
    
    @property
    def is_valid(self) -> bool:
        """Check if validation passed (no errors)."""
        return len(self.errors) == 0
    
    def add_error(self, field: str, rule: str, message: str, value: Any = None) -> None:
        """Add a validation error."""
        self.errors.append({
            "field": field,
            "rule": rule,
            "message": message,
            "value": value
        })
    
    def add_warning(self, field: str, rule: str, message: str, value: Any = None) -> None:
        """Add a validation warning."""
        self.warnings.append({
            "field": field,
            "rule": rule,
            "message": message,
            "value": value
        })
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "record_id": self.record_id,
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings)
        }


class Validator:
    """Validate transformed records against schema and business rules."""
    
    # Built-in validation rules
    RULES: dict[str, Callable] = {}
    
    def __init__(self, table_config: dict[str, Any]):
        """Initialize validator.
        
        Args:
            table_config: Table mapping configuration
        """
        self.table_config = table_config
        self.field_mappings = table_config.get("field_mappings", [])
        self.validators = table_config.get("validators", [])
        self.primary_key = table_config.get("primary_key", "id")
        self.target_table = table_config.get("target_table", "")
        self._logger = SyncLogger(table_name=self.target_table)
        
        # Build field config lookup
        self._field_config: dict[str, dict] = {}
        for mapping in self.field_mappings:
            target = mapping.get("target")
            if target:
                self._field_config[target] = mapping
        
        # Register built-in validators
        self._register_builtin_rules()
    
    def _register_builtin_rules(self) -> None:
        """Register built-in validation rules."""
        self.RULES = {
            "not_null": self._validate_not_null,
            "not_empty": self._validate_not_empty,
            "min_length": self._validate_min_length,
            "max_length": self._validate_max_length,
            "min_value": self._validate_min_value,
            "max_value": self._validate_max_value,
            "email_format": self._validate_email,
            "phone_format": self._validate_phone,
            "regex": self._validate_regex,
            "in_list": self._validate_in_list,
            "date_range": self._validate_date_range,
            "positive": self._validate_positive,
            "non_negative": self._validate_non_negative,
        }
    
    def register_rule(self, name: str, func: Callable) -> None:
        """Register a custom validation rule.
        
        Args:
            name: Rule name
            func: Validation function that takes (value, config) and returns (is_valid, message)
        """
        self.RULES[name] = func
    
    def validate_record(self, record: dict[str, Any]) -> ValidationResult:
        """Validate a single record.
        
        Args:
            record: Transformed record dictionary
            
        Returns:
            ValidationResult with errors and warnings
        """
        record_id = record.get(self.primary_key)
        result = ValidationResult(record, record_id)
        
        # Schema validation based on field mappings
        for target, config in self._field_config.items():
            value = record.get(target)
            
            # Type validation
            expected_type = config.get("type")
            if expected_type and value is not None:
                if not self._validate_type(value, expected_type):
                    result.add_error(
                        target,
                        "type",
                        f"Expected type {expected_type}, got {type(value).__name__}",
                        value
                    )
            
            # Max length for strings
            max_length = config.get("max_length")
            if max_length and isinstance(value, str) and len(value) > max_length:
                result.add_error(
                    target,
                    "max_length",
                    f"Value exceeds max length of {max_length}",
                    value
                )
            
            # Field-level validators from mapping
            field_validators = config.get("validators", [])
            for validator_name in field_validators:
                if validator_name in self.RULES:
                    is_valid, message = self.RULES[validator_name](value, {})
                    if not is_valid:
                        result.add_error(target, validator_name, message, value)
        
        # Custom validators from table config
        for validator in self.validators:
            field = validator.get("field")
            rule = validator.get("rule")
            
            if field not in record:
                continue
            
            value = record[field]
            
            if rule in self.RULES:
                is_valid, message = self.RULES[rule](value, validator)
                if not is_valid:
                    severity = validator.get("severity", "error")
                    if severity == "warning":
                        result.add_warning(field, rule, message, value)
                    else:
                        result.add_error(field, rule, message, value)
        
        return result
    
    def validate_batch(
        self,
        records: list[dict[str, Any]]
    ) -> tuple[list[dict], list[tuple[dict, ValidationResult]]]:
        """Validate a batch of records.
        
        Args:
            records: List of transformed records
            
        Returns:
            Tuple of (valid records, invalid records with results)
        """
        valid: list[dict] = []
        invalid: list[tuple[dict, ValidationResult]] = []
        
        for record in records:
            result = self.validate_record(record)
            
            if result.is_valid:
                valid.append(record)
            else:
                invalid.append((record, result))
                self._logger.record_failed(
                    result.record_id,
                    "validate",
                    "; ".join(e["message"] for e in result.errors[:3])
                )
        
        return valid, invalid
    
    def _validate_type(self, value: Any, expected_type: str) -> bool:
        """Validate value matches expected type."""
        type_lower = expected_type.lower()
        
        if type_lower in ("int", "integer", "bigint"):
            return isinstance(value, int) and not isinstance(value, bool)
        elif type_lower in ("float", "double", "real"):
            return isinstance(value, (int, float)) and not isinstance(value, bool)
        elif type_lower == "decimal":
            return isinstance(value, (int, float, Decimal))
        elif type_lower in ("varchar", "text", "string"):
            return isinstance(value, str)
        elif type_lower in ("timestamp", "datetime"):
            return isinstance(value, datetime)
        elif type_lower == "date":
            from datetime import date
            return isinstance(value, date)
        elif type_lower in ("bool", "boolean"):
            return isinstance(value, bool)
        
        return True
    
    # Built-in rule implementations
    
    def _validate_not_null(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value is not null."""
        if value is None:
            return False, "Value cannot be null"
        return True, ""
    
    def _validate_not_empty(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value is not null or empty string."""
        if value is None or value == "":
            return False, "Value cannot be empty"
        return True, ""
    
    def _validate_min_length(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate string minimum length."""
        min_len = config.get("value", 0)
        if value is None:
            return True, ""
        if len(str(value)) < min_len:
            return False, f"Value must be at least {min_len} characters"
        return True, ""
    
    def _validate_max_length(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate string maximum length."""
        max_len = config.get("value", float("inf"))
        if value is None:
            return True, ""
        if len(str(value)) > max_len:
            return False, f"Value must be at most {max_len} characters"
        return True, ""
    
    def _validate_min_value(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate numeric minimum value."""
        min_val = config.get("value", float("-inf"))
        if value is None:
            return True, ""
        try:
            if float(value) < min_val:
                return False, f"Value must be at least {min_val}"
        except (ValueError, TypeError):
            return False, "Value must be numeric"
        return True, ""
    
    def _validate_max_value(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate numeric maximum value."""
        max_val = config.get("value", float("inf"))
        if value is None:
            return True, ""
        try:
            if float(value) > max_val:
                return False, f"Value must be at most {max_val}"
        except (ValueError, TypeError):
            return False, "Value must be numeric"
        return True, ""
    
    def _validate_email(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate email format."""
        if value is None or value == "":
            return True, ""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, str(value)):
            return False, "Invalid email format"
        return True, ""
    
    def _validate_phone(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate phone number format."""
        if value is None or value == "":
            return True, ""
        # Basic phone validation - digits, spaces, dashes, parentheses
        cleaned = re.sub(r"[\s\-\(\)\+]", "", str(value))
        if not cleaned.isdigit() or len(cleaned) < 7 or len(cleaned) > 15:
            return False, "Invalid phone number format"
        return True, ""
    
    def _validate_regex(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value matches regex pattern."""
        pattern = config.get("pattern", ".*")
        if value is None:
            return True, ""
        if not re.match(pattern, str(value)):
            return False, f"Value does not match pattern: {pattern}"
        return True, ""
    
    def _validate_in_list(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value is in allowed list."""
        allowed = config.get("values", [])
        if value is None:
            return True, ""
        if value not in allowed and str(value) not in [str(v) for v in allowed]:
            return False, f"Value must be one of: {allowed}"
        return True, ""
    
    def _validate_date_range(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate date is within range."""
        if value is None:
            return True, ""
        
        min_date = config.get("min_date")
        max_date = config.get("max_date")
        
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except ValueError:
                return False, "Invalid date format"
        
        if min_date:
            if isinstance(min_date, str):
                min_date = datetime.fromisoformat(min_date)
            if value < min_date:
                return False, f"Date must be after {min_date}"
        
        if max_date:
            if isinstance(max_date, str):
                max_date = datetime.fromisoformat(max_date)
            if value > max_date:
                return False, f"Date must be before {max_date}"
        
        return True, ""
    
    def _validate_positive(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value is positive."""
        if value is None:
            return True, ""
        try:
            if float(value) <= 0:
                return False, "Value must be positive"
        except (ValueError, TypeError):
            return False, "Value must be numeric"
        return True, ""
    
    def _validate_non_negative(self, value: Any, config: dict) -> tuple[bool, str]:
        """Validate value is non-negative."""
        if value is None:
            return True, ""
        try:
            if float(value) < 0:
                return False, "Value cannot be negative"
        except (ValueError, TypeError):
            return False, "Value must be numeric"
        return True, ""
