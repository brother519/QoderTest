package http

import (
	"strconv"
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/usecase"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BucketHandler struct {
	uc *usecase.BucketUseCase
}

func NewBucketHandler(uc *usecase.BucketUseCase) *BucketHandler {
	return &BucketHandler{uc: uc}
}

func (h *BucketHandler) Register(r fiber.Router) {
	r.Post("/buckets", h.Create)
	r.Get("/buckets", h.List)
	r.Get("/buckets/:id", h.GetByID)
	r.Patch("/buckets/:id", h.Update)
	r.Delete("/buckets/:id", h.Delete)
}

func (h *BucketHandler) Create(c *fiber.Ctx) error {
	var input usecase.CreateBucketInput
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "invalid request body")
	}
	if input.Name == "" {
		return response.BadRequest(c, "name is required")
	}

	bucket, err := h.uc.Create(c.Context(), input)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, bucket)
}

func (h *BucketHandler) List(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))

	buckets, total, err := h.uc.List(c.Context(), domain.Pagination{Page: page, PageSize: pageSize})
	if err != nil {
		return response.InternalError(c, err.Error())
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return response.OKWithMeta(c, buckets, &response.Meta{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	})
}

func (h *BucketHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	bucket, err := h.uc.GetByID(c.Context(), id)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, bucket)
}

func (h *BucketHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	var input usecase.UpdateBucketInput
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "invalid request body")
	}

	bucket, err := h.uc.Update(c.Context(), id, input)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, bucket)
}

func (h *BucketHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	err = h.uc.Delete(c.Context(), id)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "bucket not found")
		}
		if err == domain.ErrBucketNotEmpty {
			return response.BadRequest(c, "bucket is not empty")
		}
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, fiber.Map{"deleted": true})
}

// helper for parsing time query params
func parseTimeQuery(c *fiber.Ctx, key string, defaultVal time.Time) time.Time {
	val := c.Query(key)
	if val == "" {
		return defaultVal
	}
	t, err := time.Parse("2006-01-02", val)
	if err != nil {
		return defaultVal
	}
	return t
}
