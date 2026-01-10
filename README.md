# 文件存储服务

企业级文件存储服务，支持大文件上传、云存储直传、访问控制、缩略图生成和用量统计。

## 功能特性

- ✅ 分片上传和断点续传
- ✅ 自动验证文件类型（MIME检测）
- ✅ 图片自动生成缩略图
- ✅ CDN集成实现快速分发
- ✅ 访问控制（公开/私密/签名URL）
- ✅ S3直传支持
- ✅ 上传进度追踪
- ✅ 文件夹组织
- ✅ 临时文件自动过期
- ✅ 带宽和存储用量统计

## 技术栈

- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL
- **缓存/队列**: Redis + Bull
- **对象存储**: AWS S3（兼容MinIO）
- **认证**: JWT Token
- **API文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- Docker & Docker Compose（用于本地开发环境）
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动本地开发环境

```bash
# 启动PostgreSQL + Redis + MinIO
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 访问服务

- **MinIO控制台**: http://localhost:9001 (minioadmin / minioadmin)
- **PostgreSQL**: localhost:5432 (postgres / postgres_dev_password)
- **Redis**: localhost:6379

### 运行应用

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

应用将在 http://localhost:3000 启动

- API地址: http://localhost:3000/api
- 健康检查: http://localhost:3000/health
- API文档: http://localhost:3000/api-docs

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 测试覆盖率
npm run test:coverage
```

## 项目结构

```
src/
├── config/              # 配置管理（数据库、S3、Redis等）
├── middleware/          # Express中间件（认证、验证、错误处理）
├── routes/              # API路由定义
├── controllers/         # 请求处理控制器
├── services/            # 业务逻辑层
├── repositories/        # 数据访问层
├── models/              # TypeORM实体模型
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── workers/             # 后台任务（缩略图、清理、统计）
├── migrations/          # 数据库迁移脚本
├── app.ts               # Express应用配置
└── server.ts            # 服务器入口
```

## API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 文件上传
- `POST /api/upload/initiate` - 初始化分片上传
- `POST /api/upload/chunk/:sessionId` - 上传分片
- `POST /api/upload/complete/:sessionId` - 完成上传
- `GET /api/upload/progress/:sessionId` - 查询进度
- `DELETE /api/upload/abort/:sessionId` - 中止上传

### 文件管理
- `GET /api/files` - 列出文件（支持分页、筛选）
- `GET /api/files/:id` - 获取文件详情
- `GET /api/files/:id/download` - 下载文件
- `GET /api/files/:id/signed-url` - 生成签名URL
- `GET /api/files/:id/thumbnail` - 获取缩略图
- `DELETE /api/files/:id` - 删除文件

### 统计
- `GET /api/stats/storage` - 存储用量统计
- `GET /api/stats/bandwidth` - 带宽用量统计
- `GET /api/stats/overview` - 总览

## 环境变量

关键环境变量配置（详见 `.env.development` 和 `.env.production.example`）：

```env
# 服务器
NODE_ENV=development
PORT=3000

# 数据库
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=file_storage

# S3配置
S3_ENDPOINT=http://localhost:9000  # MinIO本地开发
S3_BUCKET=file-storage
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# JWT
JWT_SECRET=your-secret-key

# 上传配置
MAX_FILE_SIZE=5368709120  # 5GB
CHUNK_SIZE=10485760       # 10MB
```

## 数据库迁移

```bash
# 生成迁移文件
npm run migration:generate -- src/migrations/MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 代码质量

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t file-storage-service .

# 运行容器
docker run -p 3000:3000 --env-file .env.production file-storage-service
```

### 生产环境注意事项

1. **环境变量**: 使用 `.env.production.example` 作为模板
2. **数据库**: 配置RDS PostgreSQL连接
3. **Redis**: 配置ElastiCache连接
4. **S3**: 配置真实的AWS S3 bucket
5. **JWT密钥**: 使用强随机密钥
6. **速率限制**: 调整为生产环境值
7. **Swagger**: 建议禁用或添加认证

## 开发计划

当前进度：Phase 1 完成 ✅

- [x] Phase 1: 项目初始化和基础架构
- [ ] Phase 2: 数据库和认证模块
- [ ] Phase 3: S3存储集成
- [ ] Phase 4: 分片上传和断点续传
- [ ] Phase 5: 访问控制
- [ ] Phase 6: 媒体处理和缩略图
- [ ] Phase 7: 统计和用量追踪
- [ ] Phase 8: 临时文件清理
- [ ] Phase 9: Swagger API文档
- [ ] Phase 10: 文件夹组织功能
- [ ] Phase 11: S3直传功能
- [ ] Phase 12: 完整测试套件
- [ ] Phase 13: 文档和部署准备

详细实施计划请参考：`/data/.qoder/cli/specs/spec-20260110060436.md`

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！
