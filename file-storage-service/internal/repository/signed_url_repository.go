package repository

import (
	"context"

	"file-storage-service/internal/domain"

	"github.com/google/uuid"
)

type SignedURLRepository interface {
	Create(ctx context.Context, signedURL *domain.SignedURL) error
	GetByToken(ctx context.Context, token string) (*domain.SignedURL, error)
	IncrementDownloadCount(ctx context.Context, id uuid.UUID) error
	DeleteExpired(ctx context.Context) (int64, error)
}
