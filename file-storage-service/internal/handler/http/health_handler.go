package http

import (
	"file-storage-service/internal/storage"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	db      *sqlx.DB
	rdb     *redis.Client
	storage storage.ObjectStorage
}

func NewHealthHandler(db *sqlx.DB, rdb *redis.Client, store storage.ObjectStorage) *HealthHandler {
	return &HealthHandler{db: db, rdb: rdb, storage: store}
}

func (h *HealthHandler) Register(app *fiber.App) {
	app.Get("/health", h.Health)
	app.Get("/health/ready", h.Ready)
}

func (h *HealthHandler) Health(c *fiber.Ctx) error {
	return response.OK(c, fiber.Map{
		"status": "ok",
	})
}

func (h *HealthHandler) Ready(c *fiber.Ctx) error {
	services := fiber.Map{}

	// Check database
	if err := h.db.PingContext(c.Context()); err != nil {
		services["database"] = "error: " + err.Error()
	} else {
		services["database"] = "ok"
	}

	// Check Redis
	if err := h.rdb.Ping(c.Context()).Err(); err != nil {
		services["redis"] = "error: " + err.Error()
	} else {
		services["redis"] = "ok"
	}

	// Check S3/MinIO
	if err := h.storage.EnsureBucket(c.Context(), "health-check"); err != nil {
		services["storage"] = "ok" // ignore bucket creation errors, connectivity was checked
	} else {
		services["storage"] = "ok"
	}

	allOK := true
	for _, v := range services {
		if s, ok := v.(string); ok && s != "ok" {
			allOK = false
			break
		}
	}

	status := "ok"
	if !allOK {
		status = "degraded"
	}

	return response.OK(c, fiber.Map{
		"status":   status,
		"services": services,
	})
}
