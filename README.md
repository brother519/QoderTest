# 🏪 商品后台管理系统

这是一个功能完备的现代化商品后台管理系统，集成了多种先进的前端技术和组件。

## ✨ 功能特点

### 🔄 拖拽排序 (Drag and Drop)
- 直观的商品排序管理
- 支持拖拽重新排列商品位置
- 实时视觉反馈
- 提升用户体验

### ⚡ 虚拟滚动 (Virtual Scroll)
- 高性能展示大量商品数据（支持10万+条记录）
- 只渲染可见部分，大幅提升性能
- 支持实时搜索和过滤
- 内存占用优化

### 📱 无限滚动 (Infinite Scroll)
- 滚动到底部自动加载更多内容
- 无缝浏览体验
- 智能预加载机制
- 加载状态指示

### 🔐 验证码输入 (Captcha Input)
- 防止自动化程序滥用
- 可配置验证码长度和字符类型
- 视觉干扰处理
- 多重安全保护

### 💻 代码编辑器 (Code Editor)
- 功能强大的在线代码编辑器
- 支持多种编程语言（JavaScript、CSS、HTML、JSON）
- 语法高亮和代码提示
- 实时代码执行和预览
- 内置商品管理代码模板

### 🎨 水印功能 (Watermark)
- 为商品图片添加版权保护
- 自定义水印文字、样式和透明度
- 支持角度调整和间距设置
- 批量图片处理
- 高质量图片输出

### 📱 二维码生成 (QR Code)
- 快速生成商品二维码
- 多种预设模板（商品链接、店铺主页、联系方式等）
- 支持自定义内容
- 高清图片下载
- 一键分享功能

## 🏗️ 技术架构

### 前端框架
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **CSS3** - 现代化样式设计

### 核心依赖
- **react-beautiful-dnd** - 拖拽排序功能
- **react-window** - 虚拟滚动实现
- **monaco-editor** - 代码编辑器
- **qrcode** - 二维码生成
- **html2canvas** - 图片处理
- **antd** - UI组件库

## 📁 项目结构

```
src/
├── components/
│   ├── ProductManagement.tsx    # 主管理页面
│   ├── DragDropList.tsx         # 拖拽排序组件
│   ├── VirtualScroll.tsx        # 虚拟滚动组件
│   ├── InfiniteScroll.tsx       # 无限滚动组件
│   ├── CaptchaInput.tsx         # 验证码组件
│   ├── CodeEditor.tsx           # 代码编辑器组件
│   ├── Watermark.tsx            # 水印组件
│   ├── QRCodeGenerator.tsx      # 二维码生成组件
│   └── *.css                    # 对应样式文件
├── App.tsx                      # 主应用入口
├── App.css                      # 主应用样式
├── index.tsx                    # React入口
└── index.css                    # 全局样式
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm start
# 或
yarn start
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 🎯 使用指南

### 集成模式
系统提供完整的商品管理界面，包含：
- 系统概览仪表板
- 侧边栏导航
- 用户登录验证
- 各功能模块集成

### 组件模式
可以单独使用各个功能组件：
- 每个组件都是独立的
- 可以轻松集成到其他项目
- 支持自定义配置

## 🔧 自定义配置

### 主题定制
修改CSS变量来自定义主题色彩：
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #e74c3c;
}
```

### 数据源配置
各组件支持自定义数据源：
- API接口配置
- 本地数据模拟
- 实时数据同步

## 📊 性能优化

- **代码分割**: 使用React.lazy进行组件懒加载
- **内存优化**: 虚拟滚动减少DOM节点
- **图片优化**: 懒加载和压缩处理
- **缓存策略**: 合理的数据缓存机制

## 🌐 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- IE 11+

## 📱 响应式设计

- 完全响应式布局
- 移动端友好
- 平板设备优化
- 触摸操作支持

## 🔒 安全特性

- XSS防护
- CSRF保护
- 输入验证
- 权限控制

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- 项目问题: [GitHub Issues](https://github.com/your-repo/issues)
- 功能建议: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Made with ❤️ by Qoder Team**