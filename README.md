# File Upload Service

企业级文件上传和存储服务，基于 Node.js + Fastify + AWS S3 + CloudFront CDN + MongoDB。

## 功能特性

- **大文件分片上传** - 支持断点续传，使用 S3 Multipart Upload API
- **文件类型验证** - 多层验证（MIME type + Magic Bytes）
- **图片缩略图生成** - 自动生成多尺寸缩略图（150/300/600px）
- **CloudFront CDN** - 快速分发，支持签名URL
- **访问控制** - 公开/私密/签名URL三种模式
- **直传S3** - 客户端通过预签名URL直传
- **上传进度追踪** - 记录分片上传状态
- **文件组织** - 按bucket和文件夹组织
- **临时文件过期** - S3 Lifecycle 自动清理
- **用量统计** - 带宽和存储统计

## 技术栈

- **后端框架**: Node.js + Fastify
- **云存储**: AWS S3
- **数据库**: MongoDB
- **CDN**: CloudFront
- **图片处理**: Sharp

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env.development` 并填写配置：

```bash
cp .env.example .env.development
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## Docker 部署

```bash
cd docker
docker-compose up -d
```

## API 端点

### 上传相关

- `POST /api/v1/upload/multipart/init` - 初始化分片上传
- `POST /api/v1/upload/multipart/presigned-url` - 获取分片预签名URL
- `POST /api/v1/upload/multipart/complete` - 完成分片上传
- `POST /api/v1/upload/multipart/abort` - 取消上传
- `GET /api/v1/upload/multipart/status/:uploadId` - 查询上传状态

### 文件管理

- `GET /api/v1/files` - 文件列表
- `GET /api/v1/files/:fileId` - 文件详情
- `GET /api/v1/files/:fileId/download` - 下载文件
- `DELETE /api/v1/files/:fileId` - 删除文件
- `PATCH /api/v1/files/:fileId` - 更新文件
- `POST /api/v1/files/:fileId/access-url` - 生成访问URL

## 项目结构

```
src/
├── config/           # 配置管理
├── database/         # 数据库连接
├── models/           # 数据模型
├── services/         # 业务服务
├── controllers/      # 控制器
├── routes/           # 路由定义
├── middleware/       # 中间件
├── utils/            # 工具函数
├── jobs/             # 定时任务
└── index.ts          # 应用入口
```

## 许可证

ISC
