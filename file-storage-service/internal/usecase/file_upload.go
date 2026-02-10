package usecase

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/queue"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"
	"file-storage-service/internal/validator"

	"github.com/google/uuid"
)

type FileUploadUseCase struct {
	fileRepo   repository.FileRepository
	bucketRepo repository.BucketRepository
	statsRepo  repository.StatisticsRepository
	storage    storage.ObjectStorage
	queue      queue.TaskQueue
	validator  *validator.FileValidator
	thumbSizes []string
}

func NewFileUploadUseCase(
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	statsRepo repository.StatisticsRepository,
	store storage.ObjectStorage,
	q queue.TaskQueue,
	v *validator.FileValidator,
	thumbSizes []string,
) *FileUploadUseCase {
	return &FileUploadUseCase{
		fileRepo:   fileRepo,
		bucketRepo: bucketRepo,
		statsRepo:  statsRepo,
		storage:    store,
		queue:      q,
		validator:  v,
		thumbSizes: thumbSizes,
	}
}

type UploadFileInput struct {
	BucketID     uuid.UUID
	FileName     string
	FilePath     string
	FileSize     int64
	Reader       io.ReadSeeker
	AccessType   string
	Metadata     map[string]interface{}
	TTLExpiresAt *time.Time
	UploadedBy   string
}

func (uc *FileUploadUseCase) Upload(ctx context.Context, input UploadFileInput) (*domain.File, error) {
	bucket, err := uc.bucketRepo.GetByID(ctx, input.BucketID)
	if err != nil {
		return nil, err
	}

	if input.FileSize > bucket.MaxFileSize {
		return nil, domain.ErrFileTooLarge
	}

	// Detect MIME type from content
	mimeType, err := uc.validator.DetectMimeType(input.Reader)
	if err != nil {
		return nil, fmt.Errorf("detect mime type: %w", err)
	}
	// Seek back to beginning after reading header
	if _, err := input.Reader.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("seek reader: %w", err)
	}

	if !uc.validator.IsAllowed(mimeType, bucket.AllowedFileTypes) {
		return nil, domain.ErrInvalidFileType
	}

	// Generate unique file key
	ext := filepath.Ext(input.FileName)
	fileKey := generateFileKey(input.FilePath, ext)

	// Compute checksum while uploading
	hasher := sha256.New()
	tee := io.TeeReader(input.Reader, hasher)

	// Upload to object storage
	storageBucket := bucket.Name
	if err := uc.storage.PutObject(ctx, storageBucket, fileKey, tee, input.FileSize, mimeType); err != nil {
		return nil, fmt.Errorf("put object: %w", err)
	}

	checksum := hex.EncodeToString(hasher.Sum(nil))

	accessType := domain.AccessType(input.AccessType)
	if accessType == "" {
		accessType = bucket.AccessType
	}

	filePath := input.FilePath
	if filePath == "" {
		filePath = "/"
	}

	file := &domain.File{
		ID:           uuid.New(),
		BucketID:     bucket.ID,
		FileKey:      fileKey,
		OriginalName: input.FileName,
		FilePath:     filePath,
		MimeType:     mimeType,
		FileSize:     input.FileSize,
		Checksum:     checksum,
		AccessType:   accessType,
		Metadata:     input.Metadata,
		TTLExpiresAt: input.TTLExpiresAt,
		UploadedBy:   input.UploadedBy,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := uc.fileRepo.Create(ctx, file); err != nil {
		return nil, fmt.Errorf("create file record: %w", err)
	}

	// Record upload statistics
	_ = uc.statsRepo.RecordUpload(ctx, bucket.ID, input.FileSize)

	// Enqueue thumbnail generation for images
	if uc.validator.IsImage(mimeType) && len(uc.thumbSizes) > 0 {
		_ = uc.queue.EnqueueThumbnailGeneration(ctx, file.ID.String(), uc.thumbSizes)
	}

	return file, nil
}

func generateFileKey(path, ext string) string {
	id := uuid.New().String()
	path = strings.TrimPrefix(path, "/")
	if path == "" {
		return id + ext
	}
	return path + "/" + id + ext
}
