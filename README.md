# File Storage Service

Enterprise-grade file upload and storage service with chunked upload, S3 integration, and image processing.

## Features

- ✅ 大文件分片上传（支持断点续传）
- ✅ 自动文件类型验证（MIME类型 + 魔数检测）
- ✅ 图片自动生成多尺寸缩略图
- ✅ CDN集成（通过CloudFront）
- ✅ 多级访问控制（公开/私密/签名URL）
- ✅ S3直传（预签名URL）
- ✅ 实时上传进度追踪
- ✅ Bucket/文件夹组织
- ✅ 临时文件自动过期清理
- ✅ 带宽和存储用量统计

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cloud Storage**: AWS S3
- **Authentication**: JWT
- **Image Processing**: Sharp
- **Task Queue**: Bull + Redis

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- AWS Account with S3 access

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Running the app

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Documentation

Once the application is running, visit:
- Swagger UI: http://localhost:3000/api/docs

## API Endpoints

### Upload
- `POST /api/v1/uploads/initiate` - Initialize chunked upload
- `PUT /api/v1/uploads/:sessionId/chunks/:partNumber` - Upload chunk
- `POST /api/v1/uploads/:sessionId/complete` - Complete upload
- `GET /api/v1/uploads/:sessionId` - Get upload progress
- `DELETE /api/v1/uploads/:sessionId` - Cancel upload

### Files
- `GET /api/v1/files` - List user files
- `GET /api/v1/files/:fileId` - Get file details
- `GET /api/v1/files/:fileId/download` - Download file
- `DELETE /api/v1/files/:fileId` - Delete file
- `PATCH /api/v1/files/:fileId/access` - Update access level

### Signed URLs
- `POST /api/v1/files/:fileId/signed-url` - Generate signed URL
- `GET /api/v1/signed/:token` - Access file with signed token

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
