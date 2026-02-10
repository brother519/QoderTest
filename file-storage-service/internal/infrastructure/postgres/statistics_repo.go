package postgres

import (
	"context"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type statisticsRepo struct {
	db *sqlx.DB
}

func NewStatisticsRepository(db *sqlx.DB) repository.StatisticsRepository {
	return &statisticsRepo{db: db}
}

func (r *statisticsRepo) RecordUpload(ctx context.Context, bucketID uuid.UUID, size int64) error {
	query := `INSERT INTO storage_statistics (bucket_id, date, file_count, total_size, bandwidth_upload, created_at)
		VALUES ($1, $2, 1, $3, $3, NOW())
		ON CONFLICT (bucket_id, date) DO UPDATE SET
			file_count = storage_statistics.file_count + 1,
			total_size = storage_statistics.total_size + $3,
			bandwidth_upload = storage_statistics.bandwidth_upload + $3`
	_, err := r.db.ExecContext(ctx, query, bucketID, time.Now().UTC().Truncate(24*time.Hour), size)
	return err
}

func (r *statisticsRepo) RecordDownload(ctx context.Context, bucketID uuid.UUID, size int64) error {
	query := `INSERT INTO storage_statistics (bucket_id, date, bandwidth_download, created_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (bucket_id, date) DO UPDATE SET
			bandwidth_download = storage_statistics.bandwidth_download + $3`
	_, err := r.db.ExecContext(ctx, query, bucketID, time.Now().UTC().Truncate(24*time.Hour), size)
	return err
}

func (r *statisticsRepo) GetBucketStats(ctx context.Context, query domain.StatsQuery) ([]domain.StorageStatistics, error) {
	var stats []domain.StorageStatistics
	err := r.db.SelectContext(ctx, &stats,
		`SELECT * FROM storage_statistics WHERE bucket_id = $1 AND date >= $2 AND date <= $3 ORDER BY date`,
		query.BucketID, query.StartDate, query.EndDate)
	if err != nil {
		return nil, err
	}
	return stats, nil
}

func (r *statisticsRepo) GetGlobalStats(ctx context.Context, query domain.StatsQuery) (*domain.StatsSummary, error) {
	var summary domain.StatsSummary
	err := r.db.GetContext(ctx, &summary,
		`SELECT COALESCE(SUM(file_count), 0) as total_files,
			COALESCE(SUM(total_size), 0) as total_size,
			COALESCE(SUM(bandwidth_upload), 0) as bandwidth_upload,
			COALESCE(SUM(bandwidth_download), 0) as bandwidth_download
		FROM storage_statistics WHERE date >= $1 AND date <= $2`,
		query.StartDate, query.EndDate)
	if err != nil {
		return nil, err
	}
	return &summary, nil
}
