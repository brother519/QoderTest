# 商品售卖系统

一个基于React + Vite构建的现代化商品售卖页面系统，集成了完整的电商功能。

## 🚀 功能特性

### 核心功能
- **商品展示** - 商品详情、图片轮播、规格选择
- **购物车管理** - 添加商品、数量调节、价格计算
- **用户系统** - 用户信息、快捷操作、个性化体验
- **评论系统** - 用户评价、评分统计、筛选排序
- **搜索功能** - 关键词搜索、筛选器、排序
- **支付系统** - 多种支付方式、安全验证
- **地址管理** - 收货地址、默认地址设置

### 技术特性
- **响应式设计** - 支持移动端、平板、桌面
- **状态管理** - 使用Zustand进行全局状态管理
- **数据持久化** - 购物车和用户信息本地存储
- **组件化架构** - 可复用的React组件
- **现代UI** - Tailwind CSS样式框架

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **状态管理**: Zustand
- **路由**: React Router DOM
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **开发语言**: JavaScript/JSX

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ShoppingCart/    # 购物车组件
│   ├── ProductDisplay/  # 商品展示组件
│   ├── CommentList/     # 评论列表组件
│   ├── UserCard/        # 用户信息卡片
│   ├── Payment/         # 支付组件
│   ├── AddressSelector/ # 地址选择器
│   └── SearchResultList/# 搜索结果列表
├── store/               # 状态管理
│   ├── productStore.js  # 商品状态
│   ├── cartStore.js     # 购物车状态
│   ├── userStore.js     # 用户状态
│   ├── addressStore.js  # 地址状态
│   ├── paymentStore.js  # 支付状态
│   └── commentStore.js  # 评论状态
├── pages/               # 页面组件
│   └── HomePage.jsx     # 主页
├── data/                # 模拟数据
│   └── mockData.js      # Mock数据
├── types/               # 类型定义
│   └── index.js         # 数据模型
├── utils/               # 工具函数
├── hooks/               # 自定义Hooks
└── api/                 # API服务层
```

## 🎯 核心组件说明

### ShoppingCart (购物车组件)
- 侧边栏式购物车界面
- 商品数量调节
- 实时价格计算
- 支持商品规格选择
- 本地存储数据持久化

### ProductDisplay (商品展示组件)
- 商品图片轮播
- 详细信息展示
- 规格选择器
- 库存显示
- 评分和标签

### CommentList (评论列表组件)
- 评论展示和筛选
- 评分统计
- 排序功能
- 分页加载
- 点赞互动

### UserCard (用户信息卡片)
- 用户头像和基本信息
- 会员等级显示
- 快捷操作菜单
- 统计数据展示

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm或yarn包管理器

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```