package worker

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"file-storage-service/internal/config"
	"file-storage-service/internal/infrastructure/redis"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"
	"file-storage-service/internal/domain"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

type ThumbnailWorker struct {
	fileRepo repository.FileRepository
	store    storage.ObjectStorage
	bucketRepo repository.BucketRepository
	sizes    map[string]config.ThumbnailSize
	quality  int
	log      *zap.Logger
}

func NewThumbnailWorker(
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	store storage.ObjectStorage,
	sizes map[string]config.ThumbnailSize,
	quality int,
	log *zap.Logger,
) *ThumbnailWorker {
	return &ThumbnailWorker{
		fileRepo:   fileRepo,
		bucketRepo: bucketRepo,
		store:      store,
		sizes:      sizes,
		quality:    quality,
		log:        log,
	}
}

func (w *ThumbnailWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload redis.ThumbnailPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	w.log.Info("processing thumbnail generation", zap.String("file_id", payload.FileID))

	fileID, err := uuid.Parse(payload.FileID)
	if err != nil {
		return fmt.Errorf("parse file id: %w", err)
	}

	file, err := w.fileRepo.GetByID(ctx, fileID)
	if err != nil {
		return fmt.Errorf("get file: %w", err)
	}

	bucket, err := w.bucketRepo.GetByID(ctx, file.BucketID)
	if err != nil {
		return fmt.Errorf("get bucket: %w", err)
	}

	// Download original image
	reader, err := w.store.GetObject(ctx, bucket.Name, file.FileKey)
	if err != nil {
		return fmt.Errorf("get object: %w", err)
	}
	defer reader.Close()

	imgData, err := io.ReadAll(reader)
	if err != nil {
		return fmt.Errorf("read image data: %w", err)
	}

	src, err := imaging.Decode(bytes.NewReader(imgData))
	if err != nil {
		return fmt.Errorf("decode image: %w", err)
	}

	sizesToProcess := payload.Sizes
	if len(sizesToProcess) == 0 {
		sizesToProcess = make([]string, 0, len(w.sizes))
		for name := range w.sizes {
			sizesToProcess = append(sizesToProcess, name)
		}
	}

	for _, sizeName := range sizesToProcess {
		sizeConf, ok := w.sizes[sizeName]
		if !ok {
			w.log.Warn("unknown thumbnail size", zap.String("size", sizeName))
			continue
		}

		thumb := imaging.Fit(src, sizeConf.Width, sizeConf.Height, imaging.Lanczos)

		var buf bytes.Buffer
		if err := imaging.Encode(&buf, thumb, imaging.JPEG, imaging.JPEGQuality(w.quality)); err != nil {
			w.log.Error("encode thumbnail", zap.Error(err), zap.String("size", sizeName))
			continue
		}

		thumbKey := generateThumbnailKey(file.FileKey, sizeName)

		if err := w.store.PutObject(ctx, bucket.Name, thumbKey, &buf, int64(buf.Len()), "image/jpeg"); err != nil {
			w.log.Error("upload thumbnail", zap.Error(err), zap.String("size", sizeName))
			continue
		}

		bounds := thumb.Bounds()
		thumbRecord := &domain.Thumbnail{
			ID:        uuid.New(),
			FileID:    file.ID,
			SizeName:  sizeName,
			Width:     bounds.Dx(),
			Height:    bounds.Dy(),
			FileKey:   thumbKey,
			FileSize:  int64(buf.Len()),
			CreatedAt: time.Now(),
		}

		if err := w.fileRepo.CreateThumbnail(ctx, thumbRecord); err != nil {
			w.log.Error("save thumbnail record", zap.Error(err), zap.String("size", sizeName))
			continue
		}

		w.log.Info("thumbnail generated",
			zap.String("file_id", payload.FileID),
			zap.String("size", sizeName),
			zap.Int("width", bounds.Dx()),
			zap.Int("height", bounds.Dy()),
		)
	}

	return nil
}

func generateThumbnailKey(originalKey, sizeName string) string {
	// Insert "_thumb_sizeName" before extension
	lastDot := strings.LastIndex(originalKey, ".")
	if lastDot == -1 {
		return originalKey + "_thumb_" + sizeName + ".jpg"
	}
	return originalKey[:lastDot] + "_thumb_" + sizeName + ".jpg"
}
