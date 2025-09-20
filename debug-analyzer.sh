#!/bin/bash

# React项目调试脚本
# 用于快速诊断项目中的常见问题

echo "🔍 React项目调试工具 v1.0"
echo "==============================="

# 检查环境
echo "📋 环境检查..."
check_environment() {
    echo "  ✓ 检查Node.js版本..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "    Node.js: $NODE_VERSION"
        
        # 检查版本是否满足要求 (>=16.0.0)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 16 ]; then
            echo "    ⚠️  警告: Node.js版本过低，建议升级到16.0.0以上"
        fi
    else
        echo "    ❌ Node.js未安装"
        return 1
    fi
    
    echo "  ✓ 检查包管理器..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "    npm: v$NPM_VERSION"
    else
        echo "    ❌ npm未找到"
    fi
    
    if command -v yarn &> /dev/null; then
        YARN_VERSION=$(yarn --version)
        echo "    yarn: v$YARN_VERSION"
    fi
    
    return 0
}

# 检查依赖
check_dependencies() {
    echo "📦 依赖检查..."
    
    if [ ! -f "package.json" ]; then
        echo "  ❌ package.json 未找到"
        return 1
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "  ⚠️  node_modules 目录不存在，需要安装依赖"
        echo "  💡 运行: npm install 或 yarn install"
        return 1
    fi
    
    # 检查关键依赖
    echo "  ✓ 检查关键依赖..."
    if [ -f "package.json" ]; then
        if grep -q '"react"' package.json; then
            REACT_VERSION=$(grep '"react"' package.json | cut -d'"' -f4)
            echo "    React: $REACT_VERSION"
        fi
        
        if grep -q '"vite"' package.json; then
            VITE_VERSION=$(grep '"vite"' package.json | cut -d'"' -f4)
            echo "    Vite: $VITE_VERSION"
        fi
    fi
    
    return 0
}

# 检查文件结构
check_file_structure() {
    echo "📁 文件结构检查..."
    
    # 检查入口文件
    if [ -f "src/main.jsx" ]; then
        echo "  ✓ 主入口文件: src/main.jsx"
    elif [ -f "src/main.tsx" ]; then
        echo "  ✓ 主入口文件: src/main.tsx"
    else
        echo "  ❌ 主入口文件未找到 (main.jsx/main.tsx)"
    fi
    
    # 检查App组件
    if [ -f "src/App.jsx" ]; then
        echo "  ✓ App组件: src/App.jsx"
    elif [ -f "src/App.tsx" ]; then
        echo "  ✓ App组件: src/App.tsx"
    else
        echo "  ❌ App组件未找到 (App.jsx/App.tsx)"
    fi
    
    # 检查index.html
    if [ -f "index.html" ]; then
        echo "  ✓ HTML模板: index.html"
    else
        echo "  ❌ index.html 未找到"
    fi
    
    # 检查配置文件
    echo "  ✓ 检查配置文件..."
    [ -f "vite.config.js" ] && echo "    ✓ vite.config.js"
    [ -f "vite.config.ts" ] && echo "    ✓ vite.config.ts"
    [ -f "tsconfig.json" ] && echo "    ✓ tsconfig.json"
    [ -f ".eslintrc.json" ] && echo "    ✓ .eslintrc.json"
    [ -f ".prettierrc" ] && echo "    ✓ .prettierrc"
    
    return 0
}

# 检查导入路径
check_import_paths() {
    echo "🔗 导入路径检查..."
    
    # 查找.js扩展名导入JSX文件的情况
    echo "  ✓ 检查扩展名不匹配..."
    if find src -name "*.jsx" -exec grep -l "import.*\.js['\"]" {} \; 2>/dev/null | head -5; then
        echo "    ⚠️  发现JSX文件中使用.js扩展名导入"
        echo "    💡 建议: 使用.jsx扩展名或配置模块解析"
    fi
    
    # 检查绝对路径导入
    echo "  ✓ 检查相对路径导入..."
    if find src -name "*.jsx" -o -name "*.js" | xargs grep -l "import.*\.\./\.\." 2>/dev/null | head -3; then
        echo "    ⚠️  发现深层相对路径导入"
        echo "    💡 建议: 配置路径别名"
    fi
    
    return 0
}

# 语法检查
syntax_check() {
    echo "🔍 语法检查..."
    
    if command -v node &> /dev/null; then
        # 简单的语法检查
        echo "  ✓ 检查JavaScript语法..."
        find src -name "*.js" -o -name "*.jsx" | while read file; do
            if ! node -c "$file" 2>/dev/null; then
                echo "    ❌ 语法错误: $file"
            fi
        done
        
        # TypeScript检查（如果存在）
        if [ -f "tsconfig.json" ] && command -v tsc &> /dev/null; then
            echo "  ✓ TypeScript检查..."
            if ! tsc --noEmit 2>/dev/null; then
                echo "    ⚠️  TypeScript检查发现问题"
            fi
        fi
    fi
    
    return 0
}

# 构建测试
build_test() {
    echo "🏗️  构建测试..."
    
    if [ -f "package.json" ] && command -v npm &> /dev/null; then
        echo "  ✓ 尝试构建..."
        if npm run build &> /dev/null; then
            echo "    ✅ 构建成功"
            return 0
        else
            echo "    ❌ 构建失败"
            echo "    💡 运行 'npm run build' 查看详细错误"
            return 1
        fi
    fi
    
    return 0
}

# 生成调试报告
generate_report() {
    echo ""
    echo "📊 调试报告总结"
    echo "==============================="
    
    REPORT_FILE="debug-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# React项目调试报告

**生成时间**: $(date)
**项目路径**: $(pwd)

## 环境信息
- Node.js: $(node --version 2>/dev/null || echo "未安装")
- npm: v$(npm --version 2>/dev/null || echo "未安装")

## 文件结构
\`\`\`
$(find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | head -20)
\`\`\`

## 配置文件状态
- vite.config.js: $([ -f "vite.config.js" ] && echo "✅" || echo "❌")
- tsconfig.json: $([ -f "tsconfig.json" ] && echo "✅" || echo "❌")
- .eslintrc.json: $([ -f ".eslintrc.json" ] && echo "✅" || echo "❌")
- .prettierrc: $([ -f ".prettierrc" ] && echo "✅" || echo "❌")

## 建议的解决步骤
1. 确保Node.js版本 >= 16.0.0
2. 运行 \`npm install\` 安装依赖
3. 检查导入路径的扩展名匹配
4. 运行 \`npm run dev\` 启动开发服务器
5. 运行 \`npm run build\` 测试构建

## 常见问题解决
- **模块解析问题**: 检查vite.config.js中的resolve配置
- **类型错误**: 检查tsconfig.json配置
- **构建失败**: 查看完整的构建日志

---
*本报告由调试脚本自动生成*
EOF
    
    echo "📄 调试报告已生成: $REPORT_FILE"
}

# 主执行流程
main() {
    check_environment
    check_dependencies
    check_file_structure
    check_import_paths
    syntax_check
    build_test
    generate_report
    
    echo ""
    echo "🎉 调试检查完成！"
    echo "💡 如需更详细的分析，请查看生成的调试报告"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在React项目根目录下运行此脚本"
    exit 1
fi

# 运行主程序
main