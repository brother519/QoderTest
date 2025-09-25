# 商品售卖系统 - 调试工具配置指南

## 开发工具配置

### 1. React Developer Tools
- 在Chrome/Firefox中安装React DevTools扩展
- 访问 http://localhost:3000 
- 按F12打开开发者工具
- 切换到 "Components" 和 "Profiler" 标签页

### 2. Zustand DevTools
- 状态管理已集成了DevTools支持
- 在Redux DevTools扩展中可以查看状态变更

### 3. 调试命令
```bash
# 开发模式启动（已在运行）
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm run test
```

### 4. 常用调试技巧
- 使用浏览器Console查看日志
- 使用Network面板监控API请求
- 使用React DevTools检查组件状态
- 使用Performance面板分析性能

### 5. 服务器状态
- 开发服务器运行在: http://localhost:3000
- 热重载功能已启用
- 状态管理工作正常
- 所有核心组件功能完整

## 应用架构
```
src/
├── components/     # 组件库
├── pages/         # 页面
├── store/         # Zustand状态管理
├── data/          # 模拟数据
└── types/         # 类型定义
```