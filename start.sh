#!/bin/bash

# 坦克大战游戏启动脚本

echo "=========================================="
echo "      坦克大战 - Battle City"
echo "=========================================="
echo ""

# 检查是否安装了Node.js
if command -v node &> /dev/null; then
    echo "✓ 检测到 Node.js"
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        echo "正在安装依赖..."
        npm install
    fi
    
    echo "正在启动开发服务器..."
    npm run dev
    
elif command -v python3 &> /dev/null; then
    echo "✓ 检测到 Python 3"
    echo "正在启动 HTTP 服务器..."
    echo "请在浏览器中访问: http://localhost:8080"
    echo ""
    python3 -m http.server 8080
    
elif command -v python &> /dev/null; then
    echo "✓ 检测到 Python 2"
    echo "正在启动 HTTP 服务器..."
    echo "请在浏览器中访问: http://localhost:8080"
    echo ""
    python -m SimpleHTTPServer 8080
    
else
    echo "❌ 未检测到 Node.js 或 Python"
    echo ""
    echo "请安装以下工具之一:"
    echo "1. Node.js (推荐): https://nodejs.org/"
    echo "2. Python: https://www.python.org/"
    echo ""
    echo "或者直接使用支持ES6模块的浏览器打开 index.html"
    exit 1
fi
