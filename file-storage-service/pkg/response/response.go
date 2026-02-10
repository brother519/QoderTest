package response

import "github.com/gofiber/fiber/v2"

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Meta struct {
	Page       int   `json:"page,omitempty"`
	PageSize   int   `json:"page_size,omitempty"`
	Total      int64 `json:"total,omitempty"`
	TotalPages int   `json:"total_pages,omitempty"`
}

func OK(c *fiber.Ctx, data interface{}) error {
	return c.JSON(Response{Success: true, Data: data})
}

func OKWithMeta(c *fiber.Ctx, data interface{}, meta *Meta) error {
	return c.JSON(Response{Success: true, Data: data, Meta: meta})
}

func Created(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(Response{Success: true, Data: data})
}

func Err(c *fiber.Ctx, status int, code, message string) error {
	return c.Status(status).JSON(Response{
		Success: false,
		Error:   &ErrorInfo{Code: code, Message: message},
	})
}

func BadRequest(c *fiber.Ctx, message string) error {
	return Err(c, fiber.StatusBadRequest, "BAD_REQUEST", message)
}

func NotFound(c *fiber.Ctx, message string) error {
	return Err(c, fiber.StatusNotFound, "NOT_FOUND", message)
}

func InternalError(c *fiber.Ctx, message string) error {
	return Err(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", message)
}

func Forbidden(c *fiber.Ctx, message string) error {
	return Err(c, fiber.StatusForbidden, "FORBIDDEN", message)
}
