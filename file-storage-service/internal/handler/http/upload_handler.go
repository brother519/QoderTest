package http

import (
	"file-storage-service/internal/domain"
	"file-storage-service/internal/usecase"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UploadHandler struct {
	chunkedUC *usecase.ChunkedUploadUseCase
	directUC  *usecase.DirectUploadUseCase
}

func NewUploadHandler(
	chunkedUC *usecase.ChunkedUploadUseCase,
	directUC *usecase.DirectUploadUseCase,
) *UploadHandler {
	return &UploadHandler{
		chunkedUC: chunkedUC,
		directUC:  directUC,
	}
}

func (h *UploadHandler) Register(r fiber.Router) {
	// Chunked upload
	r.Post("/buckets/:bucket_id/uploads", h.InitiateChunkedUpload)
	r.Put("/uploads/:session_id/chunks/:chunk_number", h.UploadChunk)
	r.Get("/uploads/:session_id", h.GetProgress)
	r.Post("/uploads/:session_id/complete", h.CompleteChunkedUpload)
	r.Delete("/uploads/:session_id", h.AbortUpload)

	// Direct upload
	r.Post("/buckets/:bucket_id/direct-upload", h.GenerateDirectUploadURL)
	r.Post("/files/complete-direct-upload", h.CompleteDirectUpload)
}

func (h *UploadHandler) InitiateChunkedUpload(c *fiber.Ctx) error {
	bucketID, err := uuid.Parse(c.Params("bucket_id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	var body struct {
		FileName string `json:"file_name"`
		FileSize int64  `json:"file_size"`
		MimeType string `json:"mime_type"`
		FilePath string `json:"file_path"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "invalid request body")
	}
	if body.FileName == "" || body.FileSize == 0 {
		return response.BadRequest(c, "file_name and file_size are required")
	}

	result, err := h.chunkedUC.Initiate(c.Context(), usecase.InitChunkedUploadInput{
		BucketID: bucketID,
		FileName: body.FileName,
		FileSize: body.FileSize,
		MimeType: body.MimeType,
		FilePath: body.FilePath,
	})
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		if err == domain.ErrFileTooLarge {
			return response.BadRequest(c, "file exceeds maximum size")
		}
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, result)
}

func (h *UploadHandler) UploadChunk(c *fiber.Ctx) error {
	sessionID, err := uuid.Parse(c.Params("session_id"))
	if err != nil {
		return response.BadRequest(c, "invalid session id")
	}

	chunkNumber, err := parseIntParam(c.Params("chunk_number"))
	if err != nil || chunkNumber < 1 {
		return response.BadRequest(c, "invalid chunk number")
	}

	body := c.Body()
	if len(body) == 0 {
		return response.BadRequest(c, "chunk data is required")
	}

	reader := &bytesReader{data: body, pos: 0}

	result, err := h.chunkedUC.UploadChunk(c.Context(), sessionID, chunkNumber, reader, int64(len(body)))
	if err != nil {
		if err == domain.ErrUploadNotInProgress {
			return response.BadRequest(c, "upload is not in progress")
		}
		if err == domain.ErrUploadSessionExpired {
			return response.BadRequest(c, "upload session has expired")
		}
		if err == domain.ErrInvalidChunkNumber {
			return response.BadRequest(c, "invalid chunk number")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, result)
}

type bytesReader struct {
	data []byte
	pos  int
}

func (r *bytesReader) Read(p []byte) (n int, err error) {
	if r.pos >= len(r.data) {
		return 0, nil
	}
	n = copy(p, r.data[r.pos:])
	r.pos += n
	if r.pos >= len(r.data) {
		return n, nil
	}
	return n, nil
}

func (h *UploadHandler) GetProgress(c *fiber.Ctx) error {
	sessionID, err := uuid.Parse(c.Params("session_id"))
	if err != nil {
		return response.BadRequest(c, "invalid session id")
	}

	result, err := h.chunkedUC.GetProgress(c.Context(), sessionID)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "upload session not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, result)
}

func (h *UploadHandler) CompleteChunkedUpload(c *fiber.Ctx) error {
	sessionID, err := uuid.Parse(c.Params("session_id"))
	if err != nil {
		return response.BadRequest(c, "invalid session id")
	}

	file, err := h.chunkedUC.Complete(c.Context(), sessionID)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "upload session not found")
		}
		if err == domain.ErrUploadNotInProgress {
			return response.BadRequest(c, "upload is not in progress")
		}
		if err == domain.ErrAllChunksNotUploaded {
			return response.BadRequest(c, "not all chunks have been uploaded")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, file)
}

func (h *UploadHandler) AbortUpload(c *fiber.Ctx) error {
	sessionID, err := uuid.Parse(c.Params("session_id"))
	if err != nil {
		return response.BadRequest(c, "invalid session id")
	}

	err = h.chunkedUC.Abort(c.Context(), sessionID)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "upload session not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, fiber.Map{"aborted": true})
}

func (h *UploadHandler) GenerateDirectUploadURL(c *fiber.Ctx) error {
	bucketID, err := uuid.Parse(c.Params("bucket_id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	var body struct {
		FileName string `json:"file_name"`
		FileSize int64  `json:"file_size"`
		MimeType string `json:"mime_type"`
		FilePath string `json:"file_path"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "invalid request body")
	}
	if body.FileName == "" {
		return response.BadRequest(c, "file_name is required")
	}

	result, err := h.directUC.GenerateUploadURL(c.Context(), usecase.DirectUploadInput{
		BucketID: bucketID,
		FileName: body.FileName,
		FileSize: body.FileSize,
		MimeType: body.MimeType,
		FilePath: body.FilePath,
	})
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		if err == domain.ErrFileTooLarge {
			return response.BadRequest(c, "file exceeds maximum size")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, result)
}

func (h *UploadHandler) CompleteDirectUpload(c *fiber.Ctx) error {
	var body struct {
		BucketID string `json:"bucket_id"`
		FileKey  string `json:"file_key"`
		FileName string `json:"file_name"`
		MimeType string `json:"mime_type"`
		FilePath string `json:"file_path"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "invalid request body")
	}

	bucketID, err := uuid.Parse(body.BucketID)
	if err != nil {
		return response.BadRequest(c, "invalid bucket_id")
	}

	file, err := h.directUC.CompleteDirectUpload(c.Context(), usecase.CompleteDirectUploadInput{
		BucketID: bucketID,
		FileKey:  body.FileKey,
		FileName: body.FileName,
		MimeType: body.MimeType,
		FilePath: body.FilePath,
	})
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, file)
}

func parseIntParam(s string) (int, error) {
	val := 0
	for _, ch := range s {
		if ch < '0' || ch > '9' {
			return 0, fiber.ErrBadRequest
		}
		val = val*10 + int(ch-'0')
	}
	return val, nil
}
