package usecase

import (
	"context"
	"fmt"
	"math"
	"path/filepath"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/queue"
	"file-storage-service/internal/repository"
	"file-storage-service/internal/storage"
	"file-storage-service/internal/validator"

	"github.com/google/uuid"
)

type ChunkedUploadUseCase struct {
	sessionRepo repository.UploadSessionRepository
	fileRepo    repository.FileRepository
	bucketRepo  repository.BucketRepository
	statsRepo   repository.StatisticsRepository
	store       storage.ObjectStorage
	queue       queue.TaskQueue
	validator   *validator.FileValidator
	thumbSizes  []string
	chunkSize   int64
	expiry      time.Duration
}

func NewChunkedUploadUseCase(
	sessionRepo repository.UploadSessionRepository,
	fileRepo repository.FileRepository,
	bucketRepo repository.BucketRepository,
	statsRepo repository.StatisticsRepository,
	store storage.ObjectStorage,
	q queue.TaskQueue,
	v *validator.FileValidator,
	thumbSizes []string,
	chunkSize int64,
	expiry time.Duration,
) *ChunkedUploadUseCase {
	return &ChunkedUploadUseCase{
		sessionRepo: sessionRepo,
		fileRepo:    fileRepo,
		bucketRepo:  bucketRepo,
		statsRepo:   statsRepo,
		store:       store,
		queue:       q,
		validator:   v,
		thumbSizes:  thumbSizes,
		chunkSize:   chunkSize,
		expiry:      expiry,
	}
}

type InitChunkedUploadInput struct {
	BucketID uuid.UUID
	FileName string
	FileSize int64
	MimeType string
	FilePath string
}

type InitChunkedUploadOutput struct {
	SessionID   uuid.UUID `json:"session_id"`
	UploadID    string    `json:"upload_id"`
	ChunkSize   int64     `json:"chunk_size"`
	TotalChunks int       `json:"total_chunks"`
	ExpiresAt   time.Time `json:"expires_at"`
}

func (uc *ChunkedUploadUseCase) Initiate(ctx context.Context, input InitChunkedUploadInput) (*InitChunkedUploadOutput, error) {
	bucket, err := uc.bucketRepo.GetByID(ctx, input.BucketID)
	if err != nil {
		return nil, err
	}

	if input.FileSize > bucket.MaxFileSize {
		return nil, domain.ErrFileTooLarge
	}

	ext := filepath.Ext(input.FileName)
	fileKey := generateFileKey(input.FilePath, ext)

	contentType := input.MimeType
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	uploadID, err := uc.store.InitiateMultipartUpload(ctx, bucket.Name, fileKey, contentType)
	if err != nil {
		return nil, fmt.Errorf("initiate multipart upload: %w", err)
	}

	totalChunks := int(math.Ceil(float64(input.FileSize) / float64(uc.chunkSize)))
	if totalChunks == 0 {
		totalChunks = 1
	}

	session := &domain.UploadSession{
		ID:             uuid.New(),
		BucketID:       bucket.ID,
		UploadID:       uploadID,
		FileKey:        fileKey,
		OriginalName:   input.FileName,
		MimeType:       contentType,
		TotalSize:      input.FileSize,
		ChunkSize:      uc.chunkSize,
		TotalChunks:    totalChunks,
		UploadedChunks: []domain.ChunkInfo{},
		Status:         domain.UploadInProgress,
		ExpiresAt:      time.Now().Add(uc.expiry),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := uc.sessionRepo.Create(ctx, session); err != nil {
		// Try to abort the multipart upload
		_ = uc.store.AbortMultipartUpload(ctx, bucket.Name, fileKey, uploadID)
		return nil, fmt.Errorf("create upload session: %w", err)
	}

	return &InitChunkedUploadOutput{
		SessionID:   session.ID,
		UploadID:    uploadID,
		ChunkSize:   uc.chunkSize,
		TotalChunks: totalChunks,
		ExpiresAt:   session.ExpiresAt,
	}, nil
}

type UploadChunkOutput struct {
	ChunkNumber int    `json:"chunk_number"`
	ETag        string `json:"etag"`
}

func (uc *ChunkedUploadUseCase) UploadChunk(ctx context.Context, sessionID uuid.UUID, chunkNumber int, reader interface{ Read([]byte) (int, error) }, size int64) (*UploadChunkOutput, error) {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	if session.Status != domain.UploadInProgress {
		return nil, domain.ErrUploadNotInProgress
	}
	if time.Now().After(session.ExpiresAt) {
		return nil, domain.ErrUploadSessionExpired
	}
	if chunkNumber < 1 || chunkNumber > session.TotalChunks {
		return nil, domain.ErrInvalidChunkNumber
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, session.BucketID)
	if err != nil {
		return nil, err
	}

	etag, err := uc.store.UploadPart(ctx, bucket.Name, session.FileKey, session.UploadID, chunkNumber, reader, size)
	if err != nil {
		return nil, fmt.Errorf("upload part: %w", err)
	}

	// Update uploaded chunks (replace if already exists for idempotency)
	found := false
	for i, c := range session.UploadedChunks {
		if c.ChunkNumber == chunkNumber {
			session.UploadedChunks[i].ETag = etag
			found = true
			break
		}
	}
	if !found {
		session.UploadedChunks = append(session.UploadedChunks, domain.ChunkInfo{
			ChunkNumber: chunkNumber,
			ETag:        etag,
		})
	}

	if err := uc.sessionRepo.Update(ctx, session); err != nil {
		return nil, fmt.Errorf("update session: %w", err)
	}

	return &UploadChunkOutput{
		ChunkNumber: chunkNumber,
		ETag:        etag,
	}, nil
}

type UploadProgressOutput struct {
	SessionID      uuid.UUID          `json:"session_id"`
	Status         domain.UploadStatus `json:"status"`
	TotalChunks    int                `json:"total_chunks"`
	UploadedChunks int                `json:"uploaded_chunks"`
	Chunks         []domain.ChunkInfo `json:"chunks"`
	ExpiresAt      time.Time          `json:"expires_at"`
}

func (uc *ChunkedUploadUseCase) GetProgress(ctx context.Context, sessionID uuid.UUID) (*UploadProgressOutput, error) {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	return &UploadProgressOutput{
		SessionID:      session.ID,
		Status:         session.Status,
		TotalChunks:    session.TotalChunks,
		UploadedChunks: len(session.UploadedChunks),
		Chunks:         session.UploadedChunks,
		ExpiresAt:      session.ExpiresAt,
	}, nil
}

func (uc *ChunkedUploadUseCase) Complete(ctx context.Context, sessionID uuid.UUID) (*domain.File, error) {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	if session.Status != domain.UploadInProgress {
		return nil, domain.ErrUploadNotInProgress
	}
	if len(session.UploadedChunks) != session.TotalChunks {
		return nil, domain.ErrAllChunksNotUploaded
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, session.BucketID)
	if err != nil {
		return nil, err
	}

	parts := make([]storage.CompletedPart, len(session.UploadedChunks))
	for i, c := range session.UploadedChunks {
		parts[i] = storage.CompletedPart{
			PartNumber: c.ChunkNumber,
			ETag:       c.ETag,
		}
	}

	if err := uc.store.CompleteMultipartUpload(ctx, bucket.Name, session.FileKey, session.UploadID, parts); err != nil {
		return nil, fmt.Errorf("complete multipart upload: %w", err)
	}

	file := &domain.File{
		ID:           uuid.New(),
		BucketID:     bucket.ID,
		FileKey:      session.FileKey,
		OriginalName: session.OriginalName,
		FilePath:     "/",
		MimeType:     session.MimeType,
		FileSize:     session.TotalSize,
		AccessType:   bucket.AccessType,
		Metadata:     domain.MapJSON{},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := uc.fileRepo.Create(ctx, file); err != nil {
		return nil, fmt.Errorf("create file record: %w", err)
	}

	session.Status = domain.UploadCompleted
	_ = uc.sessionRepo.Update(ctx, session)

	_ = uc.statsRepo.RecordUpload(ctx, bucket.ID, session.TotalSize)

	if uc.validator.IsImage(session.MimeType) && len(uc.thumbSizes) > 0 {
		_ = uc.queue.EnqueueThumbnailGeneration(ctx, file.ID.String(), uc.thumbSizes)
	}

	return file, nil
}

func (uc *ChunkedUploadUseCase) Abort(ctx context.Context, sessionID uuid.UUID) error {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return err
	}

	bucket, err := uc.bucketRepo.GetByID(ctx, session.BucketID)
	if err != nil {
		return err
	}

	_ = uc.store.AbortMultipartUpload(ctx, bucket.Name, session.FileKey, session.UploadID)

	session.Status = domain.UploadAborted
	return uc.sessionRepo.Update(ctx, session)
}
