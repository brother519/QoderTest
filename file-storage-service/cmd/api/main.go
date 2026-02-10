package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"file-storage-service/internal/config"
	handler "file-storage-service/internal/handler/http"
	"file-storage-service/internal/handler/middleware"
	"file-storage-service/internal/infrastructure/postgres"
	redisqueue "file-storage-service/internal/infrastructure/redis"
	s3storage "file-storage-service/internal/infrastructure/s3"
	"file-storage-service/internal/usecase"
	"file-storage-service/internal/validator"
	"file-storage-service/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	goredis "github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

func main() {
	configPath := flag.String("config", "configs/config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load config: %v\n", err)
		os.Exit(1)
	}

	log, err := logger.New(cfg.Logging.Level, cfg.Logging.Format)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to init logger: %v\n", err)
		os.Exit(1)
	}
	defer log.Sync()

	// Database
	db, err := sqlx.Connect("postgres", cfg.Database.DSN())
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer db.Close()
	db.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	db.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)

	// Redis
	rdb := goredis.NewClient(&goredis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
		PoolSize: cfg.Redis.PoolSize,
	})
	defer rdb.Close()

	// Object storage
	store, err := s3storage.NewS3Storage(
		cfg.Storage.Endpoint, cfg.Storage.AccessKey, cfg.Storage.SecretKey,
		cfg.Storage.Region, cfg.Storage.UseSSL,
	)
	if err != nil {
		log.Fatal("failed to init storage", zap.Error(err))
	}

	// Ensure default bucket exists
	if err := store.EnsureBucket(context.Background(), cfg.Storage.DefaultBucket); err != nil {
		log.Warn("failed to ensure default bucket", zap.Error(err))
	}

	// Task queue
	taskQueue := redisqueue.NewTaskQueue(cfg.Redis.Addr, cfg.Redis.Password)
	defer taskQueue.Close()

	// Repositories
	bucketRepo := postgres.NewBucketRepository(db)
	fileRepo := postgres.NewFileRepository(db)
	sessionRepo := postgres.NewUploadSessionRepository(db)
	statsRepo := postgres.NewStatisticsRepository(db)
	signedURLRepo := postgres.NewSignedURLRepository(db)

	// Validator
	fileValidator := validator.NewFileValidator()

	// Thumbnail sizes
	thumbSizes := make([]string, 0, len(cfg.Thumbnail.Sizes))
	for name := range cfg.Thumbnail.Sizes {
		thumbSizes = append(thumbSizes, name)
	}

	// Use cases
	bucketUC := usecase.NewBucketUseCase(bucketRepo)
	fileUploadUC := usecase.NewFileUploadUseCase(fileRepo, bucketRepo, statsRepo, store, taskQueue, fileValidator, thumbSizes)
	fileDownloadUC := usecase.NewFileDownloadUseCase(fileRepo, bucketRepo, statsRepo, store, cfg.CDN.BaseURL)
	fileManagementUC := usecase.NewFileManagementUseCase(fileRepo, bucketRepo, store)
	chunkedUploadUC := usecase.NewChunkedUploadUseCase(
		sessionRepo, fileRepo, bucketRepo, statsRepo,
		store, taskQueue, fileValidator, thumbSizes,
		cfg.Upload.ChunkSize, cfg.Upload.SessionExpiry,
	)
	directUploadUC := usecase.NewDirectUploadUseCase(fileRepo, bucketRepo, statsRepo, store)
	signedURLUC := usecase.NewSignedURLUseCase(signedURLRepo, fileRepo)
	statisticsUC := usecase.NewStatisticsUseCase(statsRepo)

	// Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(log),
		BodyLimit:    int(cfg.Upload.MaxFileSize),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	app.Use(recover.New())
	app.Use(cors.New())
	app.Use(middleware.LoggerMiddleware(log))

	// Health endpoints
	healthHandler := handler.NewHealthHandler(db, rdb, store)
	healthHandler.Register(app)

	// API routes
	api := app.Group("/api/v1")

	bucketHandler := handler.NewBucketHandler(bucketUC)
	bucketHandler.Register(api)

	fileHandler := handler.NewFileHandler(fileUploadUC, fileDownloadUC, fileManagementUC)
	fileHandler.Register(api)

	uploadHandler := handler.NewUploadHandler(chunkedUploadUC, directUploadUC)
	uploadHandler.Register(api)

	signedURLHandler := handler.NewSignedURLHandler(signedURLUC, fileDownloadUC)
	signedURLHandler.Register(api)

	statsHandler := handler.NewStatisticsHandler(statisticsUC)
	statsHandler.Register(api)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%d", cfg.Server.Port)
		log.Info("starting API server", zap.String("addr", addr))
		if err := app.Listen(addr); err != nil {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	<-quit
	log.Info("shutting down server...")

	if err := app.ShutdownWithTimeout(cfg.Server.ShutdownTimeout); err != nil {
		log.Error("server shutdown error", zap.Error(err))
	}

	log.Info("server stopped")
}
