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

type bucketRepo struct {
	db *sqlx.DB
}

func NewBucketRepository(db *sqlx.DB) repository.BucketRepository {
	return &bucketRepo{db: db}
}

func (r *bucketRepo) Create(ctx context.Context, bucket *domain.Bucket) error {
	typesJSON, err := json.Marshal(bucket.AllowedFileTypes)
	if err != nil {
		return err
	}
	query := `INSERT INTO buckets (id, name, description, access_type, allowed_file_types, max_file_size, cdn_prefix, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err = r.db.ExecContext(ctx, query,
		bucket.ID, bucket.Name, bucket.Description, bucket.AccessType,
		typesJSON, bucket.MaxFileSize, bucket.CDNPrefix,
		bucket.CreatedAt, bucket.UpdatedAt)
	return err
}

type bucketRow struct {
	ID               uuid.UUID `db:"id"`
	Name             string    `db:"name"`
	Description      string    `db:"description"`
	AccessType       string    `db:"access_type"`
	AllowedFileTypes []byte    `db:"allowed_file_types"`
	MaxFileSize      int64     `db:"max_file_size"`
	CDNPrefix        string    `db:"cdn_prefix"`
	CreatedAt        time.Time `db:"created_at"`
	UpdatedAt        time.Time `db:"updated_at"`
}

func (row *bucketRow) toDomain() (*domain.Bucket, error) {
	var types []string
	if len(row.AllowedFileTypes) > 0 {
		if err := json.Unmarshal(row.AllowedFileTypes, &types); err != nil {
			return nil, err
		}
	}
	return &domain.Bucket{
		ID:               row.ID,
		Name:             row.Name,
		Description:      row.Description,
		AccessType:       domain.AccessType(row.AccessType),
		AllowedFileTypes: types,
		MaxFileSize:      row.MaxFileSize,
		CDNPrefix:        row.CDNPrefix,
		CreatedAt:        row.CreatedAt,
		UpdatedAt:        row.UpdatedAt,
	}, nil
}

func (r *bucketRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Bucket, error) {
	var row bucketRow
	err := r.db.GetContext(ctx, &row, "SELECT * FROM buckets WHERE id = $1", id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return row.toDomain()
}

func (r *bucketRepo) GetByName(ctx context.Context, name string) (*domain.Bucket, error) {
	var row bucketRow
	err := r.db.GetContext(ctx, &row, "SELECT * FROM buckets WHERE name = $1", name)
	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return row.toDomain()
}

func (r *bucketRepo) List(ctx context.Context, pg domain.Pagination) ([]*domain.Bucket, int64, error) {
	var total int64
	err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM buckets")
	if err != nil {
		return nil, 0, err
	}

	var rows []bucketRow
	err = r.db.SelectContext(ctx, &rows,
		"SELECT * FROM buckets ORDER BY created_at DESC LIMIT $1 OFFSET $2",
		pg.Limit(), pg.Offset())
	if err != nil {
		return nil, 0, err
	}

	buckets := make([]*domain.Bucket, 0, len(rows))
	for i := range rows {
		b, err := rows[i].toDomain()
		if err != nil {
			return nil, 0, err
		}
		buckets = append(buckets, b)
	}
	return buckets, total, nil
}

func (r *bucketRepo) Update(ctx context.Context, bucket *domain.Bucket) error {
	typesJSON, err := json.Marshal(bucket.AllowedFileTypes)
	if err != nil {
		return err
	}
	query := `UPDATE buckets SET name=$1, description=$2, access_type=$3, allowed_file_types=$4, max_file_size=$5, cdn_prefix=$6, updated_at=$7 WHERE id=$8`
	result, err := r.db.ExecContext(ctx, query,
		bucket.Name, bucket.Description, bucket.AccessType,
		typesJSON, bucket.MaxFileSize, bucket.CDNPrefix,
		time.Now(), bucket.ID)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *bucketRepo) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM buckets WHERE id = $1", id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *bucketRepo) HasFiles(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	err := r.db.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM files WHERE bucket_id = $1 AND deleted_at IS NULL", id)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
