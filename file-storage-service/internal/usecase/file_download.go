package usecase

import (
	"context"
	"fmt"
	"io"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"

	"github.com/google/uuid"
)

type FileDownloadUseCase struct {
	fileRepo   repository.FileRepository
	bucketRepo repository.BucketRepository
	statsRepo  repository.StatisticsRepository
	storage    storage.ObjectStorage
	cdnBaseURL string
}

func NewFileDownloadUseCase(
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	statsRepo repository.StatisticsRepository,
	store storage.ObjectStorage,
	cdnBaseURL string,
) *FileDownloadUseCase {
	return &FileDownloadUseCase{
		fileRepo:   fileRepo,
		bucketRepo: bucketRepo,
		statsRepo:  statsRepo,
		storage:    store,
		cdnBaseURL: cdnBaseURL,
	}
}

type DownloadResult struct {
	Reader      io.ReadCloser
	MimeType    string
	FileSize    int64
	FileName    string
	RedirectURL string // If set, redirect to this URL instead of streaming
}

func (uc *FileDownloadUseCase) Download(ctx context.Context, fileID uuid.UUID) (*DownloadResult, error) {
	file, err := uc.fileRepo.GetByID(ctx, fileID)
	if err != nil {
		return nil, err
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, file.BucketID)
	if err != nil {
		return nil, err
	}

	// If CDN is configured and file is public, redirect to CDN
	if bucket.CDNPrefix != "" && file.AccessType == domain.AccessPublic {
		cdnURL := bucket.CDNPrefix + "/" + file.FileKey
		_ = uc.statsRepo.RecordDownload(ctx, bucket.ID, file.FileSize)
		return &DownloadResult{
			RedirectURL: cdnURL,
			MimeType:    file.MimeType,
			FileSize:    file.FileSize,
			FileName:    file.OriginalName,
		}, nil
	}

	// Generate pre-signed download URL
	url, err := uc.storage.GeneratePresignedDownloadURL(ctx, bucket.Name, file.FileKey, 15*time.Minute)
	if err != nil {
		return nil, fmt.Errorf("generate presigned url: %w", err)
	}

	_ = uc.statsRepo.RecordDownload(ctx, bucket.ID, file.FileSize)

	return &DownloadResult{
		RedirectURL: url,
		MimeType:    file.MimeType,
		FileSize:    file.FileSize,
		FileName:    file.OriginalName,
	}, nil
}

func (uc *FileDownloadUseCase) GetThumbnail(ctx context.Context, fileID uuid.UUID, sizeName string) (*DownloadResult, error) {
	file, err := uc.fileRepo.GetByID(ctx, fileID)
	if err != nil {
		return nil, err
	}

	thumb, err := uc.fileRepo.GetThumbnail(ctx, fileID, sizeName)
	if err != nil {
		return nil, err
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, file.BucketID)
	if err != nil {
		return nil, err
	}

	url, err := uc.storage.GeneratePresignedDownloadURL(ctx, bucket.Name, thumb.FileKey, 15*time.Minute)
	if err != nil {
		return nil, fmt.Errorf("generate presigned url: %w", err)
	}

	return &DownloadResult{
		RedirectURL: url,
		MimeType:    file.MimeType,
		FileSize:    thumb.FileSize,
		FileName:    fmt.Sprintf("%s_%s%s", file.OriginalName, sizeName, ".jpg"),
	}, nil
}
