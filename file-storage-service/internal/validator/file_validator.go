package validator

import (
	"io"
	"strings"

	"github.com/h2non/filetype"
)

// FileValidator validates uploaded files by content (magic bytes).
type FileValidator struct{}

func NewFileValidator() *FileValidator {
	return &FileValidator{}
}

// DetectMimeType reads the first 261 bytes to detect file type via magic bytes.
func (v *FileValidator) DetectMimeType(reader io.Reader) (string, error) {
	header := make([]byte, 261)
	n, err := reader.Read(header)
	if err != nil && err != io.EOF {
		return "", err
	}
	kind, err := filetype.Match(header[:n])
	if err != nil {
		return "", err
	}
	if kind == filetype.Unknown {
		return "application/octet-stream", nil
	}
	return kind.MIME.Value, nil
}

// IsAllowed checks if the detected MIME type matches any allowed pattern.
// Patterns can be exact ("image/png") or wildcard ("image/*").
func (v *FileValidator) IsAllowed(mimeType string, allowedTypes []string) bool {
	if len(allowedTypes) == 0 {
		return true
	}
	for _, pattern := range allowedTypes {
		if pattern == "*/*" || pattern == mimeType {
			return true
		}
		if strings.HasSuffix(pattern, "/*") {
			prefix := strings.TrimSuffix(pattern, "/*")
			if strings.HasPrefix(mimeType, prefix+"/") {
				return true
			}
		}
	}
	return false
}

// IsImage checks if the MIME type is an image type.
func (v *FileValidator) IsImage(mimeType string) bool {
	return strings.HasPrefix(mimeType, "image/")
}
