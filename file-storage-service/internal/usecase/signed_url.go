package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
)

type SignedURLUseCase struct {
	signedURLRepo repository.SignedURLRepository
	fileRepo      repository.FileRepository
}

func NewSignedURLUseCase(
	signedURLRepo repository.SignedURLRepository,
	fileRepo repository.FileRepository,
) *SignedURLUseCase {
	return &SignedURLUseCase{
		signedURLRepo: signedURLRepo,
		fileRepo:      fileRepo,
	}
}

type CreateSignedURLInput struct {
	FileID       uuid.UUID
	ExpiresIn    time.Duration
	MaxDownloads *int
}

type CreateSignedURLOutput struct {
	Token     string    `json:"token"`
	URL       string    `json:"url"`
	ExpiresAt time.Time `json:"expires_at"`
}

func (uc *SignedURLUseCase) Create(ctx context.Context, input CreateSignedURLInput, baseURL string) (*CreateSignedURLOutput, error) {
	// Verify file exists
	_, err := uc.fileRepo.GetByID(ctx, input.FileID)
	if err != nil {
		return nil, err
	}

	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	if input.ExpiresIn == 0 {
		input.ExpiresIn = 24 * time.Hour
	}

	signedURL := &domain.SignedURL{
		ID:            uuid.New(),
		FileID:        input.FileID,
		URLToken:      token,
		ExpiresAt:     time.Now().Add(input.ExpiresIn),
		MaxDownloads:  input.MaxDownloads,
		DownloadCount: 0,
		CreatedAt:     time.Now(),
	}

	if err := uc.signedURLRepo.Create(ctx, signedURL); err != nil {
		return nil, err
	}

	return &CreateSignedURLOutput{
		Token:     token,
		URL:       baseURL + "/api/v1/public/" + token,
		ExpiresAt: signedURL.ExpiresAt,
	}, nil
}

func (uc *SignedURLUseCase) ValidateToken(ctx context.Context, token string) (*domain.File, error) {
	signedURL, err := uc.signedURLRepo.GetByToken(ctx, token)
	if err != nil {
		return nil, domain.ErrSignedURLExpired
	}

	if time.Now().After(signedURL.ExpiresAt) {
		return nil, domain.ErrSignedURLExpired
	}

	if signedURL.MaxDownloads != nil && signedURL.DownloadCount >= *signedURL.MaxDownloads {
		return nil, domain.ErrDownloadLimitReached
	}

	_ = uc.signedURLRepo.IncrementDownloadCount(ctx, signedURL.ID)

	return uc.fileRepo.GetByID(ctx, signedURL.FileID)
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
