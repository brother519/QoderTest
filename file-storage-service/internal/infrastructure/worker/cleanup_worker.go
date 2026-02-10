package worker

import (
	"context"
	"encoding/json"
	"fmt"

	"file-storage-service/internal/infrastructure/redis"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

type CleanupWorker struct {
	fileRepo    repository.FileRepository
	sessionRepo repository.UploadSessionRepository
	bucketRepo  repository.BucketRepository
	store       storage.ObjectStorage
	batchSize   int
	log         *zap.Logger
}

func NewCleanupWorker(
	fileRepo repository.FileRepository,
	sessionRepo repository.UploadSessionRepository,
	bucketRepo repository.BucketRepository,
	store storage.ObjectStorage,
	batchSize int,
	log *zap.Logger,
) *CleanupWorker {
	return &CleanupWorker{
		fileRepo:    fileRepo,
		sessionRepo: sessionRepo,
		bucketRepo:  bucketRepo,
		store:       store,
		batchSize:   batchSize,
		log:         log,
	}
}

func (w *CleanupWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload redis.FileCleanupPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	w.log.Info("processing file cleanup", zap.String("file_id", payload.FileID))

	fileID, err := uuid.Parse(payload.FileID)
	if err != nil {
		return fmt.Errorf("parse file id: %w", err)
	}

	file, err := w.fileRepo.GetByID(ctx, fileID)
	if err != nil {
		w.log.Warn("file not found for cleanup", zap.String("file_id", payload.FileID))
		return nil // Don't retry if file already deleted
	}

	bucket, err := w.bucketRepo.GetByID(ctx, file.BucketID)
	if err != nil {
		return fmt.Errorf("get bucket: %w", err)
	}

	// Delete thumbnails
	thumbs, _ := w.fileRepo.ListThumbnails(ctx, file.ID)
	for _, thumb := range thumbs {
		_ = w.store.DeleteObject(ctx, bucket.Name, thumb.FileKey)
	}

	// Delete main file
	if err := w.store.DeleteObject(ctx, bucket.Name, file.FileKey); err != nil {
		w.log.Error("delete object from storage", zap.Error(err))
	}

	// Soft delete metadata
	if err := w.fileRepo.SoftDelete(ctx, file.ID); err != nil {
		w.log.Error("soft delete file", zap.Error(err))
	}

	w.log.Info("file cleaned up", zap.String("file_id", payload.FileID))
	return nil
}

// CleanExpiredFiles finds and removes expired files. Called by a scheduled task.
func (w *CleanupWorker) CleanExpiredFiles(ctx context.Context) error {
	files, err := w.fileRepo.GetExpired(ctx, w.batchSize)
	if err != nil {
		return fmt.Errorf("get expired files: %w", err)
	}

	w.log.Info("cleaning expired files", zap.Int("count", len(files)))

	for _, file := range files {
		bucket, err := w.bucketRepo.GetByID(ctx, file.BucketID)
		if err != nil {
			w.log.Error("get bucket for cleanup", zap.Error(err))
			continue
		}

		// Delete thumbnails
		thumbs, _ := w.fileRepo.ListThumbnails(ctx, file.ID)
		for _, thumb := range thumbs {
			_ = w.store.DeleteObject(ctx, bucket.Name, thumb.FileKey)
		}

		if err := w.store.DeleteObject(ctx, bucket.Name, file.FileKey); err != nil {
			w.log.Error("delete expired object", zap.Error(err))
			continue
		}

		if err := w.fileRepo.SoftDelete(ctx, file.ID); err != nil {
			w.log.Error("soft delete expired file", zap.Error(err))
		}
	}

	// Clean expired upload sessions
	sessions, err := w.sessionRepo.GetExpired(ctx, w.batchSize)
	if err != nil {
		w.log.Error("get expired sessions", zap.Error(err))
	} else {
		for _, session := range sessions {
			bucket, err := w.bucketRepo.GetByID(ctx, session.BucketID)
			if err != nil {
				continue
			}
			_ = w.store.AbortMultipartUpload(ctx, bucket.Name, session.FileKey, session.UploadID)
			_ = w.sessionRepo.Delete(ctx, session.ID)
		}
		if len(sessions) > 0 {
			w.log.Info("cleaned expired upload sessions", zap.Int("count", len(sessions)))
		}
	}

	return nil
}
