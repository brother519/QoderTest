package domain

import (
	"time"

	"github.com/google/uuid"
)

// StorageStatistics represents daily storage usage statistics.
type StorageStatistics struct {
	ID                int       `json:"id" db:"id"`
	BucketID          *uuid.UUID `json:"bucket_id,omitempty" db:"bucket_id"`
	Date              time.Time `json:"date" db:"date"`
	FileCount         int64     `json:"file_count" db:"file_count"`
	TotalSize         int64     `json:"total_size" db:"total_size"`
	BandwidthUpload   int64     `json:"bandwidth_upload" db:"bandwidth_upload"`
	BandwidthDownload int64     `json:"bandwidth_download" db:"bandwidth_download"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
}

// StatsQuery holds query parameters for statistics.
type StatsQuery struct {
	BucketID  *uuid.UUID
	StartDate time.Time
	EndDate   time.Time
}

// StatsSummary holds aggregated statistics.
type StatsSummary struct {
	TotalFiles        int64 `json:"total_files"`
	TotalSize         int64 `json:"total_size"`
	BandwidthUpload   int64 `json:"bandwidth_upload"`
	BandwidthDownload int64 `json:"bandwidth_download"`
}
