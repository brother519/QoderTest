package http

import (
	"time"

	"file-storage-service/internal/domain"
	"file-storage-service/internal/usecase"
	"file-storage-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SignedURLHandler struct {
	signedURLUC *usecase.SignedURLUseCase
	downloadUC  *usecase.FileDownloadUseCase
}

func NewSignedURLHandler(signedURLUC *usecase.SignedURLUseCase, downloadUC *usecase.FileDownloadUseCase) *SignedURLHandler {
	return &SignedURLHandler{
		signedURLUC: signedURLUC,
		downloadUC:  downloadUC,
	}
}

func (h *SignedURLHandler) Register(r fiber.Router) {
	r.Post("/files/:id/signed-url", h.Create)
	r.Get("/public/:token", h.Access)
}

func (h *SignedURLHandler) Create(c *fiber.Ctx) error {
	fileID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid file id")
	}

	var body struct {
		ExpiresIn    int  `json:"expires_in"` // seconds
		MaxDownloads *int `json:"max_downloads"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "invalid request body")
	}

	expiry := 24 * time.Hour
	if body.ExpiresIn > 0 {
		expiry = time.Duration(body.ExpiresIn) * time.Second
	}

	baseURL := c.Protocol() + "://" + c.Hostname()

	result, err := h.signedURLUC.Create(c.Context(), usecase.CreateSignedURLInput{
		FileID:       fileID,
		ExpiresIn:    expiry,
		MaxDownloads: body.MaxDownloads,
	}, baseURL)
	if err != nil {
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, result)
}

func (h *SignedURLHandler) Access(c *fiber.Ctx) error {
	token := c.Params("token")
	if token == "" {
		return response.BadRequest(c, "token is required")
	}

	file, err := h.signedURLUC.ValidateToken(c.Context(), token)
	if err != nil {
		if err == domain.ErrSignedURLExpired {
			return response.Forbidden(c, "signed URL has expired")
		}
		if err == domain.ErrDownloadLimitReached {
			return response.Forbidden(c, "download limit reached")
		}
		if err == domain.ErrNotFound {
			return response.NotFound(c, "file not found")
		}
		return response.InternalError(c, err.Error())
	}

	result, err := h.downloadUC.Download(c.Context(), file.ID)
	if err != nil {
		return response.InternalError(c, err.Error())
	}

	if result.RedirectURL != "" {
		return c.Redirect(result.RedirectURL, fiber.StatusTemporaryRedirect)
	}
	return response.InternalError(c, "no download source available")
}
