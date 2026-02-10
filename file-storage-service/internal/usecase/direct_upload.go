package usecase

import (
	"context"
	"fmt"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"

	"github.com/google/uuid"
)

type DirectUploadUseCase struct {
	fileRepo   repository.FileRepository
	bucketRepo repository.BucketRepository
	statsRepo  repository.StatisticsRepository
	store      storage.ObjectStorage
}

func NewDirectUploadUseCase(
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	statsRepo repository.StatisticsRepository,
	store storage.ObjectStorage,
) *DirectUploadUseCase {
	return &DirectUploadUseCase{
		fileRepo:   fileRepo,
		bucketRepo: bucketRepo,
		statsRepo:  statsRepo,
		store:      store,
	}
}

type DirectUploadInput struct {
	BucketID uuid.UUID
	FileName string
	FileSize int64
	MimeType string
	FilePath string
}

type DirectUploadOutput struct {
	UploadURL string `json:"upload_url"`
	FileKey   string `json:"file_key"`
	ExpiresIn int    `json:"expires_in"`
}

func (uc *DirectUploadUseCase) GenerateUploadURL(ctx context.Context, input DirectUploadInput) (*DirectUploadOutput, error) {
	bucket, err := uc.bucketRepo.GetByID(ctx, input.BucketID)
	if err != nil {
		return nil, err
	}

	if input.FileSize > bucket.MaxFileSize {
		return nil, domain.ErrFileTooLarge
	}

	ext := ""
	for i := len(input.FileName) - 1; i >= 0; i-- {
		if input.FileName[i] == '.' {
			ext = input.FileName[i:]
			break
		}
	}
	fileKey := generateFileKey(input.FilePath, ext)

	expiry := 30 * time.Minute
	url, err := uc.store.GeneratePresignedUploadURL(ctx, bucket.Name, fileKey, expiry)
	if err != nil {
		return nil, fmt.Errorf("generate presigned url: %w", err)
	}

	return &DirectUploadOutput{
		UploadURL: url,
		FileKey:   fileKey,
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

type CompleteDirectUploadInput struct {
	BucketID uuid.UUID
	FileKey  string
	FileName string
	MimeType string
	FilePath string
}

func (uc *DirectUploadUseCase) CompleteDirectUpload(ctx context.Context, input CompleteDirectUploadInput) (*domain.File, error) {
	bucket, err := uc.bucketRepo.GetByID(ctx, input.BucketID)
	if err != nil {
		return nil, err
	}

	// Verify file exists in storage
	info, err := uc.store.HeadObject(ctx, bucket.Name, input.FileKey)
	if err != nil {
		return nil, fmt.Errorf("file not found in storage: %w", err)
	}

	filePath := input.FilePath
	if filePath == "" {
		filePath = "/"
	}

	mimeType := input.MimeType
	if mimeType == "" {
		mimeType = info.ContentType
	}

	file := &domain.File{
		ID:           uuid.New(),
		BucketID:     bucket.ID,
		FileKey:      input.FileKey,
		OriginalName: input.FileName,
		FilePath:     filePath,
		MimeType:     mimeType,
		FileSize:     info.Size,
		AccessType:   bucket.AccessType,
		Metadata:     domain.MapJSON{},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := uc.fileRepo.Create(ctx, file); err != nil {
		return nil, fmt.Errorf("create file record: %w", err)
	}

	_ = uc.statsRepo.RecordUpload(ctx, bucket.ID, info.Size)

	return file, nil
}
