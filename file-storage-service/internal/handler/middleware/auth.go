package middleware

import (
	"strings"

	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
)

// SimpleAuth is a basic API key authentication middleware.
// In production, replace with JWT or OAuth2.
func SimpleAuth(apiKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if apiKey == "" {
			return c.Next()
		}

		auth := c.Get("Authorization")
		if auth == "" {
			auth = c.Query("api_key")
		} else {
			auth = strings.TrimPrefix(auth, "Bearer ")
		}

		if auth != apiKey {
			return response.Err(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "invalid or missing API key")
		}
		return c.Next()
	}
}
