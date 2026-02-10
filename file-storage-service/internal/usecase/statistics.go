package usecase

import (
	"context"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/repository"

	"github.com/google/uuid"
)

type StatisticsUseCase struct {
	statsRepo repository.StatisticsRepository
}

func NewStatisticsUseCase(statsRepo repository.StatisticsRepository) *StatisticsUseCase {
	return &StatisticsUseCase{statsRepo: statsRepo}
}

func (uc *StatisticsUseCase) GetBucketStats(ctx context.Context, query domain.StatsQuery) ([]domain.StorageStatistics, error) {
	return uc.statsRepo.GetBucketStats(ctx, query)
}

func (uc *StatisticsUseCase) GetGlobalStats(ctx context.Context, query domain.StatsQuery) (*domain.StatsSummary, error) {
	return uc.statsRepo.GetGlobalStats(ctx, query)
}

func (uc *StatisticsUseCase) RecordUpload(ctx context.Context, bucketID uuid.UUID, size int64) error {
	return uc.statsRepo.RecordUpload(ctx, bucketID, size)
}

func (uc *StatisticsUseCase) RecordDownload(ctx context.Context, bucketID uuid.UUID, size int64) error {
	return uc.statsRepo.RecordDownload(ctx, bucketID, size)
}
