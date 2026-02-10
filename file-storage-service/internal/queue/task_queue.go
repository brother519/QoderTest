package queue

import "context"

// TaskQueue defines the interface for enqueueing async tasks.
type TaskQueue interface {
	EnqueueThumbnailGeneration(ctx context.Context, fileID string, sizes []string) error
	EnqueueFileCleanup(ctx context.Context, fileID string) error
	Close() error
}
