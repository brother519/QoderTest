"""Data transformer module for converting source data to target format."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Callable

import pandas as pd

from ..utils.logger import get_logger, SyncLogger

logger = get_logger(__name__)


class TransformError(Exception):
    """Raised when data transformation fails."""
    
    def __init__(self, message: str, field: str | None = None, value: Any = None):
        self.message = message
        self.field = field
        self.value = value
        super().__init__(message)


class Transformer:
    """Transform source data to target format based on mapping configuration."""
    
    # Built-in transform functions
    TRANSFORMS: dict[str, Callable] = {}
    
    def __init__(self, table_config: dict[str, Any], global_settings: dict[str, Any] | None = None):
        """Initialize transformer.
        
        Args:
            table_config: Table mapping configuration
            global_settings: Global transformation settings
        """
        self.table_config = table_config
        self.global_settings = global_settings or {}
        self.field_mappings = table_config.get("field_mappings", [])
        self.source_table = table_config.get("source_table", "")
        self.target_table = table_config.get("target_table", "")
        self._logger = SyncLogger(table_name=self.source_table)
        
        # Build field mapping lookup
        self._field_map: dict[str, dict] = {}
        for mapping in self.field_mappings:
            source = mapping.get("source")
            if isinstance(source, str):
                self._field_map[source] = mapping
            elif isinstance(source, list):
                # Composite field mapping
                key = tuple(source)
                self._field_map[key] = mapping
        
        # Register built-in transforms
        self._register_builtin_transforms()
    
    def _register_builtin_transforms(self) -> None:
        """Register built-in transformation functions."""
        self.TRANSFORMS = {
            "value_map": self._transform_value_map,
            "to_string": self._transform_to_string,
            "to_int": self._transform_to_int,
            "to_float": self._transform_to_float,
            "to_decimal": self._transform_to_decimal,
            "to_datetime": self._transform_to_datetime,
            "to_date": self._transform_to_date,
            "trim": self._transform_trim,
            "lowercase": self._transform_lowercase,
            "uppercase": self._transform_uppercase,
            "concat": self._transform_concat,
            "default": self._transform_default,
        }
    
    def register_transform(self, name: str, func: Callable) -> None:
        """Register a custom transformation function.
        
        Args:
            name: Transform name
            func: Transform function that takes (value, mapping_config) and returns transformed value
        """
        self.TRANSFORMS[name] = func
    
    def transform_record(self, record: dict[str, Any]) -> dict[str, Any]:
        """Transform a single record from source to target format.
        
        Args:
            record: Source record dictionary
            
        Returns:
            Transformed record dictionary
            
        Raises:
            TransformError: If transformation fails
        """
        result: dict[str, Any] = {}
        
        for mapping in self.field_mappings:
            source = mapping.get("source")
            target = mapping.get("target")
            
            if not target:
                continue
            
            try:
                # Get source value(s)
                if isinstance(source, str):
                    value = record.get(source)
                elif isinstance(source, list):
                    # Composite source - get multiple values
                    value = [record.get(s) for s in source]
                else:
                    value = None
                
                # Apply transformation if specified
                transform_name = mapping.get("transform")
                if transform_name:
                    value = self._apply_transform(value, transform_name, mapping)
                else:
                    # Apply type conversion if no explicit transform
                    target_type = mapping.get("type")
                    if target_type:
                        value = self._convert_type(value, target_type, mapping)
                
                # Apply global settings
                if self.global_settings.get("trim_strings") and isinstance(value, str):
                    value = value.strip()
                
                # Handle NULL strings
                if value is None and self.global_settings.get("null_string_replacement") is not None:
                    if mapping.get("type") in ("varchar", "text", "string"):
                        value = self.global_settings["null_string_replacement"]
                
                result[target] = value
                
            except Exception as e:
                raise TransformError(
                    f"Failed to transform field '{source}' to '{target}': {str(e)}",
                    field=str(source),
                    value=record.get(source) if isinstance(source, str) else None
                )
        
        return result
    
    def transform_batch(self, records: list[dict[str, Any]]) -> tuple[list[dict], list[tuple[dict, TransformError]]]:
        """Transform a batch of records.
        
        Args:
            records: List of source records
            
        Returns:
            Tuple of (successful records, failed records with errors)
        """
        successful: list[dict] = []
        failed: list[tuple[dict, TransformError]] = []
        
        for record in records:
            try:
                transformed = self.transform_record(record)
                successful.append(transformed)
            except TransformError as e:
                failed.append((record, e))
                self._logger.record_failed(
                    record.get(self.table_config.get("primary_key", "id")),
                    "transform",
                    str(e)
                )
        
        return successful, failed
    
    def transform_batch_pandas(self, records: list[dict[str, Any]]) -> pd.DataFrame:
        """Transform a batch using pandas for better performance.
        
        Args:
            records: List of source records
            
        Returns:
            Transformed DataFrame
        """
        df = pd.DataFrame(records)
        result_df = pd.DataFrame()
        
        for mapping in self.field_mappings:
            source = mapping.get("source")
            target = mapping.get("target")
            
            if not target:
                continue
            
            if isinstance(source, str) and source in df.columns:
                result_df[target] = df[source]
            elif isinstance(source, list):
                # Handle composite fields
                if all(s in df.columns for s in source):
                    transform_name = mapping.get("transform")
                    if transform_name == "concat":
                        separator = mapping.get("separator", " ")
                        result_df[target] = df[source].astype(str).agg(separator.join, axis=1)
            
            # Apply value mapping
            if mapping.get("transform") == "value_map" and target in result_df.columns:
                value_map = mapping.get("map", {})
                result_df[target] = result_df[target].map(
                    lambda x: value_map.get(x, value_map.get(str(x), x))
                )
        
        return result_df
    
    def _apply_transform(
        self,
        value: Any,
        transform_name: str,
        mapping: dict[str, Any]
    ) -> Any:
        """Apply a named transformation to a value.
        
        Args:
            value: Input value
            transform_name: Name of the transform
            mapping: Field mapping configuration
            
        Returns:
            Transformed value
        """
        if transform_name not in self.TRANSFORMS:
            raise TransformError(f"Unknown transform: {transform_name}")
        
        transform_func = self.TRANSFORMS[transform_name]
        return transform_func(value, mapping)
    
    def _convert_type(self, value: Any, target_type: str, mapping: dict[str, Any]) -> Any:
        """Convert value to target type.
        
        Args:
            value: Input value
            target_type: Target data type
            mapping: Field mapping configuration
            
        Returns:
            Converted value
        """
        if value is None:
            return None
        
        type_lower = target_type.lower()
        
        if type_lower in ("int", "integer", "bigint"):
            return int(value) if value != "" else None
        elif type_lower in ("float", "double", "real"):
            return float(value) if value != "" else None
        elif type_lower == "decimal":
            precision = mapping.get("precision", 10)
            scale = mapping.get("scale", 2)
            return round(Decimal(str(value)), scale) if value != "" else None
        elif type_lower in ("varchar", "text", "string"):
            max_length = mapping.get("max_length")
            result = str(value)
            if max_length and len(result) > max_length:
                result = result[:max_length]
            return result
        elif type_lower in ("timestamp", "datetime"):
            if isinstance(value, datetime):
                return value
            return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        elif type_lower == "date":
            if isinstance(value, datetime):
                return value.date()
            return datetime.fromisoformat(str(value)[:10]).date()
        elif type_lower in ("bool", "boolean"):
            if isinstance(value, bool):
                return value
            return str(value).lower() in ("true", "1", "yes")
        
        return value
    
    # Built-in transform implementations
    
    def _transform_value_map(self, value: Any, mapping: dict[str, Any]) -> Any:
        """Map value using a lookup dictionary."""
        value_map = mapping.get("map", {})
        # Try exact match first, then string match
        if value in value_map:
            return value_map[value]
        str_value = str(value)
        if str_value in value_map:
            return value_map[str_value]
        # Return default or original value
        return mapping.get("default", value)
    
    def _transform_to_string(self, value: Any, mapping: dict[str, Any]) -> str | None:
        """Convert to string."""
        if value is None:
            return None
        return str(value)
    
    def _transform_to_int(self, value: Any, mapping: dict[str, Any]) -> int | None:
        """Convert to integer."""
        if value is None or value == "":
            return None
        return int(value)
    
    def _transform_to_float(self, value: Any, mapping: dict[str, Any]) -> float | None:
        """Convert to float."""
        if value is None or value == "":
            return None
        return float(value)
    
    def _transform_to_decimal(self, value: Any, mapping: dict[str, Any]) -> Decimal | None:
        """Convert to decimal."""
        if value is None or value == "":
            return None
        scale = mapping.get("scale", 2)
        return round(Decimal(str(value)), scale)
    
    def _transform_to_datetime(self, value: Any, mapping: dict[str, Any]) -> datetime | None:
        """Convert to datetime."""
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        fmt = mapping.get("format") or self.global_settings.get("timestamp_format", "%Y-%m-%d %H:%M:%S")
        return datetime.strptime(str(value), fmt)
    
    def _transform_to_date(self, value: Any, mapping: dict[str, Any]) -> Any:
        """Convert to date."""
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date()
        return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()
    
    def _transform_trim(self, value: Any, mapping: dict[str, Any]) -> str | None:
        """Trim whitespace."""
        if value is None:
            return None
        return str(value).strip()
    
    def _transform_lowercase(self, value: Any, mapping: dict[str, Any]) -> str | None:
        """Convert to lowercase."""
        if value is None:
            return None
        return str(value).lower()
    
    def _transform_uppercase(self, value: Any, mapping: dict[str, Any]) -> str | None:
        """Convert to uppercase."""
        if value is None:
            return None
        return str(value).upper()
    
    def _transform_concat(self, value: Any, mapping: dict[str, Any]) -> str | None:
        """Concatenate multiple values."""
        if value is None:
            return None
        if not isinstance(value, list):
            return str(value)
        separator = mapping.get("separator", " ")
        return separator.join(str(v) for v in value if v is not None)
    
    def _transform_default(self, value: Any, mapping: dict[str, Any]) -> Any:
        """Apply default value if None."""
        if value is None:
            return mapping.get("default_value")
        return value
    
    def get_target_columns(self) -> list[str]:
        """Get list of target column names.
        
        Returns:
            List of target column names
        """
        return [m["target"] for m in self.field_mappings if m.get("target")]
