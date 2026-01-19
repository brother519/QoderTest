"""
Data validator for ETL pipeline.
Validates data before inserting into target database.
"""

from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml
from pydantic import BaseModel, ValidationError, create_model, field_validator
from pydantic.fields import FieldInfo

from src.utils.logger import get_logger


def load_schema_mappings() -> dict:
    """Load schema mappings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'schema_mappings.yaml'
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


# Type mapping from config strings to Python types
TYPE_MAPPING = {
    'string': str,
    'integer': int,
    'float': float,
    'decimal': Decimal,
    'boolean': bool,
    'datetime': datetime,
    'date': datetime,
    'any': Any,
}


class ValidationResult:
    """Result of validation for a batch of records."""
    
    def __init__(self):
        self.valid_records: list[dict] = []
        self.invalid_records: list[dict] = []
        self.errors: list[dict] = []  # {record_id, field, error, record}
    
    @property
    def valid_count(self) -> int:
        return len(self.valid_records)
    
    @property
    def invalid_count(self) -> int:
        return len(self.invalid_records)
    
    @property
    def total_count(self) -> int:
        return self.valid_count + self.invalid_count
    
    def add_valid(self, record: dict):
        """Add a valid record."""
        self.valid_records.append(record)
    
    def add_invalid(self, record: dict, errors: list[dict]):
        """Add an invalid record with its errors."""
        self.invalid_records.append(record)
        self.errors.extend(errors)
    
    def to_dataframes(self) -> tuple[pd.DataFrame, pd.DataFrame]:
        """Convert results to DataFrames."""
        valid_df = pd.DataFrame(self.valid_records) if self.valid_records else pd.DataFrame()
        invalid_df = pd.DataFrame(self.invalid_records) if self.invalid_records else pd.DataFrame()
        return valid_df, invalid_df


class DataValidator:
    """
    Validates data against target schema.
    
    Uses Pydantic for schema validation with support for:
    - Type validation
    - Required fields
    - Field constraints
    - Custom validators
    """
    
    def __init__(self):
        self.logger = get_logger()
        self.schema_mappings = load_schema_mappings()
        self._validators: dict[str, type[BaseModel]] = {}
    
    def get_table_config(self, table_name: str) -> dict:
        """Get configuration for a specific table."""
        tables = self.schema_mappings.get('tables', {})
        if table_name not in tables:
            raise ValueError(f"Table '{table_name}' not found in schema mappings")
        return tables[table_name]
    
    def _create_validator_model(self, table_name: str) -> type[BaseModel]:
        """Dynamically create a Pydantic model for validation."""
        table_config = self.get_table_config(table_name)
        validation_config = table_config.get('validation', {})
        
        required_fields = set(validation_config.get('required_fields', []))
        field_types = validation_config.get('field_types', {})
        
        # Build field definitions
        fields = {}
        for field_name, type_str in field_types.items():
            python_type = TYPE_MAPPING.get(type_str, Any)
            
            if field_name in required_fields:
                # Required field - no default
                fields[field_name] = (python_type, ...)
            else:
                # Optional field - default to None
                fields[field_name] = (Optional[python_type], None)
        
        # Create dynamic model
        model = create_model(
            f'{table_name.title()}Validator',
            **fields
        )
        
        return model
    
    def get_validator(self, table_name: str) -> type[BaseModel]:
        """Get or create validator model for a table."""
        if table_name not in self._validators:
            self._validators[table_name] = self._create_validator_model(table_name)
        return self._validators[table_name]
    
    def validate_record(
        self,
        record: dict,
        table_name: str,
        record_id: Any = None
    ) -> tuple[bool, list[dict]]:
        """
        Validate a single record.
        
        Returns:
            Tuple of (is_valid, errors)
        """
        validator = self.get_validator(table_name)
        table_config = self.get_table_config(table_name)
        pk_field = table_config.get('primary_key', 'id')
        
        if record_id is None:
            record_id = record.get(pk_field, 'unknown')
        
        errors = []
        
        try:
            # Validate with Pydantic
            validator(**record)
            return True, []
        
        except ValidationError as e:
            for error in e.errors():
                field = '.'.join(str(loc) for loc in error['loc'])
                errors.append({
                    'record_id': record_id,
                    'table': table_name,
                    'field': field,
                    'error': error['msg'],
                    'type': error['type']
                })
            
            return False, errors
    
    def validate_batch(
        self,
        df: pd.DataFrame,
        table_name: str
    ) -> ValidationResult:
        """
        Validate a batch of records.
        
        Returns:
            ValidationResult with valid/invalid records and errors
        """
        result = ValidationResult()
        
        if df.empty:
            return result
        
        table_config = self.get_table_config(table_name)
        pk_field = table_config.get('primary_key', 'id')
        validation_config = table_config.get('validation', {})
        required_fields = set(validation_config.get('required_fields', []))
        
        # Convert DataFrame to records
        records = df.to_dict('records')
        
        for record in records:
            record_id = record.get(pk_field, 'unknown')
            
            # Quick check for required fields
            missing_required = []
            for field in required_fields:
                value = record.get(field)
                if value is None or (isinstance(value, float) and pd.isna(value)):
                    missing_required.append(field)
            
            if missing_required:
                errors = [{
                    'record_id': record_id,
                    'table': table_name,
                    'field': field,
                    'error': 'Field required',
                    'type': 'missing'
                } for field in missing_required]
                result.add_invalid(record, errors)
                continue
            
            # Full validation
            is_valid, errors = self.validate_record(record, table_name, record_id)
            
            if is_valid:
                result.add_valid(record)
            else:
                result.add_invalid(record, errors)
                self.logger.log_validation_error(
                    table_name,
                    record_id,
                    [e['error'] for e in errors]
                )
        
        self.logger.debug(
            'batch_validated',
            table=table_name,
            total=result.total_count,
            valid=result.valid_count,
            invalid=result.invalid_count
        )
        
        return result
    
    def validate_required_fields(
        self,
        df: pd.DataFrame,
        table_name: str
    ) -> tuple[pd.DataFrame, pd.DataFrame]:
        """
        Quick validation of required fields only.
        
        Returns:
            Tuple of (valid_df, invalid_df)
        """
        if df.empty:
            return df, pd.DataFrame()
        
        table_config = self.get_table_config(table_name)
        validation_config = table_config.get('validation', {})
        required_fields = validation_config.get('required_fields', [])
        
        if not required_fields:
            return df, pd.DataFrame()
        
        # Check which fields exist in DataFrame
        existing_required = [f for f in required_fields if f in df.columns]
        
        if not existing_required:
            return df, pd.DataFrame()
        
        # Create mask for valid rows (all required fields are non-null)
        valid_mask = df[existing_required].notna().all(axis=1)
        
        valid_df = df[valid_mask].copy()
        invalid_df = df[~valid_mask].copy()
        
        return valid_df, invalid_df
    
    def check_unique_constraints(
        self,
        df: pd.DataFrame,
        table_name: str
    ) -> list[dict]:
        """
        Check for duplicate values in unique fields within the batch.
        
        Returns:
            List of errors for duplicate values
        """
        table_config = self.get_table_config(table_name)
        validation_config = table_config.get('validation', {})
        unique_fields = validation_config.get('unique_fields', [])
        pk_field = table_config.get('primary_key', 'id')
        
        errors = []
        
        for field in unique_fields:
            if field not in df.columns:
                continue
            
            # Find duplicates
            duplicates = df[df.duplicated(subset=[field], keep=False)]
            
            if not duplicates.empty:
                for _, row in duplicates.iterrows():
                    errors.append({
                        'record_id': row.get(pk_field, 'unknown'),
                        'table': table_name,
                        'field': field,
                        'error': f'Duplicate value: {row[field]}',
                        'type': 'unique_constraint'
                    })
        
        return errors


# Convenience function
def create_validator() -> DataValidator:
    """Create a new DataValidator instance."""
    return DataValidator()
