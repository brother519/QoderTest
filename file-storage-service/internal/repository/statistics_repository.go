package repository

import (
	"context"

	"file-storage-service/internal/domain"

	"github.com/google/uuid"
)

type StatisticsRepository interface {
	RecordUpload(ctx context.Context, bucketID uuid.UUID, size int64) error
	RecordDownload(ctx context.Context, bucketID uuid.UUID, size int64) error
	GetBucketStats(ctx context.Context, query domain.StatsQuery) ([]domain.StorageStatistics, error)
	GetGlobalStats(ctx context.Context, query domain.StatsQuery) (*domain.StatsSummary, error)
}
