package config

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server    ServerConfig    `mapstructure:"server"`
	Database  DatabaseConfig  `mapstructure:"database"`
	Redis     RedisConfig     `mapstructure:"redis"`
	Storage   StorageConfig   `mapstructure:"storage"`
	CDN       CDNConfig       `mapstructure:"cdn"`
	Upload    UploadConfig    `mapstructure:"upload"`
	Thumbnail ThumbnailConfig `mapstructure:"thumbnail"`
	Worker    WorkerConfig    `mapstructure:"worker"`
	Cleanup   CleanupConfig   `mapstructure:"cleanup"`
	Logging   LoggingConfig   `mapstructure:"logging"`
}

type ServerConfig struct {
	Port            int           `mapstructure:"port"`
	Mode            string        `mapstructure:"mode"`
	ShutdownTimeout time.Duration `mapstructure:"shutdown_timeout"`
}

type DatabaseConfig struct {
	Host           string        `mapstructure:"host"`
	Port           int           `mapstructure:"port"`
	User           string        `mapstructure:"user"`
	Password       string        `mapstructure:"password"`
	DBName         string        `mapstructure:"dbname"`
	SSLMode        string        `mapstructure:"sslmode"`
	MaxOpenConns   int           `mapstructure:"max_open_conns"`
	MaxIdleConns   int           `mapstructure:"max_idle_conns"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
}

func (d DatabaseConfig) DSN() string {
	return "host=" + d.Host +
		" port=" + itoa(d.Port) +
		" user=" + d.User +
		" password=" + d.Password +
		" dbname=" + d.DBName +
		" sslmode=" + d.SSLMode
}

type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

type StorageConfig struct {
	Endpoint      string `mapstructure:"endpoint"`
	AccessKey     string `mapstructure:"access_key"`
	SecretKey     string `mapstructure:"secret_key"`
	Region        string `mapstructure:"region"`
	UseSSL        bool   `mapstructure:"use_ssl"`
	DefaultBucket string `mapstructure:"default_bucket"`
}

type CDNConfig struct {
	Enabled bool   `mapstructure:"enabled"`
	BaseURL string `mapstructure:"base_url"`
}

type UploadConfig struct {
	MaxFileSize   int64         `mapstructure:"max_file_size"`
	ChunkSize     int64         `mapstructure:"chunk_size"`
	SessionExpiry time.Duration `mapstructure:"session_expiry"`
	AllowedTypes  []string      `mapstructure:"allowed_types"`
}

type ThumbnailSize struct {
	Width  int `mapstructure:"width"`
	Height int `mapstructure:"height"`
}

type ThumbnailConfig struct {
	Enabled bool                     `mapstructure:"enabled"`
	Sizes   map[string]ThumbnailSize `mapstructure:"sizes"`
	Quality int                      `mapstructure:"quality"`
}

type WorkerConfig struct {
	Concurrency int `mapstructure:"concurrency"`
}

type CleanupConfig struct {
	Interval  time.Duration `mapstructure:"interval"`
	BatchSize int           `mapstructure:"batch_size"`
}

type LoggingConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

func Load(path string) (*Config, error) {
	viper.SetConfigFile(path)
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	s := ""
	for i > 0 {
		s = string(rune('0'+i%10)) + s
		i /= 10
	}
	return s
}
