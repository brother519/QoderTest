package postgres

import (
	"context"
	"database/sql"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type signedURLRepo struct {
	db *sqlx.DB
}

func NewSignedURLRepository(db *sqlx.DB) repository.SignedURLRepository {
	return &signedURLRepo{db: db}
}

func (r *signedURLRepo) Create(ctx context.Context, signedURL *domain.SignedURL) error {
	query := `INSERT INTO signed_urls (id, file_id, url_token, expires_at, max_downloads, download_count, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query,
		signedURL.ID, signedURL.FileID, signedURL.URLToken,
		signedURL.ExpiresAt, signedURL.MaxDownloads, signedURL.DownloadCount,
		signedURL.CreatedAt)
	return err
}

func (r *signedURLRepo) GetByToken(ctx context.Context, token string) (*domain.SignedURL, error) {
	var s domain.SignedURL
	err := r.db.GetContext(ctx, &s,
		"SELECT * FROM signed_urls WHERE url_token = $1 AND expires_at > $2",
		token, time.Now())
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *signedURLRepo) IncrementDownloadCount(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE signed_urls SET download_count = download_count + 1 WHERE id = $1", id)
	return err
}

func (r *signedURLRepo) DeleteExpired(ctx context.Context) (int64, error) {
	result, err := r.db.ExecContext(ctx,
		"DELETE FROM signed_urls WHERE expires_at < $1", time.Now())
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}
