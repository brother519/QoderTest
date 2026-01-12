# QoderTest

## Email Service

一个功能完整的邮件服务系统，支持事务性邮件和营销邮件的发送、追踪和管理。

### 功能特性

- **模板系统**: 支持变量替换的邮件模板 (`{{name}}`, `{{user.email}}`)
- **发送功能**: 支持单封和批量邮件发送
- **队列处理**: 使用 BullMQ 进行邮件入队和批量处理
- **追踪系统**: 追踪邮件打开率和点击率
- **退信处理**: 自动处理硬退信和软退信
- **退订管理**: 营销邮件自动添加退订链接
- **故障转移**: SendGrid 主提供商 + AWS SES 备用
- **统计分析**: 发送率、退信率、投递统计

### 快速开始

```bash
cd email-service

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 启动数据库和 Redis
docker-compose up -d

# 生成 Prisma 客户端并迁移数据库
npm run db:generate
npm run db:migrate

# 开发模式运行
npm run dev

# 另一个终端启动 Worker
npm run worker
```

### API 端点

详见 `email-service/` 目录