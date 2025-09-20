#!/usr/bin/env node

/**
 * React项目代码质量检查器
 * 自动分析项目中的潜在问题和改进建议
 */

const fs = require('fs');
const path = require('path');

class ReactProjectAnalyzer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.issues = [];
    this.suggestions = [];
  }

  // 分析入口点
  analyzeEntryPoints() {
    console.log('🔍 分析入口点...');
    
    const mainFiles = ['src/main.jsx', 'src/main.tsx', 'src/index.jsx', 'src/index.tsx'];
    const appFiles = ['src/App.jsx', 'src/App.tsx'];
    
    const foundMainFiles = mainFiles.filter(file => 
      fs.existsSync(path.join(this.projectPath, file))
    );
    
    const foundAppFiles = appFiles.filter(file => 
      fs.existsSync(path.join(this.projectPath, file))
    );
    
    if (foundMainFiles.length === 0) {
      this.issues.push({
        type: 'error',
        category: '入口点',
        message: '未找到主入口文件 (main.jsx/tsx 或 index.jsx/tsx)',
        solution: '创建 src/main.jsx 作为应用入口点'
      });
    } else if (foundMainFiles.length > 1) {
      this.issues.push({
        type: 'warning',
        category: '入口点',
        message: `发现多个入口文件: ${foundMainFiles.join(', ')}`,
        solution: '确保只有一个主入口文件被使用'
      });
    }
    
    if (foundAppFiles.length === 0) {
      this.issues.push({
        type: 'error',
        category: '组件',
        message: '未找到App组件文件',
        solution: '创建 src/App.jsx 作为根组件'
      });
    } else if (foundAppFiles.length > 1) {
      this.issues.push({
        type: 'warning',
        category: '组件',
        message: `发现多个App组件: ${foundAppFiles.join(', ')}`,
        solution: '确保只有一个App组件被使用'
      });
    }
  }

  // 分析导入路径
  analyzeImportPaths() {
    console.log('🔗 分析导入路径...');
    
    const findFiles = (dir, extensions) => {
      const files = [];
      if (!fs.existsSync(dir)) return files;
      
      const scan = (currentDir) => {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      };
      
      scan(dir);
      return files;
    };
    
    const jsxFiles = findFiles(path.join(this.projectPath, 'src'), ['.jsx', '.js']);
    const importIssues = [];
    
    jsxFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // 检查.js扩展名导入JSX文件
          if (line.includes('import') && line.includes('.js\'') || line.includes('.js"')) {
            const match = line.match(/from\s+['"](.+\.js)['"]/);
            if (match) {
              const importPath = match[1];
              // 检查是否实际上是JSX文件
              const possibleJsxPath = importPath.replace('.js', '.jsx');
              const fullImportPath = path.resolve(path.dirname(file), importPath);
              const fullJsxPath = path.resolve(path.dirname(file), possibleJsxPath);
              
              if (!fs.existsSync(fullImportPath) && fs.existsSync(fullJsxPath)) {
                importIssues.push({
                  file: path.relative(this.projectPath, file),
                  line: index + 1,
                  issue: `导入路径扩展名不匹配: ${importPath}`,
                  suggestion: `应该使用: ${possibleJsxPath}`
                });
              }
            }
          }
          
          // 检查深层相对路径
          if (line.includes('import') && line.includes('../..')) {
            importIssues.push({
              file: path.relative(this.projectPath, file),
              line: index + 1,
              issue: '使用了深层相对路径导入',
              suggestion: '考虑配置路径别名'
            });
          }
        });
      } catch (error) {
        // 忽略读取错误
      }
    });
    
    if (importIssues.length > 0) {
      this.issues.push({
        type: 'warning',
        category: '导入路径',
        message: `发现 ${importIssues.length} 个导入路径问题`,
        details: importIssues,
        solution: '修复导入路径或配置模块解析'
      });
    }
  }

  // 分析依赖配置
  analyzeDependencies() {
    console.log('📦 分析依赖配置...');
    
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.issues.push({
        type: 'error',
        category: '配置',
        message: 'package.json 不存在',
        solution: '初始化项目: npm init'
      });
      return;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // 检查React版本
      if (deps.react) {
        const reactVersion = deps.react.replace(/[^0-9.]/g, '');
        if (parseFloat(reactVersion) < 18) {
          this.suggestions.push({
            category: '依赖',
            message: `React版本较旧 (${deps.react})`,
            suggestion: '考虑升级到React 18以获得最新特性'
          });
        }
      }
      
      // 检查是否有TypeScript配置但缺少相关依赖
      const hasTypeScript = fs.existsSync(path.join(this.projectPath, 'tsconfig.json'));
      if (hasTypeScript && !deps.typescript && !deps['@types/react']) {
        this.issues.push({
          type: 'warning',
          category: '依赖',
          message: '存在TypeScript配置但缺少相关依赖',
          solution: '安装TypeScript依赖: npm install -D typescript @types/react @types/react-dom'
        });
      }
      
      // 检查ESLint配置
      const hasEslint = fs.existsSync(path.join(this.projectPath, '.eslintrc.json'));
      if (hasEslint && !deps.eslint) {
        this.issues.push({
          type: 'warning',
          category: '依赖',
          message: '存在ESLint配置但未安装ESLint',
          solution: '安装ESLint: npm install -D eslint'
        });
      }
      
    } catch (error) {
      this.issues.push({
        type: 'error',
        category: '配置',
        message: 'package.json 格式错误',
        solution: '检查JSON语法'
      });
    }
  }

  // 分析组件结构
  analyzeComponentStructure() {
    console.log('🧩 分析组件结构...');
    
    const componentsDir = path.join(this.projectPath, 'src/components');
    
    if (!fs.existsSync(componentsDir)) {
      this.suggestions.push({
        category: '结构',
        message: 'components目录不存在',
        suggestion: '创建src/components目录来组织组件'
      });
      return;
    }
    
    const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    componentDirs.forEach(componentDir => {
      const componentPath = path.join(componentsDir, componentDir);
      const files = fs.readdirSync(componentPath);
      
      const hasIndex = files.includes('index.js') || files.includes('index.jsx') || files.includes('index.ts') || files.includes('index.tsx');
      const hasComponent = files.some(file => file.includes(componentDir) && (file.endsWith('.jsx') || file.endsWith('.tsx')));
      
      if (!hasIndex) {
        this.suggestions.push({
          category: '组件结构',
          message: `组件 ${componentDir} 缺少index文件`,
          suggestion: '创建index.js导出组件以简化导入'
        });
      }
      
      if (!hasComponent) {
        this.issues.push({
          type: 'warning',
          category: '组件结构',
          message: `组件目录 ${componentDir} 中未找到对应的组件文件`,
          solution: '确保组件文件名与目录名匹配'
        });
      }
    });
  }

  // 生成报告
  generateReport() {
    console.log('\n📊 生成调试报告...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.projectPath, `code-analysis-${timestamp}.md`);
    
    let report = `# React项目代码分析报告\n\n`;
    report += `**生成时间**: ${new Date().toLocaleString()}\n`;
    report += `**项目路径**: ${this.projectPath}\n\n`;
    
    // 问题汇总
    if (this.issues.length > 0) {
      report += `## 🚨 发现的问题 (${this.issues.length}个)\n\n`;
      
      const errorCount = this.issues.filter(i => i.type === 'error').length;
      const warningCount = this.issues.filter(i => i.type === 'warning').length;
      
      report += `- 错误: ${errorCount}个\n`;
      report += `- 警告: ${warningCount}个\n\n`;
      
      this.issues.forEach((issue, index) => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        report += `### ${icon} ${issue.category}: ${issue.message}\n\n`;
        report += `**解决方案**: ${issue.solution}\n\n`;
        
        if (issue.details) {
          report += `**详细信息**:\n`;
          issue.details.forEach(detail => {
            report += `- ${detail.file}:${detail.line} - ${detail.issue}\n`;
            report += `  💡 ${detail.suggestion}\n`;
          });
          report += '\n';
        }
      });
    }
    
    // 改进建议
    if (this.suggestions.length > 0) {
      report += `## 💡 改进建议 (${this.suggestions.length}个)\n\n`;
      
      this.suggestions.forEach((suggestion, index) => {
        report += `### ${index + 1}. ${suggestion.category}: ${suggestion.message}\n\n`;
        report += `**建议**: ${suggestion.suggestion}\n\n`;
      });
    }
    
    // 快速修复指南
    report += `## 🛠️ 快速修复指南\n\n`;
    report += `### 环境设置\n`;
    report += `\`\`\`bash\n`;
    report += `# 安装依赖\n`;
    report += `npm install\n\n`;
    report += `# 代码格式化\n`;
    report += `npm run format\n\n`;
    report += `# 代码检查\n`;
    report += `npm run lint\n\n`;
    report += `# 构建测试\n`;
    report += `npm run build\n`;
    report += `\`\`\`\n\n`;
    
    report += `### 推荐的项目结构\n`;
    report += `\`\`\`\n`;
    report += `src/\n`;
    report += `├── components/       # 可复用组件\n`;
    report += `│   └── ComponentName/\n`;
    report += `│       ├── index.js  # 导出文件\n`;
    report += `│       └── ComponentName.jsx\n`;
    report += `├── pages/           # 页面组件\n`;
    report += `├── store/           # 状态管理\n`;
    report += `├── data/            # 数据和Mock\n`;
    report += `├── types/           # TypeScript类型定义\n`;
    report += `├── App.jsx          # 根组件\n`;
    report += `└── main.jsx         # 入口文件\n`;
    report += `\`\`\`\n\n`;
    
    report += `---\n`;
    report += `*本报告由React项目分析器自动生成*\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`📄 详细报告已保存: ${path.basename(reportPath)}`);
    
    return reportPath;
  }

  // 运行完整分析
  async analyze() {
    console.log('🚀 开始React项目分析...\n');
    
    this.analyzeEntryPoints();
    this.analyzeImportPaths();
    this.analyzeDependencies();
    this.analyzeComponentStructure();
    
    // 输出控制台摘要
    console.log('\n📋 分析摘要:');
    console.log(`- 发现问题: ${this.issues.length}个`);
    console.log(`- 改进建议: ${this.suggestions.length}个`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 主要问题:');
      this.issues.slice(0, 3).forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${issue.message}`);
      });
    }
    
    const reportPath = this.generateReport();
    
    console.log('\n🎉 分析完成！');
    console.log(`📊 查看完整报告: ${path.basename(reportPath)}`);
    
    return {
      issues: this.issues,
      suggestions: this.suggestions,
      reportPath
    };
  }
}

// 运行分析器
if (require.main === module) {
  const analyzer = new ReactProjectAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = ReactProjectAnalyzer;