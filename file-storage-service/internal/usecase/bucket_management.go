package usecase

import (
	"context"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
)

type BucketUseCase struct {
	bucketRepo repository.BucketRepository
}

func NewBucketUseCase(bucketRepo repository.BucketRepository) *BucketUseCase {
	return &BucketUseCase{bucketRepo: bucketRepo}
}

type CreateBucketInput struct {
	Name             string   `json:"name"`
	Description      string   `json:"description"`
	AccessType       string   `json:"access_type"`
	AllowedFileTypes []string `json:"allowed_file_types"`
	MaxFileSize      int64    `json:"max_file_size"`
	CDNPrefix        string   `json:"cdn_prefix"`
}

func (uc *BucketUseCase) Create(ctx context.Context, input CreateBucketInput) (*domain.Bucket, error) {
	accessType := domain.AccessPrivate
	if input.AccessType == string(domain.AccessPublic) {
		accessType = domain.AccessPublic
	}
	if input.MaxFileSize == 0 {
		input.MaxFileSize = 5 * 1024 * 1024 * 1024 // 5GB default
	}

	bucket := &domain.Bucket{
		ID:               uuid.New(),
		Name:             input.Name,
		Description:      input.Description,
		AccessType:       accessType,
		AllowedFileTypes: input.AllowedFileTypes,
		MaxFileSize:      input.MaxFileSize,
		CDNPrefix:        input.CDNPrefix,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := uc.bucketRepo.Create(ctx, bucket); err != nil {
		return nil, err
	}
	return bucket, nil
}

func (uc *BucketUseCase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Bucket, error) {
	return uc.bucketRepo.GetByID(ctx, id)
}

func (uc *BucketUseCase) List(ctx context.Context, pg domain.Pagination) ([]*domain.Bucket, int64, error) {
	if pg.Page < 1 {
		pg.Page = 1
	}
	if pg.PageSize < 1 || pg.PageSize > 100 {
		pg.PageSize = 20
	}
	return uc.bucketRepo.List(ctx, pg)
}

type UpdateBucketInput struct {
	Description      *string  `json:"description"`
	AccessType       *string  `json:"access_type"`
	AllowedFileTypes []string `json:"allowed_file_types"`
	MaxFileSize      *int64   `json:"max_file_size"`
	CDNPrefix        *string  `json:"cdn_prefix"`
}

func (uc *BucketUseCase) Update(ctx context.Context, id uuid.UUID, input UpdateBucketInput) (*domain.Bucket, error) {
	bucket, err := uc.bucketRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Description != nil {
		bucket.Description = *input.Description
	}
	if input.AccessType != nil {
		bucket.AccessType = domain.AccessType(*input.AccessType)
	}
	if input.AllowedFileTypes != nil {
		bucket.AllowedFileTypes = input.AllowedFileTypes
	}
	if input.MaxFileSize != nil {
		bucket.MaxFileSize = *input.MaxFileSize
	}
	if input.CDNPrefix != nil {
		bucket.CDNPrefix = *input.CDNPrefix
	}

	if err := uc.bucketRepo.Update(ctx, bucket); err != nil {
		return nil, err
	}
	return bucket, nil
}

func (uc *BucketUseCase) Delete(ctx context.Context, id uuid.UUID) error {
	hasFiles, err := uc.bucketRepo.HasFiles(ctx, id)
	if err != nil {
		return err
	}
	if hasFiles {
		return domain.ErrBucketNotEmpty
	}
	return uc.bucketRepo.Delete(ctx, id)
}
