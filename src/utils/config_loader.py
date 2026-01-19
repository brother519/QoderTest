"""Configuration loader with environment variable interpolation."""

import os
import re
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv


class ConfigLoader:
    """Load and manage configuration from YAML files with environment variable support."""
    
    _instance = None
    _config: dict[str, Any] = {}
    
    def __new__(cls) -> "ConfigLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True
        self._config = {}
        self._load_env()
    
    def _load_env(self) -> None:
        """Load environment variables from .env file."""
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(env_path)
    
    def _interpolate_env(self, value: Any) -> Any:
        """Interpolate environment variables in string values.
        
        Supports formats:
        - ${VAR_NAME} - required, raises error if not found
        - ${VAR_NAME:default} - optional with default value
        """
        if not isinstance(value, str):
            return value
        
        pattern = r"\$\{([^}:]+)(?::([^}]*))?\}"
        
        def replace(match: re.Match) -> str:
            var_name = match.group(1)
            default = match.group(2)
            
            env_value = os.environ.get(var_name)
            if env_value is not None:
                return env_value
            if default is not None:
                return default
            raise ValueError(f"Environment variable '{var_name}' not set and no default provided")
        
        return re.sub(pattern, replace, value)
    
    def _process_config(self, config: Any) -> Any:
        """Recursively process config to interpolate environment variables."""
        if isinstance(config, dict):
            return {k: self._process_config(v) for k, v in config.items()}
        elif isinstance(config, list):
            return [self._process_config(item) for item in config]
        else:
            return self._interpolate_env(config)
    
    def load(self, config_name: str, config_dir: str | Path | None = None) -> dict[str, Any]:
        """Load a configuration file.
        
        Args:
            config_name: Name of the config file (without .yaml extension)
            config_dir: Optional config directory path
            
        Returns:
            Loaded and processed configuration dictionary
        """
        if config_name in self._config:
            return self._config[config_name]
        
        if config_dir is None:
            config_dir = Path(__file__).parent.parent.parent / "config"
        else:
            config_dir = Path(config_dir)
        
        config_path = config_dir / f"{config_name}.yaml"
        
        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        with open(config_path, "r", encoding="utf-8") as f:
            raw_config = yaml.safe_load(f)
        
        processed_config = self._process_config(raw_config)
        self._config[config_name] = processed_config
        
        return processed_config
    
    def get(self, config_name: str, key: str, default: Any = None) -> Any:
        """Get a specific value from a configuration file.
        
        Args:
            config_name: Name of the config file
            key: Dot-separated key path (e.g., 'sync.batch_size')
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        config = self.load(config_name)
        
        keys = key.split(".")
        value = config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def reload(self, config_name: str | None = None) -> None:
        """Reload configuration file(s).
        
        Args:
            config_name: Specific config to reload, or None to reload all
        """
        if config_name:
            self._config.pop(config_name, None)
            self.load(config_name)
        else:
            names = list(self._config.keys())
            self._config.clear()
            for name in names:
                self.load(name)
    
    @property
    def app_config(self) -> dict[str, Any]:
        """Get main application config."""
        return self.load("config")
    
    @property
    def database_config(self) -> dict[str, Any]:
        """Get database config."""
        return self.load("database")
    
    @property
    def mapping_config(self) -> dict[str, Any]:
        """Get table mapping config."""
        return self.load("mapping")
    
    @property
    def schedule_config(self) -> dict[str, Any]:
        """Get schedule config."""
        return self.load("schedule")


# Global config instance
config = ConfigLoader()


def get_config() -> ConfigLoader:
    """Get the global config loader instance."""
    return config
