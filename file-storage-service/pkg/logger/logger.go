package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func New(level, format string) (*zap.Logger, error) {
	var cfg zap.Config
	if format == "json" {
		cfg = zap.NewProductionConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
	}

	lvl, err := zapcore.ParseLevel(level)
	if err != nil {
		lvl = zapcore.InfoLevel
	}
	cfg.Level.SetLevel(lvl)

	return cfg.Build()
}
