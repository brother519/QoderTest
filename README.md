# 博客系统

一个基于 Node.js + Express + React + SQLite 的简单博客系统，支持文章的增删改查（CRUD）操作。

## 技术栈

### 后端
- Node.js + Express
- SQLite (better-sqlite3)
- Joi (数据验证)
- CORS (跨域处理)

### 前端
- React 18
- React Router (路由管理)
- Axios (HTTP 客户端)
- React Hook Form (表单管理)
- Vite (构建工具)

## 项目结构

```
QoderTest/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 数据库配置和初始化
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   └── app.js          # Express 应用入口
│   ├── database/           # SQLite 数据库文件
│   └── package.json
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 调用服务
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── App.jsx        # 根组件
│   └── package.json
│
└── package.json           # 根目录配置
```

## 安装和运行

### 前置要求
- Node.js v18.x 或 v20.x
- npm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd QoderTest
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..

# 安装前端依赖
cd frontend
npm install
cd ..
```

3. **配置环境变量**
```bash
cd backend
cp .env.example .env
cd ..
```

4. **初始化数据库**
```bash
npm run init-db
```

5. **启动开发服务器**
```bash
npm run dev
```

### 访问应用
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api/v1

## 功能特性

- ✅ 文章列表展示（支持分页）
- ✅ 文章详情查看
- ✅ 创建新文章
- ✅ 编辑文章
- ✅ 删除文章
- ✅ 草稿/发布状态切换
- ✅ 表单验证（前端 + 后端）
- ✅ 错误处理和友好提示

## API 接口

### 基础路径
`/api/v1`

### 文章管理

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | /articles | 获取文章列表 | page, limit, status |
| GET | /articles/:id | 获取单篇文章 | - |
| POST | /articles | 创建文章 | title, content, author, status |
| PUT | /articles/:id | 更新文章 | title, content, author, status |
| DELETE | /articles/:id | 删除文章 | - |

## 开发说明

### 单独运行后端
```bash
cd backend
npm run dev
```

### 单独运行前端
```bash
cd frontend
npm run dev
```

### 重新初始化数据库
```bash
npm run init-db
```

## 项目特点

- 前后端分离架构
- RESTful API 设计
- 统一的错误处理
- 数据验证（前端 + 后端双重验证）
- 响应式设计
- 简洁的 UI 界面

## 许可证

MIT