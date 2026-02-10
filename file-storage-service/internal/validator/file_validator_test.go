package validator

import (
	"bytes"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFileValidator_IsAllowed(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name         string
		mimeType     string
		allowedTypes []string
		expected     bool
	}{
		{"exact match", "image/png", []string{"image/png"}, true},
		{"wildcard match", "image/jpeg", []string{"image/*"}, true},
		{"no match", "video/mp4", []string{"image/*"}, false},
		{"empty allowed means allow all", "video/mp4", []string{}, true},
		{"wildcard all", "application/pdf", []string{"*/*"}, true},
		{"multiple patterns", "application/pdf", []string{"image/*", "application/pdf"}, true},
		{"multiple patterns no match", "text/plain", []string{"image/*", "application/pdf"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := v.IsAllowed(tt.mimeType, tt.allowedTypes)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFileValidator_IsImage(t *testing.T) {
	v := NewFileValidator()

	assert.True(t, v.IsImage("image/png"))
	assert.True(t, v.IsImage("image/jpeg"))
	assert.False(t, v.IsImage("application/pdf"))
	assert.False(t, v.IsImage("video/mp4"))
}

func TestFileValidator_DetectMimeType(t *testing.T) {
	v := NewFileValidator()

	// PNG header magic bytes
	pngHeader := []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
	padded := make([]byte, 261)
	copy(padded, pngHeader)

	mimeType, err := v.DetectMimeType(bytes.NewReader(padded))
	assert.NoError(t, err)
	assert.Equal(t, "image/png", mimeType)

	// JPEG header magic bytes
	jpegHeader := []byte{0xFF, 0xD8, 0xFF, 0xE0}
	padded2 := make([]byte, 261)
	copy(padded2, jpegHeader)

	mimeType2, err := v.DetectMimeType(bytes.NewReader(padded2))
	assert.NoError(t, err)
	assert.Equal(t, "image/jpeg", mimeType2)

	// Unknown content
	unknown := make([]byte, 261)
	mimeType3, err := v.DetectMimeType(bytes.NewReader(unknown))
	assert.NoError(t, err)
	assert.Equal(t, "application/octet-stream", mimeType3)
}
