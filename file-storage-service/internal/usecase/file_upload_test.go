package usecase

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGenerateFileKey_WithPath(t *testing.T) {
	key := generateFileKey("images/photos", ".png")
	assert.Contains(t, key, "images/photos/")
	assert.Contains(t, key, ".png")
}

func TestGenerateFileKey_RootPath(t *testing.T) {
	key := generateFileKey("", ".jpg")
	assert.Contains(t, key, ".jpg")
	assert.NotContains(t, key, "/") // Only UUID + ext, no prefix slash
	_ = time.Now() // ensure time package compiles
}

func TestGenerateFileKey_SlashPath(t *testing.T) {
	key := generateFileKey("/", ".pdf")
	assert.Contains(t, key, ".pdf")
}
