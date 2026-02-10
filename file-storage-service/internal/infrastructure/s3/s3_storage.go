package s3

import (
	"bytes"
	"context"
	"io"
	"time"

	"file-storage-service/internal/storage"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type s3Storage struct {
	client    *s3.Client
	presigner *s3.PresignClient
}

func NewS3Storage(endpoint, accessKey, secretKey, region string, useSSL bool) (storage.ObjectStorage, error) {
	scheme := "http"
	if useSSL {
		scheme = "https"
	}
	endpointURL := scheme + "://" + endpoint

	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpointURL)
		o.UsePathStyle = true
	})

	return &s3Storage{
		client:    client,
		presigner: s3.NewPresignClient(client),
	}, nil
}

func (s *s3Storage) PutObject(ctx context.Context, bucket, key string, reader io.Reader, size int64, contentType string) error {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
	}
	if size > 0 {
		input.ContentLength = aws.Int64(size)
	}
	_, err := s.client.PutObject(ctx, input)
	return err
}

func (s *s3Storage) GetObject(ctx context.Context, bucket, key string) (io.ReadCloser, error) {
	output, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return output.Body, nil
}

func (s *s3Storage) DeleteObject(ctx context.Context, bucket, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	return err
}

func (s *s3Storage) HeadObject(ctx context.Context, bucket, key string) (*storage.ObjectInfo, error) {
	output, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	info := &storage.ObjectInfo{
		Key:  key,
		Size: aws.ToInt64(output.ContentLength),
		ETag: aws.ToString(output.ETag),
	}
	if output.ContentType != nil {
		info.ContentType = *output.ContentType
	}
	if output.LastModified != nil {
		info.LastModified = *output.LastModified
	}
	return info, nil
}

func (s *s3Storage) GeneratePresignedUploadURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error) {
	req, err := s.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *s3Storage) GeneratePresignedDownloadURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error) {
	req, err := s.presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *s3Storage) InitiateMultipartUpload(ctx context.Context, bucket, key, contentType string) (string, error) {
	output, err := s.client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}
	return aws.ToString(output.UploadId), nil
}

func (s *s3Storage) UploadPart(ctx context.Context, bucket, key, uploadID string, partNumber int, reader io.Reader, size int64) (string, error) {
	body, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}
	output, err := s.client.UploadPart(ctx, &s3.UploadPartInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(key),
		UploadId:      aws.String(uploadID),
		PartNumber:    aws.Int32(int32(partNumber)),
		Body:          bytes.NewReader(body),
		ContentLength: aws.Int64(int64(len(body))),
	})
	if err != nil {
		return "", err
	}
	return aws.ToString(output.ETag), nil
}

func (s *s3Storage) CompleteMultipartUpload(ctx context.Context, bucket, key, uploadID string, parts []storage.CompletedPart) error {
	s3Parts := make([]types.CompletedPart, len(parts))
	for i, p := range parts {
		s3Parts[i] = types.CompletedPart{
			PartNumber: aws.Int32(int32(p.PartNumber)),
			ETag:       aws.String(p.ETag),
		}
	}
	_, err := s.client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket:   aws.String(bucket),
		Key:      aws.String(key),
		UploadId: aws.String(uploadID),
		MultipartUpload: &types.CompletedMultipartUpload{
			Parts: s3Parts,
		},
	})
	return err
}

func (s *s3Storage) AbortMultipartUpload(ctx context.Context, bucket, key, uploadID string) error {
	_, err := s.client.AbortMultipartUpload(ctx, &s3.AbortMultipartUploadInput{
		Bucket:   aws.String(bucket),
		Key:      aws.String(key),
		UploadId: aws.String(uploadID),
	})
	return err
}

func (s *s3Storage) EnsureBucket(ctx context.Context, bucket string) error {
	_, err := s.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(bucket),
	})
	if err == nil {
		return nil
	}
	_, err = s.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(bucket),
	})
	return err
}
