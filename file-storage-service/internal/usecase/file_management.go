package usecase

import (
	"context"
	"fmt"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"

	"github.com/google/uuid"
)

type FileManagementUseCase struct {
	fileRepo   repository.FileRepository
	bucketRepo repository.BucketRepository
	store      storage.ObjectStorage
}

func NewFileManagementUseCase(
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	store storage.ObjectStorage,
) *FileManagementUseCase {
	return &FileManagementUseCase{
		fileRepo:   fileRepo,
		bucketRepo: bucketRepo,
		store:      store,
	}
}

func (uc *FileManagementUseCase) GetByID(ctx context.Context, id uuid.UUID) (*domain.File, error) {
	return uc.fileRepo.GetByID(ctx, id)
}

func (uc *FileManagementUseCase) List(ctx context.Context, bucketID uuid.UUID, path string, pg domain.Pagination) ([]*domain.File, int64, error) {
	if pg.Page < 1 {
		pg.Page = 1
	}
	if pg.PageSize < 1 || pg.PageSize > 100 {
		pg.PageSize = 20
	}
	if path == "" {
		path = "/"
	}
	return uc.fileRepo.List(ctx, bucketID, path, pg)
}

type UpdateFileInput struct {
	OriginalName *string                `json:"original_name"`
	FilePath     *string                `json:"file_path"`
	AccessType   *string                `json:"access_type"`
	Metadata     map[string]interface{} `json:"metadata"`
}

func (uc *FileManagementUseCase) Update(ctx context.Context, id uuid.UUID, input UpdateFileInput) (*domain.File, error) {
	file, err := uc.fileRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.OriginalName != nil {
		file.OriginalName = *input.OriginalName
	}
	if input.FilePath != nil {
		file.FilePath = *input.FilePath
	}
	if input.AccessType != nil {
		file.AccessType = domain.AccessType(*input.AccessType)
	}
	if input.Metadata != nil {
		file.Metadata = input.Metadata
	}

	if err := uc.fileRepo.Update(ctx, file); err != nil {
		return nil, err
	}
	return file, nil
}

func (uc *FileManagementUseCase) Delete(ctx context.Context, id uuid.UUID) error {
	file, err := uc.fileRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, file.BucketID)
	if err != nil {
		return err
	}

	// Delete from object storage
	if err := uc.store.DeleteObject(ctx, bucket.Name, file.FileKey); err != nil {
		return fmt.Errorf("delete object: %w", err)
	}

	// Soft delete metadata
	return uc.fileRepo.SoftDelete(ctx, id)
}
