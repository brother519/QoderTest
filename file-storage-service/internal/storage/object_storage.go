package storage

import (
	"context"
	"io"
	"time"
)

// ObjectInfo holds metadata about a stored object.
type ObjectInfo struct {
	Key          string
	Size         int64
	ContentType  string
	ETag         string
	LastModified time.Time
}

// CompletedPart represents a completed part of a multipart upload.
type CompletedPart struct {
	PartNumber int
	ETag       string
}

// ObjectStorage defines the interface for object storage operations.
type ObjectStorage interface {
	// Basic operations
	PutObject(ctx context.Context, bucket, key string, reader io.Reader, size int64, contentType string) error
	GetObject(ctx context.Context, bucket, key string) (io.ReadCloser, error)
	DeleteObject(ctx context.Context, bucket, key string) error
	HeadObject(ctx context.Context, bucket, key string) (*ObjectInfo, error)

	// Pre-signed URLs
	GeneratePresignedUploadURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error)
	GeneratePresignedDownloadURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error)

	// Multipart upload
	InitiateMultipartUpload(ctx context.Context, bucket, key, contentType string) (string, error)
	UploadPart(ctx context.Context, bucket, key, uploadID string, partNumber int, reader io.Reader, size int64) (string, error)
	CompleteMultipartUpload(ctx context.Context, bucket, key, uploadID string, parts []CompletedPart) error
	AbortMultipartUpload(ctx context.Context, bucket, key, uploadID string) error

	// Bucket management
	EnsureBucket(ctx context.Context, bucket string) error
}
