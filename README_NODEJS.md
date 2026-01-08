# 羊了个羊游戏 - Node.js版本

## 后端服务

### 安装依赖

```bash
cd backend
npm install
```

### 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将运行在 `http://localhost:3000`

### API 接口

#### 关卡 API
- `GET /api/levels` - 获取所有关卡列表
- `GET /api/levels/:levelId` - 获取特定关卡详情

#### 游戏 API
- `POST /api/game/start` - 开始新游戏
- `POST /api/game/:sessionId/click` - 点击卡片
- `GET /api/game/:sessionId/state` - 获取游戏状态
- `POST /api/game/:sessionId/restart` - 重新开始游戏

### 目录结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   └── app.js           # Express应用
├── package.json
└── server.js            # 服务器入口
```

## 前端应用

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

直接在浏览器中打开 `frontend/public/index.html`

或使用本地服务器：
```bash
cd frontend/public
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`

### 配置 API 地址

在 `frontend/src/api/client.js` 中配置后端 API 地址：

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 完整启动流程

1. 启动后端服务（端口 3000）：
```bash
cd backend
npm install
npm run dev
```

2. 启动前端（端口 8080）：
```bash
cd frontend/public
python3 -m http.server 8080
```

3. 在浏览器访问：`http://localhost:8080`

## 关卡系统

游戏包含5个关卡：
1. **新手教程** - 简单模式（6种类型，54张卡片，3层）
2. **渐入佳境** - 普通模式（8种类型，72张卡片，4层）
3. **高手之路** - 困难模式（10种类型，90张卡片，5层）
4. **大师级别** - 专家模式（12种类型，108张卡片，6层）
5. **终极挑战** - 极限难度（12种类型，144张卡片，7层）

关卡采用线性解锁机制，完成前一关卡后解锁下一关卡。

## 技术栈

### 后端
- Node.js + Express
- 内存存储（Map）
- UUID 会话管理
- 速率限制
- CORS 支持

### 前端
- Vanilla JavaScript
- Axios（HTTP客户端）
- 原有CSS动画

## 开发说明

### 后端核心文件
- `services/game-logic.service.js` - 游戏逻辑（卡片生成、遮挡判定、消除）
- `services/state-manager.service.js` - 状态管理
- `controllers/game.controller.js` - API控制器
- `config/levels.config.js` - 关卡配置

### 前端核心文件
- `api/game-api.js` - 游戏API封装
- `components/GameBoard.js` - 游戏板组件
- `services/animator.js` - 动画控制
- `main.js` - 应用入口
