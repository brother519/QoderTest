"""
Data transformer for ETL pipeline.
Transforms data from source schema to target schema.
"""

from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, Callable, Optional

import pandas as pd
import yaml

from src.utils.logger import get_logger


def load_schema_mappings() -> dict:
    """Load schema mappings from configuration file."""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'schema_mappings.yaml'
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


# Built-in transformation functions
def transform_none(value: Any) -> Any:
    """No transformation - return value as-is."""
    return value


def transform_lowercase(value: Any) -> Optional[str]:
    """Convert string to lowercase."""
    if value is None:
        return None
    return str(value).lower()


def transform_uppercase(value: Any) -> Optional[str]:
    """Convert string to uppercase."""
    if value is None:
        return None
    return str(value).upper()


def transform_strip(value: Any) -> Optional[str]:
    """Strip whitespace from string."""
    if value is None:
        return None
    return str(value).strip()


def transform_to_datetime(value: Any) -> Optional[datetime]:
    """Parse value to datetime."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    return pd.to_datetime(value)


def transform_to_date(value: Any) -> Optional[datetime]:
    """Parse value to date (datetime with time set to midnight)."""
    if value is None:
        return None
    dt = transform_to_datetime(value)
    return dt.replace(hour=0, minute=0, second=0, microsecond=0) if dt else None


def transform_to_decimal(value: Any, precision: int = 2) -> Optional[Decimal]:
    """Convert value to decimal with specified precision."""
    if value is None:
        return None
    return round(Decimal(str(value)), precision)


def transform_to_int(value: Any) -> Optional[int]:
    """Convert value to integer."""
    if value is None:
        return None
    return int(float(value))


def transform_to_float(value: Any) -> Optional[float]:
    """Convert value to float."""
    if value is None:
        return None
    return float(value)


def transform_to_bool(value: Any) -> Optional[bool]:
    """Convert value to boolean."""
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', 'yes', '1', 't', 'y')
    return bool(value)


def transform_bool_to_timestamp(value: Any) -> Optional[datetime]:
    """Convert boolean true to current timestamp, false/null to null."""
    if value is None:
        return None
    if transform_to_bool(value):
        return datetime.now(timezone.utc)
    return None


def transform_null_to_default(value: Any, default: Any = '') -> Any:
    """Replace null values with default."""
    return default if value is None else value


# Registry of built-in transforms
BUILTIN_TRANSFORMS: dict[str, Callable] = {
    'none': transform_none,
    'lowercase': transform_lowercase,
    'uppercase': transform_uppercase,
    'strip': transform_strip,
    'to_datetime': transform_to_datetime,
    'to_date': transform_to_date,
    'to_decimal': transform_to_decimal,
    'to_int': transform_to_int,
    'to_float': transform_to_float,
    'to_bool': transform_to_bool,
    'bool_to_timestamp': transform_bool_to_timestamp,
    'null_to_default': transform_null_to_default,
}


class DataTransformer:
    """
    Transforms data from source schema to target schema.
    
    Uses configuration-driven mappings to:
    - Rename fields
    - Convert data types
    - Apply custom transformations
    - Handle computed fields
    """
    
    def __init__(self):
        self.logger = get_logger()
        self.schema_mappings = load_schema_mappings()
        self._custom_transforms: dict[str, Callable] = {}
        self._value_mappings: dict[str, dict] = {}
        
        # Load value mappings from config
        self._load_value_mappings()
    
    def _load_value_mappings(self):
        """Load value mapping configurations."""
        transforms = self.schema_mappings.get('transforms', {})
        for name, config in transforms.items():
            if config.get('type') == 'mapping':
                self._value_mappings[name] = config.get('values', {})
    
    def register_transform(self, name: str, func: Callable):
        """Register a custom transformation function."""
        self._custom_transforms[name] = func
    
    def get_transform(self, name: str) -> Callable:
        """Get transformation function by name."""
        # Check custom transforms first
        if name in self._custom_transforms:
            return self._custom_transforms[name]
        
        # Check built-in transforms
        if name in BUILTIN_TRANSFORMS:
            return BUILTIN_TRANSFORMS[name]
        
        # Check if it's a value mapping
        if name in self._value_mappings:
            mapping = self._value_mappings[name]
            return lambda v: mapping.get(v, v)  # Return original if not in mapping
        
        raise ValueError(f"Unknown transform: {name}")
    
    def get_table_config(self, table_name: str) -> dict:
        """Get configuration for a specific table."""
        tables = self.schema_mappings.get('tables', {})
        if table_name not in tables:
            raise ValueError(f"Table '{table_name}' not found in schema mappings")
        return tables[table_name]
    
    def transform_value(self, value: Any, transform_name: str) -> Any:
        """Apply a transformation to a single value."""
        if transform_name == 'none' or not transform_name:
            return value
        
        transform_func = self.get_transform(transform_name)
        try:
            return transform_func(value)
        except Exception as e:
            self.logger.warning(
                'transform_error',
                transform=transform_name,
                value=str(value)[:100],
                error=str(e)
            )
            return value
    
    def transform_record(self, record: dict, table_name: str) -> dict:
        """Transform a single record according to table mappings."""
        table_config = self.get_table_config(table_name)
        mappings = table_config.get('mappings', [])
        
        transformed = {}
        
        for mapping in mappings:
            source_field = mapping['source']
            target_field = mapping['target']
            transform_name = mapping.get('transform', 'none')
            
            # Get source value
            if source_field in record:
                value = record[source_field]
            else:
                self.logger.debug(
                    'missing_source_field',
                    field=source_field,
                    table=table_name
                )
                continue
            
            # Apply transformation
            transformed_value = self.transform_value(value, transform_name)
            
            # Handle field splitting (e.g., full_name -> [first_name, last_name])
            if isinstance(target_field, list):
                # Split value into multiple fields
                if transformed_value and isinstance(transformed_value, str):
                    parts = transformed_value.split(' ', len(target_field) - 1)
                    for i, field in enumerate(target_field):
                        transformed[field] = parts[i] if i < len(parts) else ''
                else:
                    for field in target_field:
                        transformed[field] = None
            else:
                transformed[target_field] = transformed_value
        
        return transformed
    
    def transform_batch(self, df: pd.DataFrame, table_name: str) -> pd.DataFrame:
        """
        Transform a batch of records (DataFrame).
        
        Optimized for batch processing using pandas operations where possible.
        """
        if df.empty:
            return pd.DataFrame()
        
        table_config = self.get_table_config(table_name)
        mappings = table_config.get('mappings', [])
        
        # Build column mapping
        transformed_data = {}
        
        for mapping in mappings:
            source_field = mapping['source']
            target_field = mapping['target']
            transform_name = mapping.get('transform', 'none')
            
            if source_field not in df.columns:
                self.logger.debug(
                    'missing_source_column',
                    column=source_field,
                    table=table_name
                )
                continue
            
            # Get source column
            source_col = df[source_field]
            
            # Apply transformation
            if transform_name == 'none' or not transform_name:
                transformed_col = source_col
            elif transform_name == 'lowercase':
                transformed_col = source_col.astype(str).str.lower().replace('nan', None)
            elif transform_name == 'uppercase':
                transformed_col = source_col.astype(str).str.upper().replace('nan', None)
            elif transform_name == 'strip':
                transformed_col = source_col.astype(str).str.strip().replace('nan', None)
            elif transform_name == 'to_datetime':
                transformed_col = pd.to_datetime(source_col, errors='coerce')
            elif transform_name == 'to_int':
                transformed_col = pd.to_numeric(source_col, errors='coerce').astype('Int64')
            elif transform_name == 'to_float':
                transformed_col = pd.to_numeric(source_col, errors='coerce')
            elif transform_name in self._value_mappings:
                # Apply value mapping
                value_map = self._value_mappings[transform_name]
                transformed_col = source_col.map(lambda x: value_map.get(x, x))
            else:
                # Fall back to row-by-row transformation
                transform_func = self.get_transform(transform_name)
                transformed_col = source_col.apply(
                    lambda x: transform_func(x) if pd.notna(x) else None
                )
            
            # Handle field splitting
            if isinstance(target_field, list):
                # Split string column into multiple fields
                if transformed_col.dtype == 'object':
                    split_df = transformed_col.str.split(' ', n=len(target_field)-1, expand=True)
                    for i, field in enumerate(target_field):
                        if i < split_df.shape[1]:
                            transformed_data[field] = split_df[i]
                        else:
                            transformed_data[field] = None
                else:
                    for field in target_field:
                        transformed_data[field] = None
            else:
                transformed_data[target_field] = transformed_col
        
        result_df = pd.DataFrame(transformed_data)
        
        self.logger.debug(
            'batch_transformed',
            table=table_name,
            input_records=len(df),
            output_records=len(result_df),
            output_columns=list(result_df.columns)
        )
        
        return result_df
    
    def get_target_columns(self, table_name: str) -> list[str]:
        """Get list of target columns for a table."""
        table_config = self.get_table_config(table_name)
        mappings = table_config.get('mappings', [])
        
        columns = []
        for mapping in mappings:
            target = mapping['target']
            if isinstance(target, list):
                columns.extend(target)
            else:
                columns.append(target)
        
        return columns


# Convenience function
def create_transformer() -> DataTransformer:
    """Create a new DataTransformer instance."""
    return DataTransformer()
