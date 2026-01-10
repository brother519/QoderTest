# 短链接服务

一个功能完整的短链接服务，支持短链生成、点击追踪、统计分析和Web仪表板。

## 功能特性

- 生成短代码（Base62编码，支持随机生成或自定义）
- 追踪点击数及时间戳、地理位置、设备信息
- 为每个链接生成二维码
- 可选链接过期时间
- 支持自定义域名
- RESTful API供程序化访问
- Web仪表板显示热门链接和流量模式
- Redis缓存处理高流量

## 技术栈

- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL
- **缓存**: Redis
- **部署**: Docker + Docker Compose
- **前端**: HTML/CSS/JavaScript + Chart.js

## 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+

### 使用Docker启动（推荐）

1. 克隆项目并进入目录：
```bash
cd QoderTest
```

2. 复制环境变量配置：
```bash
cp .env.example .env
```

3. 启动所有服务：
```bash
docker-compose up -d --build
```

4. 查看日志：
```bash
docker-compose logs -f app
```

5. 访问服务：
   - API: http://localhost:3000/api
   - 仪表板: http://localhost:3000/dashboard
   - 健康检查: http://localhost:3000/health

### 本地开发

如果需要本地开发（不使用Docker），请确保已安装：
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 修改 .env 文件中的数据库和Redis连接信息

# 初始化数据库
psql -U postgres -c "CREATE DATABASE shortlink;"
psql -U postgres -d shortlink -f db/migrations/001_create_urls.sql
psql -U postgres -d shortlink -f db/migrations/002_create_clicks.sql
psql -U postgres -d shortlink -f db/migrations/003_create_indexes.sql

# 启动开发服务器
npm run dev
```

## API文档

### 创建短链接
```
POST /api/urls
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "customCode": "mycode",  // 可选
  "expiresIn": 86400       // 可选，过期时间（秒）
}

响应:
{
  "success": true,
  "data": {
    "shortCode": "mycode",
    "shortUrl": "http://localhost:3000/mycode",
    "originalUrl": "https://example.com/very/long/url",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### 获取短链接详情
```
GET /api/urls/:shortCode

响应:
{
  "success": true,
  "data": {
    "shortCode": "mycode",
    "originalUrl": "https://example.com/very/long/url",
    "clickCount": 123,
    "createdAt": "2026-01-10T10:00:00Z"
  }
}
```

### 重定向
```
GET /:shortCode

响应: 302 重定向到原始URL
```

### 获取统计数据
```
GET /api/urls/:shortCode/analytics?period=7d

响应:
{
  "success": true,
  "data": {
    "totalClicks": 123,
    "clicksByDate": [...],
    "topCountries": [...],
    "deviceBreakdown": {...}
  }
}
```

### 获取热门链接
```
GET /api/urls/top?limit=10&period=7d

响应:
{
  "success": true,
  "data": [...]
}
```

## 项目结构

```
QoderTest/
├── src/
│   ├── config/           # 配置管理
│   ├── controllers/      # 控制器
│   ├── services/         # 业务逻辑
│   ├── models/           # 数据模型
│   ├── repositories/     # 数据访问层
│   ├── routes/           # 路由定义
│   ├── middlewares/      # 中间件
│   └── utils/            # 工具函数
├── public/               # 静态文件（仪表板）
├── db/migrations/        # 数据库迁移
├── docker-compose.yml    # Docker编排
└── Dockerfile            # 应用容器
```

## 环境变量

关键环境变量说明（见 `.env.example`）：

- `PORT`: 应用端口（默认3000）
- `DATABASE_URL`: PostgreSQL连接字符串
- `REDIS_URL`: Redis连接字符串
- `BASE_URL`: 短链接的基础URL
- `CACHE_TTL_SHORT_URL`: 短链接缓存时间（秒）
- `RATE_LIMIT_CREATE`: 创建短链接速率限制（次/分钟）

## Docker命令

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart app

# 进入应用容器
docker-compose exec app sh

# 备份数据库
docker-compose exec postgres pg_dump -U shortlink shortlink > backup.sql

# 恢复数据库
cat backup.sql | docker-compose exec -T postgres psql -U shortlink shortlink
```

## 性能指标

- **重定向QPS**: 5000+（Redis缓存命中率>90%）
- **API响应时间**: <100ms（P95）
- **缓存命中率**: >90%

## 安全特性

- 输入验证和URL黑名单检测
- 速率限制防止滥用
- SQL注入防护（参数化查询）
- XSS防护和CSP头
- 缓存穿透防护
- HTTPS支持

## 开发者

小白 - 程序员，爱好读书

## 许可证

MIT License
