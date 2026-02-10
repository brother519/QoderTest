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

type fileRepo struct {
	db *sqlx.DB
}

func NewFileRepository(db *sqlx.DB) repository.FileRepository {
	return &fileRepo{db: db}
}

type fileRow struct {
	ID           uuid.UUID  `db:"id"`
	BucketID     uuid.UUID  `db:"bucket_id"`
	FileKey      string     `db:"file_key"`
	OriginalName string     `db:"original_name"`
	FilePath     string     `db:"file_path"`
	MimeType     string     `db:"mime_type"`
	FileSize     int64      `db:"file_size"`
	Checksum     string     `db:"checksum"`
	AccessType   string     `db:"access_type"`
	Metadata     []byte     `db:"metadata"`
	TTLExpiresAt *time.Time `db:"ttl_expires_at"`
	UploadedBy   string     `db:"uploaded_by"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at"`
	DeletedAt    *time.Time `db:"deleted_at"`
}

func (row *fileRow) toDomain() (*domain.File, error) {
	var meta domain.MapJSON
	if len(row.Metadata) > 0 {
		if err := json.Unmarshal(row.Metadata, &meta); err != nil {
			return nil, err
		}
	}
	return &domain.File{
		ID:           row.ID,
		BucketID:     row.BucketID,
		FileKey:      row.FileKey,
		OriginalName: row.OriginalName,
		FilePath:     row.FilePath,
		MimeType:     row.MimeType,
		FileSize:     row.FileSize,
		Checksum:     row.Checksum,
		AccessType:   domain.AccessType(row.AccessType),
		Metadata:     meta,
		TTLExpiresAt: row.TTLExpiresAt,
		UploadedBy:   row.UploadedBy,
		CreatedAt:    row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
		DeletedAt:    row.DeletedAt,
	}, nil
}

func (r *fileRepo) Create(ctx context.Context, file *domain.File) error {
	metaJSON, err := json.Marshal(file.Metadata)
	if err != nil {
		return err
	}
	query := `INSERT INTO files (id, bucket_id, file_key, original_name, file_path, mime_type, file_size, checksum, access_type, metadata, ttl_expires_at, uploaded_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
	_, err = r.db.ExecContext(ctx, query,
		file.ID, file.BucketID, file.FileKey, file.OriginalName, file.FilePath,
		file.MimeType, file.FileSize, file.Checksum, file.AccessType,
		metaJSON, file.TTLExpiresAt, file.UploadedBy,
		file.CreatedAt, file.UpdatedAt)
	return err
}

func (r *fileRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.File, error) {
	var row fileRow
	err := r.db.GetContext(ctx, &row,
		"SELECT * FROM files WHERE id = $1 AND deleted_at IS NULL", id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return row.toDomain()
}

func (r *fileRepo) GetByKey(ctx context.Context, bucketID uuid.UUID, fileKey string) (*domain.File, error) {
	var row fileRow
	err := r.db.GetContext(ctx, &row,
		"SELECT * FROM files WHERE bucket_id = $1 AND file_key = $2 AND deleted_at IS NULL",
		bucketID, fileKey)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return row.toDomain()
}

func (r *fileRepo) List(ctx context.Context, bucketID uuid.UUID, path string, pg domain.Pagination) ([]*domain.File, int64, error) {
	var total int64
	err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM files WHERE bucket_id = $1 AND file_path = $2 AND deleted_at IS NULL",
		bucketID, path)
	if err != nil {
		return nil, 0, err
	}

	var rows []fileRow
	err = r.db.SelectContext(ctx, &rows,
		`SELECT * FROM files WHERE bucket_id = $1 AND file_path = $2 AND deleted_at IS NULL
		ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
		bucketID, path, pg.Limit(), pg.Offset())
	if err != nil {
		return nil, 0, err
	}

	files := make([]*domain.File, 0, len(rows))
	for i := range rows {
		f, err := rows[i].toDomain()
		if err != nil {
			return nil, 0, err
		}
		files = append(files, f)
	}
	return files, total, nil
}

func (r *fileRepo) Update(ctx context.Context, file *domain.File) error {
	metaJSON, err := json.Marshal(file.Metadata)
	if err != nil {
		return err
	}
	query := `UPDATE files SET original_name=$1, file_path=$2, access_type=$3, metadata=$4, ttl_expires_at=$5, updated_at=$6 WHERE id=$7 AND deleted_at IS NULL`
	result, err := r.db.ExecContext(ctx, query,
		file.OriginalName, file.FilePath, file.AccessType,
		metaJSON, file.TTLExpiresAt, time.Now(), file.ID)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *fileRepo) SoftDelete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.ExecContext(ctx,
		"UPDATE files SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL",
		time.Now(), id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *fileRepo) GetExpired(ctx context.Context, limit int) ([]*domain.File, error) {
	var rows []fileRow
	err := r.db.SelectContext(ctx, &rows,
		`SELECT * FROM files WHERE ttl_expires_at IS NOT NULL AND ttl_expires_at < NOW() AND deleted_at IS NULL
		ORDER BY ttl_expires_at LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}

	files := make([]*domain.File, 0, len(rows))
	for i := range rows {
		f, err := rows[i].toDomain()
		if err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	return files, nil
}

func (r *fileRepo) CreateThumbnail(ctx context.Context, thumb *domain.Thumbnail) error {
	query := `INSERT INTO thumbnails (id, file_id, size_name, width, height, file_key, file_size, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query,
		thumb.ID, thumb.FileID, thumb.SizeName, thumb.Width, thumb.Height,
		thumb.FileKey, thumb.FileSize, thumb.CreatedAt)
	return err
}

func (r *fileRepo) GetThumbnail(ctx context.Context, fileID uuid.UUID, sizeName string) (*domain.Thumbnail, error) {
	var thumb domain.Thumbnail
	err := r.db.GetContext(ctx, &thumb,
		"SELECT * FROM thumbnails WHERE file_id = $1 AND size_name = $2",
		fileID, sizeName)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &thumb, nil
}

func (r *fileRepo) ListThumbnails(ctx context.Context, fileID uuid.UUID) ([]*domain.Thumbnail, error) {
	var thumbs []*domain.Thumbnail
	err := r.db.SelectContext(ctx, &thumbs,
		"SELECT * FROM thumbnails WHERE file_id = $1 ORDER BY size_name", fileID)
	if err != nil {
		return nil, err
	}
	return thumbs, nil
}
