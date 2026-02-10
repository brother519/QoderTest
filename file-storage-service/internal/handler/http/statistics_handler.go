package http

import (
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/usecase"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type StatisticsHandler struct {
	uc *usecase.StatisticsUseCase
}

func NewStatisticsHandler(uc *usecase.StatisticsUseCase) *StatisticsHandler {
	return &StatisticsHandler{uc: uc}
}

func (h *StatisticsHandler) Register(r fiber.Router) {
	r.Get("/statistics/buckets/:id", h.GetBucketStats)
	r.Get("/statistics/global", h.GetGlobalStats)
}

func (h *StatisticsHandler) GetBucketStats(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid bucket id")
	}

	now := time.Now()
	startDate := parseTimeQuery(c, "start_date", now.AddDate(0, -1, 0))
	endDate := parseTimeQuery(c, "end_date", now)

	stats, err := h.uc.GetBucketStats(c.Context(), domain.StatsQuery{
		BucketID:  &id,
		StartDate: startDate,
		EndDate:   endDate,
	})
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, stats)
}

func (h *StatisticsHandler) GetGlobalStats(c *fiber.Ctx) error {
	now := time.Now()
	startDate := parseTimeQuery(c, "start_date", now.AddDate(0, -1, 0))
	endDate := parseTimeQuery(c, "end_date", now)

	stats, err := h.uc.GetGlobalStats(c.Context(), domain.StatsQuery{
		StartDate: startDate,
		EndDate:   endDate,
	})
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, stats)
}
