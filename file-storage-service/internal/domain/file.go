package domain

import (
	"time"

	"github.com/google/uuid"
)

type AccessType string

const (
	AccessPublic  AccessType = "public"
	AccessPrivate AccessType = "private"
	AccessSigned  AccessType = "signed"
)

// Bucket represents a storage bucket for organizing files.
type Bucket struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	Name             string     `json:"name" db:"name"`
	Description      string     `json:"description,omitempty" db:"description"`
	AccessType       AccessType `json:"access_type" db:"access_type"`
	AllowedFileTypes []string   `json:"allowed_file_types" db:"allowed_file_types"`
	MaxFileSize      int64      `json:"max_file_size" db:"max_file_size"`
	CDNPrefix        string     `json:"cdn_prefix,omitempty" db:"cdn_prefix"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`
}

// File represents a stored file's metadata.
type File struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	BucketID     uuid.UUID  `json:"bucket_id" db:"bucket_id"`
	FileKey      string     `json:"file_key" db:"file_key"`
	OriginalName string     `json:"original_name" db:"original_name"`
	FilePath     string     `json:"file_path" db:"file_path"`
	MimeType     string     `json:"mime_type" db:"mime_type"`
	FileSize     int64      `json:"file_size" db:"file_size"`
	Checksum     string     `json:"checksum,omitempty" db:"checksum"`
	AccessType   AccessType `json:"access_type" db:"access_type"`
	Metadata     MapJSON    `json:"metadata" db:"metadata"`
	TTLExpiresAt *time.Time `json:"ttl_expires_at,omitempty" db:"ttl_expires_at"`
	UploadedBy   string     `json:"uploaded_by,omitempty" db:"uploaded_by"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

// Thumbnail represents a generated thumbnail for an image file.
type Thumbnail struct {
	ID        uuid.UUID `json:"id" db:"id"`
	FileID    uuid.UUID `json:"file_id" db:"file_id"`
	SizeName  string    `json:"size_name" db:"size_name"`
	Width     int       `json:"width" db:"width"`
	Height    int       `json:"height" db:"height"`
	FileKey   string    `json:"file_key" db:"file_key"`
	FileSize  int64     `json:"file_size" db:"file_size"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// UploadSession tracks a chunked upload in progress.
type UploadSession struct {
	ID             uuid.UUID     `json:"id" db:"id"`
	BucketID       uuid.UUID     `json:"bucket_id" db:"bucket_id"`
	UploadID       string        `json:"upload_id" db:"upload_id"`
	FileKey        string        `json:"file_key" db:"file_key"`
	OriginalName   string        `json:"original_name" db:"original_name"`
	MimeType       string        `json:"mime_type" db:"mime_type"`
	TotalSize      int64         `json:"total_size" db:"total_size"`
	ChunkSize      int64         `json:"chunk_size" db:"chunk_size"`
	TotalChunks    int           `json:"total_chunks" db:"total_chunks"`
	UploadedChunks []ChunkInfo   `json:"uploaded_chunks" db:"uploaded_chunks"`
	Status         UploadStatus  `json:"status" db:"status"`
	ExpiresAt      time.Time     `json:"expires_at" db:"expires_at"`
	CreatedAt      time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at" db:"updated_at"`
}

type UploadStatus string

const (
	UploadInProgress UploadStatus = "in_progress"
	UploadCompleted  UploadStatus = "completed"
	UploadFailed     UploadStatus = "failed"
	UploadAborted    UploadStatus = "aborted"
)

type ChunkInfo struct {
	ChunkNumber int    `json:"chunk_number"`
	ETag        string `json:"etag"`
}

// SignedURL represents a temporary access URL for a file.
type SignedURL struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	FileID        uuid.UUID  `json:"file_id" db:"file_id"`
	URLToken      string     `json:"url_token" db:"url_token"`
	ExpiresAt     time.Time  `json:"expires_at" db:"expires_at"`
	MaxDownloads  *int       `json:"max_downloads,omitempty" db:"max_downloads"`
	DownloadCount int        `json:"download_count" db:"download_count"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// Pagination holds pagination parameters.
type Pagination struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
}

func (p Pagination) Offset() int {
	return (p.Page - 1) * p.PageSize
}

func (p Pagination) Limit() int {
	return p.PageSize
}
