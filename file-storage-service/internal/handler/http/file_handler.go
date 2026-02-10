package http

import (
	"strconv"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/usecase"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FileHandler struct {
	uploadUC     *usecase.FileUploadUseCase
	downloadUC   *usecase.FileDownloadUseCase
	managementUC *usecase.FileManagementUseCase
}

func NewFileHandler(
	uploadUC *usecase.FileUploadUseCase,
	downloadUC *usecase.FileDownloadUseCase,
	managementUC *usecase.FileManagementUseCase,
) *FileHandler {
	return &FileHandler{
		uploadUC:     uploadUC,
		downloadUC:   downloadUC,
		managementUC: managementUC,
	}
}

func (h *FileHandler) Register(r fiber.Router) {
	r.Post("/buckets/:bucket_id/files", h.Upload)
	r.Get("/buckets/:bucket_id/files", h.List)
	r.Get("/files/:id", h.GetByID)
	r.Get("/files/:id/download", h.Download)
	r.Delete("/files/:id", h.Delete)
	r.Patch("/files/:id", h.Update)
	r.Get("/files/:id/thumbnails/:size", h.GetThumbnail)
}

func (h *FileHandler) Upload(c *fiber.Ctx) error {
	bucketID, err := uuid.Parse(c.Params("bucket_id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	file, err := c.FormFile("file")
	if err != nil {
		return response.BadRequest(c, "file is required")
	}

	src, err := file.Open()
	if err != nil {
		return response.InternalError(c, "failed to open file")
	}
	defer src.Close()

	input := usecase.UploadFileInput{
		BucketID:   bucketID,
		FileName:   file.Filename,
		FilePath:   c.FormValue("path", "/"),
		FileSize:   file.Size,
		Reader:     src,
		AccessType: c.FormValue("access_type", ""),
		UploadedBy: c.FormValue("uploaded_by", ""),
	}

	result, err := h.uploadUC.Upload(c.Context(), input)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		if err == domain.ErrFileTooLarge {
			return response.BadRequest(c, "file exceeds maximum size")
		}
		if err == domain.ErrInvalidFileType {
			return response.BadRequest(c, "file type not allowed")
		}
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, result)
}

func (h *FileHandler) List(c *fiber.Ctx) error {
	bucketID, err := uuid.Parse(c.Params("bucket_id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	path := c.Query("path", "/")

	files, total, err := h.managementUC.List(c.Context(), bucketID, path, domain.Pagination{Page: page, PageSize: pageSize})
	if err != nil {
		return response.InternalError(c, err.Error())
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return response.OKWithMeta(c, files, &response.Meta{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	})
}

func (h *FileHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	file, err := h.managementUC.GetByID(c.Context(), id)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, file)
}

func (h *FileHandler) Download(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	result, err := h.downloadUC.Download(c.Context(), id)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}

	if result.RedirectURL != "" {
		return c.Redirect(result.RedirectURL, fiber.StatusTemporaryRedirect)
	}

	if result.Reader != nil {
		defer result.Reader.Close()
		c.Set("Content-Type", result.MimeType)
		c.Set("Content-Disposition", "attachment; filename=\""+result.FileName+"\"")
		return c.SendStream(result.Reader)
	}

	return response.InternalError(c, "no download source available")
}

func (h *FileHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	err = h.managementUC.Delete(c.Context(), id)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, fiber.Map{"deleted": true})
}

func (h *FileHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	var input usecase.UpdateFileInput
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "invalid request body")
	}

	file, err := h.managementUC.Update(c.Context(), id, input)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, file)
}

func (h *FileHandler) GetThumbnail(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	sizeName := c.Params("size")
	if sizeName == "" {
		return response.BadRequest(c, "size is required")
	}

	result, err := h.downloadUC.GetThumbnail(c.Context(), id, sizeName)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "thumbnail not found")
		}
		return response.InternalError(c, err.Error())
	}

	if result.RedirectURL != "" {
		return c.Redirect(result.RedirectURL, fiber.StatusTemporaryRedirect)
	}
	return response.InternalError(c, "no download source available")
}
