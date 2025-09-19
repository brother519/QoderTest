# 任务管理系统

一个基于 React + TypeScript + Material-UI 的现代化任务管理应用。

## 功能特性

### 🎯 核心功能
- **任务创建**：支持富文本标题、描述、多人负责、优先级设置、截止日期
- **任务查看**：直观的卡片式布局，显示关键信息和状态
- **任务编辑**：可编辑负责人和优先级，保持数据一致性
- **任务管理**：支持删除、归档、取消归档操作，二次确认防误操作

### 🔍 智能筛选
- **关键词搜索**：支持任务标题和描述的实时搜索（防抖优化）
- **状态筛选**：按待开始、进行中、已完成、已归档等状态筛选
- **优先级筛选**：按高、中、低优先级筛选
- **负责人筛选**：按负责人多选筛选
- **组合筛选**：支持多个条件同时生效

### 🎨 用户体验
- **响应式设计**：适配桌面端和移动端
- **Material Design**：现代化的视觉设计语言
- **交互反馈**：加载状态、错误提示、成功反馈
- **悬浮操作**：任务卡片悬浮显示操作菜单
- **模态框操作**：流畅的创建、编辑、详情查看体验

## 技术栈

### 前端框架
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的构建工具

### UI组件库
- **Material-UI (MUI)** - Google Material Design组件库
- **@mui/x-date-pickers** - 日期选择器组件
- **@mui/icons-material** - Material Design图标库

### 状态管理
- **React Context + useReducer** - 轻量级状态管理方案

### 工具库
- **date-fns** - 现代化日期处理库
- **zhCN locale** - 中文本地化支持

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── TaskFilterPanel/ # 任务筛选面板
│   ├── TaskList/        # 任务列表
│   ├── TaskCard/        # 任务卡片
│   ├── CreateTaskModal/ # 创建任务模态框
│   ├── TaskDetailModal/ # 任务详情模态框
│   └── ConfirmModal/    # 确认对话框
├── contexts/            # React Context
│   └── AppContext.tsx   # 全局状态管理
├── pages/               # 页面组件
│   └── TaskManagementPage.tsx # 任务管理主页面
├── services/            # API服务层
│   └── taskService.ts   # 任务相关API（模拟）
├── types/               # TypeScript类型定义
│   └── index.ts         # 通用类型和接口
├── utils/               # 工具函数
│   └── index.ts         # 验证、日期、任务工具函数
└── App.tsx              # 应用根组件
```

这是一个生产就绪的任务管理系统，代码结构清晰，功能完整，用户体验优秀。