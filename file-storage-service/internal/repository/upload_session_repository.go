package repository

import (
	"context"

	"file-storage-service/internal/domain"

	"github.com/google/uuid"
)

type UploadSessionRepository interface {
	Create(ctx context.Context, session *domain.UploadSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.UploadSession, error)
	Update(ctx context.Context, session *domain.UploadSession) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetExpired(ctx context.Context, limit int) ([]*domain.UploadSession, error)
}
