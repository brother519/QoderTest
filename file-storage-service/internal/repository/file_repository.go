package repository

import (
	"context"

	"file-storage-service/internal/domain"

	"github.com/google/uuid"
)

type FileRepository interface {
	Create(ctx context.Context, file *domain.File) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.File, error)
	GetByKey(ctx context.Context, bucketID uuid.UUID, fileKey string) (*domain.File, error)
	List(ctx context.Context, bucketID uuid.UUID, path string, pg domain.Pagination) ([]*domain.File, int64, error)
	Update(ctx context.Context, file *domain.File) error
	SoftDelete(ctx context.Context, id uuid.UUID) error
	GetExpired(ctx context.Context, limit int) ([]*domain.File, error)

	// Thumbnails
	CreateThumbnail(ctx context.Context, thumb *domain.Thumbnail) error
	GetThumbnail(ctx context.Context, fileID uuid.UUID, sizeName string) (*domain.Thumbnail, error)
	ListThumbnails(ctx context.Context, fileID uuid.UUID) ([]*domain.Thumbnail, error)
}
