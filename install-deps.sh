#!/bin/bash

# 任务管理系统依赖安装脚本
# 此脚本需要在有Node.js环境的机器上运行

echo "开始安装任务管理系统依赖..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js (版本 >= 16.0.0)"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ 发现Node.js版本: $NODE_VERSION"

# 检查npm版本
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ 发现npm版本: $NPM_VERSION"

echo ""
echo "开始安装依赖包..."

# 安装核心React依赖
echo "📦 安装React和相关核心包..."
npm install react@^18.2.0 react-dom@^18.2.0

# 安装Material-UI组件库
echo "📦 安装Material-UI组件库..."
npm install @mui/material@^5.15.0 @emotion/react@^11.11.0 @emotion/styled@^11.11.0

# 安装Material-UI图标库
echo "📦 安装Material-UI图标库..."
npm install @mui/icons-material@^5.15.0

# 安装日期选择器组件
echo "📦 安装日期选择器组件..."
npm install @mui/x-date-pickers@^6.18.0

# 安装日期处理库
echo "📦 安装日期处理库..."
npm install date-fns@^2.30.0

# 安装路由库（预留）
echo "📦 安装React Router..."
npm install react-router-dom@^6.20.0

# 安装开发依赖
echo "📦 安装TypeScript和开发工具..."
npm install --save-dev @types/react@^18.2.43 @types/react-dom@^18.2.17
npm install --save-dev @typescript-eslint/eslint-plugin@^6.14.0 @typescript-eslint/parser@^6.14.0
npm install --save-dev @vitejs/plugin-react@^4.2.1
npm install --save-dev eslint@^8.55.0 eslint-plugin-react-hooks@^4.6.0 eslint-plugin-react-refresh@^0.4.5
npm install --save-dev typescript@^5.2.2 vite@^5.0.8

echo ""
echo "✅ 所有依赖安装完成！"
echo ""
echo "🚀 现在可以运行以下命令启动项目："
echo "   npm run dev     # 启动开发服务器"
echo "   npm run build   # 构建生产版本"
echo "   npm run preview # 预览生产版本"
echo ""
echo "📖 更多信息请查看 README.md 和 SETUP.md"