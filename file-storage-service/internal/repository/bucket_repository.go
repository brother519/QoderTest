package repository

import (
	"context"

	"file-storage-service/internal/domain"

	"github.com/google/uuid"
)

type BucketRepository interface {
	Create(ctx context.Context, bucket *domain.Bucket) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Bucket, error)
	GetByName(ctx context.Context, name string) (*domain.Bucket, error)
	List(ctx context.Context, pg domain.Pagination) ([]*domain.Bucket, int64, error)
	Update(ctx context.Context, bucket *domain.Bucket) error
	Delete(ctx context.Context, id uuid.UUID) error
	HasFiles(ctx context.Context, id uuid.UUID) (bool, error)
}
