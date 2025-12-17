# QoderTest - 用户认证系统

基于 Node.js + Express + SQLite 的生产级用户认证系统，支持 JWT 令牌认证、OAuth 第三方登录和双因素认证(2FA)。

## 功能特性

✅ **完整的认证体系**
- JWT Access Token + Refresh Token 机制
- OAuth 第三方登录（GitHub/Google）
- 双因素认证（TOTP）
- 邮箱验证

✅ **严格的安全措施**
- bcrypt 密码哈希（12轮）
- 防暴力破解（速率限制）
- Token 加密存储
- CSRF/XSS 防护
- 敏感信息脱敏日志

✅ **生产级架构**
- 三层架构（路由-控制器-服务）
- Sequelize ORM
- Winston 日志系统
- 完善的错误处理

## 技术栈

- **后端框架**: Express.js
- **数据库**: SQLite + Sequelize ORM
- **认证**: JWT + Passport
- **安全**: Helmet, XSS-Clean, HPP, Rate Limit
- **日志**: Winston
- **验证**: Express-Validator

## 快速开始

### 前置要求

**重要**: 本项目需要 Node.js 运行时环境。当前系统未检测到 Node.js，请先安装：

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置以下关键变量：

```bash
JWT_ACCESS_SECRET=生成的随机密钥
JWT_REFRESH_SECRET=生成的随机密钥
ENCRYPTION_KEY=生成的64字符十六进制密钥

GITHUB_CLIENT_ID=你的GitHub应用ID
GITHUB_CLIENT_SECRET=你的GitHub应用密钥

GOOGLE_CLIENT_ID=你的Google应用ID
GOOGLE_CLIENT_SECRET=你的Google应用密钥
```

生成密钥命令：
```bash
openssl rand -base64 32
openssl rand -hex 32
```

### 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

## API 端点

### 认证端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| POST | `/api/auth/logout` | 用户登出 | 是 |
| POST | `/api/auth/refresh` | 刷新Token | Refresh Token |
| GET | `/api/auth/verify-email/:token` | 验证邮箱 | 否 |

### 用户管理端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/users/me` | 获取个人信息 | 是 |
| PATCH | `/api/users/me` | 更新个人信息 | 是 |
| POST | `/api/users/me/change-password` | 修改密码 | 是 |

### 使用示例

**注册**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "username": "johndoe"
  }'
```

**登录**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**获取个人信息**:
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 项目结构

```
QoderTest/
├── src/
│   ├── config/           # 配置文件（数据库、安全、OAuth）
│   ├── models/           # Sequelize 数据模型
│   ├── middlewares/      # 中间件（认证、验证、速率限制）
│   ├── controllers/      # 控制器（处理请求）
│   ├── services/         # 业务逻辑层
│   ├── routes/           # 路由定义
│   ├── utils/            # 工具函数（日志、加密、错误）
│   ├── app.js            # Express 应用配置
│   └── server.js         # 服务器启动入口
├── database/             # SQLite 数据库文件
├── logs/                 # 日志文件
├── tests/                # 测试文件
├── .env                  # 环境变量（不提交到 Git）
├── .env.example          # 环境变量模板
└── package.json          # 项目依赖
```

## 数据库设计

系统包含以下数据表：

- **users** - 用户主表
- **oauth_accounts** - OAuth 账号关联
- **two_factor_auth** - 2FA 配置
- **refresh_tokens** - 刷新令牌管理
- **login_attempts** - 登录尝试记录（防暴力破解）
- **email_verifications** - 邮箱验证令牌

## 安全特性

1. **密码安全**
   - bcrypt 哈希（12 轮）
   - 密码复杂度验证

2. **Token 安全**
   - Access Token: 15分钟过期
   - Refresh Token: 30天过期，存储在 httpOnly Cookie
   - Token 轮换机制

3. **防暴力破解**
   - 邮箱限制：5次/5分钟
   - IP限制：20次/小时
   - 渐进式延迟

4. **数据加密**
   - 2FA Secret 使用 AES-256-GCM 加密
   - 恢复码使用 bcrypt 哈希

## 开发指南

### 测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
```

## 部署检查清单

- [ ] 更换所有密钥为强随机值
- [ ] 启用 HTTPS（设置 `COOKIE_SECURE=true`）
- [ ] 配置 CORS 白名单
- [ ] 设置 `NODE_ENV=production`
- [ ] 配置真实的 SMTP 邮件服务
- [ ] 配置 OAuth 回调 URL
- [ ] 设置日志持久化
- [ ] 配置数据库备份策略

## 许可证

ISC

## 联系方式

如有问题或建议，请联系项目维护者。
