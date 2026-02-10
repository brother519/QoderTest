package domain

import "errors"

var (
	ErrNotFound           = errors.New("resource not found")
	ErrAlreadyExists      = errors.New("resource already exists")
	ErrInvalidFileType    = errors.New("file type not allowed")
	ErrFileTooLarge       = errors.New("file exceeds maximum size")
	ErrUploadSessionExpired = errors.New("upload session has expired")
	ErrUploadNotInProgress  = errors.New("upload is not in progress")
	ErrInvalidChunkNumber = errors.New("invalid chunk number")
	ErrAllChunksNotUploaded = errors.New("not all chunks have been uploaded")
	ErrSignedURLExpired   = errors.New("signed URL has expired")
	ErrDownloadLimitReached = errors.New("download limit reached")
	ErrBucketNotEmpty     = errors.New("bucket is not empty")
	ErrAccessDenied       = errors.New("access denied")
)
