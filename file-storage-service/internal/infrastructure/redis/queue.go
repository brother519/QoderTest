package redis

import (
	"context"
	"encoding/json"
	"fmt"

	"file-storage-service/internal/queue"

	"github.com/hibiken/asynq"
)

const (
	TypeThumbnailGeneration = "thumbnail:generate"
	TypeFileCleanup         = "file:cleanup"
)

type ThumbnailPayload struct {
	FileID string   `json:"file_id"`
	Sizes  []string `json:"sizes"`
}

type FileCleanupPayload struct {
	FileID string `json:"file_id"`
}

type asynqQueue struct {
	client *asynq.Client
}

func NewTaskQueue(redisAddr, redisPassword string) queue.TaskQueue {
	client := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     redisAddr,
		Password: redisPassword,
	})
	return &asynqQueue{client: client}
}

func (q *asynqQueue) EnqueueThumbnailGeneration(ctx context.Context, fileID string, sizes []string) error {
	payload, err := json.Marshal(ThumbnailPayload{FileID: fileID, Sizes: sizes})
	if err != nil {
		return fmt.Errorf("marshal thumbnail payload: %w", err)
	}
	task := asynq.NewTask(TypeThumbnailGeneration, payload)
	_, err = q.client.EnqueueContext(ctx, task, asynq.MaxRetry(3))
	return err
}

func (q *asynqQueue) EnqueueFileCleanup(ctx context.Context, fileID string) error {
	payload, err := json.Marshal(FileCleanupPayload{FileID: fileID})
	if err != nil {
		return fmt.Errorf("marshal cleanup payload: %w", err)
	}
	task := asynq.NewTask(TypeFileCleanup, payload)
	_, err = q.client.EnqueueContext(ctx, task, asynq.MaxRetry(3))
	return err
}

func (q *asynqQueue) Close() error {
	return q.client.Close()
}
