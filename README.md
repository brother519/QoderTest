# 日志中央化平台

一个基于Elasticsearch的集中式日志收集和查询平台，支持HTTP/文件方式接收日志，提供实时查看和告警通知功能。

## 技术栈

- **后端**: Node.js + Express + Socket.IO
- **前端**: Vue 3 + Element Plus + Vite
- **存储**: Elasticsearch + Redis
- **通知**: Nodemailer (SMTP邮件)
- **部署**: Docker Compose

## 核心功能

- ✅ HTTP方式接收日志（JSON和纯文本格式）
- ✅ 按时间范围、服务名、级别搜索日志
- ✅ 实时查看日志流（WebSocket，类似tail -f）
- ✅ 告警规则配置，匹配错误模式后发送邮件
- ✅ Elasticsearch自动清理7天前的日志（ILM策略）
- ✅ Docker Compose一键启动所有服务

## 快速开始

### 1. 环境准备

确保已安装：
- Docker 20+
- Docker Compose 2+

### 2. 配置环境变量

```bash
cd docker
cp .env.example .env
```

编辑 `.env` 文件，填写SMTP邮件配置：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="日志平台 <your-email@gmail.com>"
```

### 3. 启动服务

```bash
cd docker
docker-compose up -d
```

等待所有服务启动（约1-2分钟）。

### 4. 初始化Elasticsearch

```bash
docker-compose exec backend node src/scripts/setup-es.js
```

### 5. 访问平台

- **前端界面**: http://localhost:8080
- **后端API**: http://localhost:3000
- **Elasticsearch**: http://localhost:9200

## 使用指南

### 发送日志到平台

#### HTTP API方式

**单条日志**：
```bash
curl -X POST http://localhost:3000/api/v1/logs/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "service": "user-service",
    "level": "error",
    "message": "Database connection failed",
    "metadata": {"host": "server-01"}
  }'
```

**批量日志**：
```bash
curl -X POST http://localhost:3000/api/v1/logs/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {"service": "auth-service", "level": "info", "message": "User logged in"},
      {"service": "auth-service", "level": "error", "message": "Login failed"}
    ]
  }'
```

#### 纯文本格式

支持常见日志格式，自动解析：
```bash
curl -X POST http://localhost:3000/api/v1/logs/ingest \
  -H "Content-Type: application/json" \
  -d '{"service": "app", "message": "[2026-01-09 10:30:00] ERROR: Connection timeout"}'
```

### 前端功能

#### 1. 日志搜索页面
- 按时间范围、服务名、日志级别、关键词搜索
- 分页浏览历史日志
- 支持全文搜索

#### 2. 实时日志页面
- 类似 `tail -f` 的实时日志流
- 按服务名、级别、关键词过滤
- 自动滚动显示最新日志
- 最多显示1000条（超过自动删除旧日志）

#### 3. 告警规则管理
- 创建自定义告警规则
- 支持正则表达式匹配消息模式
- 设置阈值和时间窗口（如"5分钟内出现3次错误"）
- 匹配后发送邮件通知

## 项目结构

```
.
├── backend/                 # Node.js后端
│   ├── src/
│   │   ├── server.js        # Express应用入口
│   │   ├── config/          # ES/Redis配置
│   │   ├── services/        # 核心业务逻辑
│   │   │   ├── logParser.service.js       # 日志解析
│   │   │   ├── elasticsearch.service.js   # ES查询
│   │   │   ├── alertMatcher.service.js    # 告警匹配
│   │   │   └── email.service.js           # 邮件发送
│   │   ├── websocket/       # WebSocket服务
│   │   ├── routes/          # API路由
│   │   └── scripts/         # 初始化脚本
│   └── package.json
├── frontend/                # Vue.js前端
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── services/        # API/WebSocket封装
│   │   └── router/          # 路由配置
│   └── package.json
├── docker/
│   ├── docker-compose.yml   # Docker编排
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
└── elasticsearch/
    ├── index-templates/     # ES索引模板
    └── ilm-policies/        # 7天清理策略
```

## API文档

### 日志接收

**POST /api/v1/logs/ingest**
- 接收单条日志
- 请求体: `{ service, level, message, metadata }`
- 响应: `{ status, log_id }`

**POST /api/v1/logs/ingest/batch**
- 批量接收日志（最多1000条）
- 请求体: `{ logs: [...] }`

### 日志查询

**GET /api/v1/logs/search**
- 查询参数: `from`, `to`, `service`, `level`, `query`, `page`, `size`
- 响应: `{ total, logs[], page, size }`

**GET /api/v1/logs/stats**
- 日志统计数据（按时间分组、级别分布、服务排名）

### 告警规则

**GET /api/v1/alerts/rules** - 获取所有规则  
**POST /api/v1/alerts/rules** - 创建规则  
**PUT /api/v1/alerts/rules/:id** - 更新规则  
**DELETE /api/v1/alerts/rules/:id** - 删除规则

## 测试

生成测试日志数据：

```bash
cd scripts
npm install axios
node test-log-ingest.js
```

这将发送100条随机测试日志到平台。

## 故障排查

### 查看服务日志

```bash
docker-compose logs -f backend
docker-compose logs -f elasticsearch
```

### 检查Elasticsearch健康状态

```bash
curl http://localhost:9200/_cluster/health
```

### 重启服务

```bash
docker-compose restart backend
```

## 高级配置

### 修改日志保留天数

编辑 `elasticsearch/ilm-policies/logs-retention.json`：

```json
{
  "policy": {
    "phases": {
      "delete": {
        "min_age": "7d"   // 改为其他天数
      }
    }
  }
}
```

重新运行初始化脚本应用更改。

### 扩展后端实例

```bash
docker-compose up -d --scale backend=3
```

## 开发指南

### 本地开发

**后端**：
```bash
cd backend
npm install
cp .env.example .env
# 编辑.env填写配置
npm run dev
```

**前端**：
```bash
cd frontend
npm install
npm run dev
```

### 添加新的日志格式解析

编辑 `backend/src/services/logParser.service.js` 的 `parseTextLog` 方法，添加正则表达式匹配。

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

---

**作者**: 小白  
**项目创建时间**: 2026-01-09
