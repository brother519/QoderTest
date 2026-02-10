package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type uploadSessionRepo struct {
	db *sqlx.DB
}

func NewUploadSessionRepository(db *sqlx.DB) repository.UploadSessionRepository {
	return &uploadSessionRepo{db: db}
}

type sessionRow struct {
	ID             uuid.UUID `db:"id"`
	BucketID       uuid.UUID `db:"bucket_id"`
	UploadID       string    `db:"upload_id"`
	FileKey        string    `db:"file_key"`
	OriginalName   string    `db:"original_name"`
	MimeType       string    `db:"mime_type"`
	TotalSize      int64     `db:"total_size"`
	ChunkSize      int64     `db:"chunk_size"`
	TotalChunks    int       `db:"total_chunks"`
	UploadedChunks []byte    `db:"uploaded_chunks"`
	Status         string    `db:"status"`
	ExpiresAt      time.Time `db:"expires_at"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

func (row *sessionRow) toDomain() (*domain.UploadSession, error) {
	var chunks []domain.ChunkInfo
	if len(row.UploadedChunks) > 0 {
		if err := json.Unmarshal(row.UploadedChunks, &chunks); err != nil {
			return nil, err
		}
	}
	return &domain.UploadSession{
		ID:             row.ID,
		BucketID:       row.BucketID,
		UploadID:       row.UploadID,
		FileKey:        row.FileKey,
		OriginalName:   row.OriginalName,
		MimeType:       row.MimeType,
		TotalSize:      row.TotalSize,
		ChunkSize:      row.ChunkSize,
		TotalChunks:    row.TotalChunks,
		UploadedChunks: chunks,
		Status:         domain.UploadStatus(row.Status),
		ExpiresAt:      row.ExpiresAt,
		CreatedAt:      row.CreatedAt,
		UpdatedAt:      row.UpdatedAt,
	}, nil
}

func (r *uploadSessionRepo) Create(ctx context.Context, session *domain.UploadSession) error {
	chunksJSON, err := json.Marshal(session.UploadedChunks)
	if err != nil {
		return err
	}
	query := `INSERT INTO upload_sessions (id, bucket_id, upload_id, file_key, original_name, mime_type, total_size, chunk_size, total_chunks, uploaded_chunks, status, expires_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
	_, err = r.db.ExecContext(ctx, query,
		session.ID, session.BucketID, session.UploadID, session.FileKey,
		session.OriginalName, session.MimeType, session.TotalSize,
		session.ChunkSize, session.TotalChunks, chunksJSON,
		session.Status, session.ExpiresAt, session.CreatedAt, session.UpdatedAt)
	return err
}

func (r *uploadSessionRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.UploadSession, error) {
	var row sessionRow
	err := r.db.GetContext(ctx, &row, "SELECT * FROM upload_sessions WHERE id = $1", id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return row.toDomain()
}

func (r *uploadSessionRepo) Update(ctx context.Context, session *domain.UploadSession) error {
	chunksJSON, err := json.Marshal(session.UploadedChunks)
	if err != nil {
		return err
	}
	query := `UPDATE upload_sessions SET uploaded_chunks=$1, status=$2, updated_at=$3 WHERE id=$4`
	result, err := r.db.ExecContext(ctx, query,
		chunksJSON, session.Status, time.Now(), session.ID)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *uploadSessionRepo) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM upload_sessions WHERE id = $1", id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *uploadSessionRepo) GetExpired(ctx context.Context, limit int) ([]*domain.UploadSession, error) {
	var rows []sessionRow
	err := r.db.SelectContext(ctx, &rows,
		`SELECT * FROM upload_sessions WHERE status = 'in_progress' AND expires_at < NOW()
		ORDER BY expires_at LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}

	sessions := make([]*domain.UploadSession, 0, len(rows))
	for i := range rows {
		s, err := rows[i].toDomain()
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}
