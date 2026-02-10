package middleware

import (
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func ErrorHandler(log *zap.Logger) fiber.ErrorHandler {
	return func(c *fiber.Ctx, err error) error {
		code := fiber.StatusInternalServerError
		if e, ok := err.(*fiber.Error); ok {
			code = e.Code
		}

		log.Error("unhandled error",
			zap.Error(err),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
		)

		return response.Err(c, code, "INTERNAL_ERROR", err.Error())
	}
}
