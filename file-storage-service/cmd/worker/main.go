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
	"file-storage-service/internal/infrastructure/postgres"
	redisinfra "file-storage-service/internal/infrastructure/redis"
	s3storage "file-storage-service/internal/infrastructure/s3"
	"file-storage-service/internal/infrastructure/worker"
	"file-storage-service/pkg/logger"

	"github.com/hibiken/asynq"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
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

	// Object storage
	store, err := s3storage.NewS3Storage(
		cfg.Storage.Endpoint, cfg.Storage.AccessKey, cfg.Storage.SecretKey,
		cfg.Storage.Region, cfg.Storage.UseSSL,
	)
	if err != nil {
		log.Fatal("failed to init storage", zap.Error(err))
	}

	// Repositories
	fileRepo := postgres.NewFileRepository(db)
	bucketRepo := postgres.NewBucketRepository(db)
	sessionRepo := postgres.NewUploadSessionRepository(db)

	// Workers
	thumbnailWorker := worker.NewThumbnailWorker(
		fileRepo, bucketRepo, store,
		cfg.Thumbnail.Sizes, cfg.Thumbnail.Quality, log,
	)
	cleanupWorker := worker.NewCleanupWorker(
		fileRepo, sessionRepo, bucketRepo, store,
		cfg.Cleanup.BatchSize, log,
	)

	// Asynq server
	srv := asynq.NewServer(
		asynq.RedisClientOpt{
			Addr:     cfg.Redis.Addr,
			Password: cfg.Redis.Password,
		},
		asynq.Config{
			Concurrency: cfg.Worker.Concurrency,
			Queues: map[string]int{
				"default": 10,
			},
		},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc(redisinfra.TypeThumbnailGeneration, thumbnailWorker.ProcessTask)
	mux.HandleFunc(redisinfra.TypeFileCleanup, cleanupWorker.ProcessTask)

	// Scheduled cleanup task
	scheduler := asynq.NewScheduler(
		asynq.RedisClientOpt{
			Addr:     cfg.Redis.Addr,
			Password: cfg.Redis.Password,
		},
		nil,
	)

	// Schedule cleanup every hour
	cleanupTask := asynq.NewTask(redisinfra.TypeFileCleanup, []byte(`{"file_id":"scheduled-cleanup"}`))
	if _, err := scheduler.Register("@every "+cfg.Cleanup.Interval.String(), cleanupTask); err != nil {
		log.Error("failed to register cleanup schedule", zap.Error(err))
	}

	// Graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Info("starting worker server", zap.Int("concurrency", cfg.Worker.Concurrency))
		if err := srv.Start(mux); err != nil {
			log.Fatal("worker server error", zap.Error(err))
		}
	}()

	go func() {
		log.Info("starting scheduler")
		if err := scheduler.Start(); err != nil {
			log.Fatal("scheduler error", zap.Error(err))
		}
	}()

	// Periodic cleanup in-process as backup
	go func() {
		ticker := time.NewTicker(cfg.Cleanup.Interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := cleanupWorker.CleanExpiredFiles(context.Background()); err != nil {
					log.Error("periodic cleanup error", zap.Error(err))
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	<-quit
	log.Info("shutting down worker...")
	cancel()
	srv.Shutdown()
	scheduler.Shutdown()
	log.Info("worker stopped")
}
