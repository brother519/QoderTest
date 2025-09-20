#!/usr/bin/env node

/**
 * 包管理器调试工具
 * 检查npm/yarn依赖问题、版本冲突、安全漏洞等
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PackageDebugger {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.packageJson = null;
    this.lockFile = null;
    this.issues = [];
    this.recommendations = [];
  }

  // 初始化
  init() {
    console.log('📦 初始化包管理器调试器...\n');
    
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        this.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } else {
        throw new Error('package.json not found');
      }
    } catch (error) {
      this.issues.push({
        type: 'error',
        category: '配置文件',
        message: 'package.json 读取失败或不存在',
        detail: error.message
      });
      return false;
    }

    // 检查锁文件
    const yarnLock = path.join(this.projectPath, 'yarn.lock');
    const npmLock = path.join(this.projectPath, 'package-lock.json');
    
    if (fs.existsSync(yarnLock)) {
      this.lockFile = 'yarn.lock';
    } else if (fs.existsSync(npmLock)) {
      this.lockFile = 'package-lock.json';
    }

    return true;
  }

  // 检查依赖版本冲突
  checkVersionConflicts() {
    console.log('🔍 检查依赖版本冲突...');
    
    const allDeps = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies,
      ...this.packageJson.peerDependencies
    };

    // 检查重复依赖
    const depNames = Object.keys(allDeps);
    const duplicates = [];
    
    depNames.forEach(dep => {
      const versions = [];
      if (this.packageJson.dependencies && this.packageJson.dependencies[dep]) {
        versions.push({ type: 'dependencies', version: this.packageJson.dependencies[dep] });
      }
      if (this.packageJson.devDependencies && this.packageJson.devDependencies[dep]) {
        versions.push({ type: 'devDependencies', version: this.packageJson.devDependencies[dep] });
      }
      if (this.packageJson.peerDependencies && this.packageJson.peerDependencies[dep]) {
        versions.push({ type: 'peerDependencies', version: this.packageJson.peerDependencies[dep] });
      }
      
      if (versions.length > 1) {
        duplicates.push({ name: dep, versions });
      }
    });

    if (duplicates.length > 0) {
      this.issues.push({
        type: 'warning',
        category: '依赖冲突',
        message: `发现重复依赖: ${duplicates.map(d => d.name).join(', ')}`,
        detail: duplicates
      });
    }

    // 检查React生态系统版本兼容性
    this.checkReactEcosystem();
  }

  // 检查React生态系统兼容性
  checkReactEcosystem() {
    const allDeps = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    if (allDeps.react) {
      const reactVersion = this.parseVersion(allDeps.react);
      
      // 检查React DOM版本匹配
      if (allDeps['react-dom']) {
        const reactDomVersion = this.parseVersion(allDeps['react-dom']);
        if (reactVersion.major !== reactDomVersion.major || 
            reactVersion.minor !== reactDomVersion.minor) {
          this.issues.push({
            type: 'error',
            category: 'React版本',
            message: 'React和React-DOM版本不匹配',
            detail: `React: ${allDeps.react}, React-DOM: ${allDeps['react-dom']}`
          });
        }
      }

      // 检查TypeScript类型定义
      if (allDeps.typescript && !allDeps['@types/react']) {
        this.issues.push({
          type: 'warning',
          category: 'TypeScript',
          message: '使用TypeScript但缺少React类型定义',
          detail: '建议安装 @types/react 和 @types/react-dom'
        });
      }

      // 检查过时的依赖
      if (reactVersion.major < 18) {
        this.recommendations.push({
          category: '版本更新',
          message: 'React版本较旧',
          suggestion: '考虑升级到React 18以获得最新特性和性能改进'
        });
      }
    }
  }

  // 解析版本号
  parseVersion(versionString) {
    const cleanVersion = versionString.replace(/[^0-9.]/g, '');
    const parts = cleanVersion.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      original: versionString
    };
  }

  // 检查安全漏洞
  checkSecurityVulnerabilities() {
    console.log('🔒 检查安全漏洞...');
    
    try {
      // 使用npm audit检查安全漏洞
      const auditResult = execSync('npm audit --json', { 
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const vulnerabilities = Object.keys(audit.vulnerabilities);
        const highSeverity = vulnerabilities.filter(v => 
          audit.vulnerabilities[v].severity === 'high' || 
          audit.vulnerabilities[v].severity === 'critical'
        );
        
        if (highSeverity.length > 0) {
          this.issues.push({
            type: 'error',
            category: '安全漏洞',
            message: `发现 ${highSeverity.length} 个高危安全漏洞`,
            detail: highSeverity
          });
        }
        
        if (vulnerabilities.length > highSeverity.length) {
          this.issues.push({
            type: 'warning',
            category: '安全建议',
            message: `发现 ${vulnerabilities.length - highSeverity.length} 个低危安全漏洞`,
            detail: vulnerabilities.filter(v => !highSeverity.includes(v))
          });
        }
      }
    } catch (error) {
      console.log('  ⚠️  无法执行npm audit检查');
    }
  }

  // 检查过时的依赖
  checkOutdatedPackages() {
    console.log('📅 检查过时的依赖...');
    
    try {
      const outdatedResult = execSync('npm outdated --json', {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (outdatedResult) {
        const outdated = JSON.parse(outdatedResult);
        const outdatedPackages = Object.keys(outdated);
        
        if (outdatedPackages.length > 0) {
          const majorUpdates = outdatedPackages.filter(pkg => {
            const current = this.parseVersion(outdated[pkg].current);
            const latest = this.parseVersion(outdated[pkg].latest);
            return latest.major > current.major;
          });
          
          if (majorUpdates.length > 0) {
            this.recommendations.push({
              category: '主要版本更新',
              message: `${majorUpdates.length} 个包有主要版本更新`,
              suggestion: '检查更新日志后谨慎升级主要版本',
              detail: majorUpdates
            });
          }
          
          const minorUpdates = outdatedPackages.filter(pkg => 
            !majorUpdates.includes(pkg)
          );
          
          if (minorUpdates.length > 0) {
            this.recommendations.push({
              category: '次要版本更新',
              message: `${minorUpdates.length} 个包有次要版本更新`,
              suggestion: '可以安全更新这些包',
              detail: minorUpdates
            });
          }
        }
      }
    } catch (error) {
      // npm outdated在有过时包时会返回非0退出码，这是正常的
      if (error.stdout) {
        try {
          const outdated = JSON.parse(error.stdout);
          const outdatedCount = Object.keys(outdated).length;
          if (outdatedCount > 0) {
            this.recommendations.push({
              category: '包更新',
              message: `发现 ${outdatedCount} 个过时的包`,
              suggestion: '运行 npm update 更新包'
            });
          }
        } catch (parseError) {
          // 忽略解析错误
        }
      }
    }
  }

  // 检查包管理器一致性
  checkPackageManagerConsistency() {
    console.log('🔧 检查包管理器一致性...');
    
    const hasYarnLock = fs.existsSync(path.join(this.projectPath, 'yarn.lock'));
    const hasNpmLock = fs.existsSync(path.join(this.projectPath, 'package-lock.json'));
    const hasNodeModules = fs.existsSync(path.join(this.projectPath, 'node_modules'));
    
    if (hasYarnLock && hasNpmLock) {
      this.issues.push({
        type: 'warning',
        category: '包管理器',
        message: '同时存在yarn.lock和package-lock.json',
        detail: '建议选择一个包管理器并删除另一个锁文件'
      });
    }
    
    if (!hasNodeModules && (hasYarnLock || hasNpmLock)) {
      this.issues.push({
        type: 'error',
        category: '依赖安装',
        message: '存在锁文件但node_modules未安装',
        detail: '运行 npm install 或 yarn install'
      });
    }
    
    // 检查scripts中的包管理器使用
    if (this.packageJson.scripts) {
      const scripts = Object.values(this.packageJson.scripts).join(' ');
      const usesYarn = scripts.includes('yarn ');
      const usesNpm = scripts.includes('npm ');
      
      if (usesYarn && usesNpm) {
        this.recommendations.push({
          category: '包管理器一致性',
          message: 'package.json scripts中混用了npm和yarn',
          suggestion: '建议在scripts中统一使用一种包管理器'
        });
      }
    }
  }

  // 生成修复建议
  generateFixSuggestions() {
    const fixes = [];
    
    // 基于问题类型生成修复建议
    this.issues.forEach(issue => {
      switch (issue.category) {
        case '依赖冲突':
          fixes.push({
            category: issue.category,
            commands: [
              'npm ls --depth=0  # 查看依赖树',
              'npm dedupe        # 去重依赖'
            ]
          });
          break;
        
        case '安全漏洞':
          fixes.push({
            category: issue.category,
            commands: [
              'npm audit fix     # 自动修复安全漏洞',
              'npm audit fix --force  # 强制修复（可能破坏兼容性）'
            ]
          });
          break;
        
        case 'React版本':
          fixes.push({
            category: issue.category,
            commands: [
              'npm install react@latest react-dom@latest  # 更新React到最新版本'
            ]
          });
          break;
        
        case 'TypeScript':
          fixes.push({
            category: issue.category,
            commands: [
              'npm install -D @types/react @types/react-dom  # 安装React类型定义'
            ]
          });
          break;
      }
    });
    
    return fixes;
  }

  // 生成报告
  generateReport() {
    console.log('\n📊 生成包管理器调试报告...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.projectPath, `package-debug-${timestamp}.md`);
    
    let report = `# 包管理器调试报告\n\n`;
    report += `**生成时间**: ${new Date().toLocaleString()}\n`;
    report += `**项目路径**: ${this.projectPath}\n`;
    report += `**包管理器**: ${this.lockFile ? (this.lockFile.includes('yarn') ? 'Yarn' : 'npm') : '未确定'}\n\n`;
    
    // 项目信息
    if (this.packageJson) {
      report += `## 📋 项目信息\n\n`;
      report += `- **项目名称**: ${this.packageJson.name || 'N/A'}\n`;
      report += `- **版本**: ${this.packageJson.version || 'N/A'}\n`;
      report += `- **依赖数量**: ${Object.keys(this.packageJson.dependencies || {}).length}\n`;
      report += `- **开发依赖数量**: ${Object.keys(this.packageJson.devDependencies || {}).length}\n\n`;
    }
    
    // 问题汇总
    if (this.issues.length > 0) {
      report += `## 🚨 发现的问题 (${this.issues.length}个)\n\n`;
      
      const errorCount = this.issues.filter(i => i.type === 'error').length;
      const warningCount = this.issues.filter(i => i.type === 'warning').length;
      
      report += `- 🔴 错误: ${errorCount}个\n`;
      report += `- 🟡 警告: ${warningCount}个\n\n`;
      
      this.issues.forEach((issue, index) => {
        const icon = issue.type === 'error' ? '🔴' : '🟡';
        report += `### ${icon} ${issue.category}: ${issue.message}\n\n`;
        if (issue.detail) {
          if (typeof issue.detail === 'string') {
            report += `**详情**: ${issue.detail}\n\n`;
          } else {
            report += `**详情**: ${JSON.stringify(issue.detail, null, 2)}\n\n`;
          }
        }
      });
    }
    
    // 建议
    if (this.recommendations.length > 0) {
      report += `## 💡 改进建议 (${this.recommendations.length}个)\n\n`;
      
      this.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.category}: ${rec.message}\n\n`;
        report += `**建议**: ${rec.suggestion}\n\n`;
        if (rec.detail) {
          report += `**详情**: ${JSON.stringify(rec.detail, null, 2)}\n\n`;
        }
      });
    }
    
    // 修复建议
    const fixes = this.generateFixSuggestions();
    if (fixes.length > 0) {
      report += `## 🛠️ 修复命令\n\n`;
      fixes.forEach(fix => {
        report += `### ${fix.category}\n\n`;
        report += `\`\`\`bash\n`;
        fix.commands.forEach(cmd => {
          report += `${cmd}\n`;
        });
        report += `\`\`\`\n\n`;
      });
    }
    
    // 常用命令
    report += `## 📚 常用调试命令\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 查看依赖信息\n`;
    report += `npm ls --depth=0        # 查看直接依赖\n`;
    report += `npm ls --depth=1        # 查看依赖的依赖\n`;
    report += `npm outdated            # 查看过时的包\n\n`;
    report += `# 安全检查\n`;
    report += `npm audit               # 安全审计\n`;
    report += `npm audit fix           # 修复安全漏洞\n\n`;
    report += `# 清理和重装\n`;
    report += `rm -rf node_modules package-lock.json\n`;
    report += `npm install             # 重新安装依赖\n\n`;
    report += `# Yarn用户\n`;
    report += `yarn install            # 安装依赖\n`;
    report += `yarn audit              # 安全审计\n`;
    report += `yarn outdated           # 查看过时的包\n`;
    report += `\`\`\`\n\n`;
    
    report += `---\n`;
    report += `*本报告由包管理器调试器自动生成*\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`📄 详细报告已保存: ${path.basename(reportPath)}`);
    
    return reportPath;
  }

  // 运行完整调试
  async debug() {
    console.log('🚀 开始包管理器调试...\n');
    
    if (!this.init()) {
      console.error('❌ 初始化失败，无法继续调试');
      return;
    }
    
    this.checkVersionConflicts();
    this.checkSecurityVulnerabilities();
    this.checkOutdatedPackages();
    this.checkPackageManagerConsistency();
    
    // 输出控制台摘要
    console.log('\n📋 调试摘要:');
    console.log(`- 发现问题: ${this.issues.length}个`);
    console.log(`- 改进建议: ${this.recommendations.length}个`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 主要问题:');
      this.issues.slice(0, 3).forEach(issue => {
        const icon = issue.type === 'error' ? '🔴' : '🟡';
        console.log(`  ${icon} ${issue.message}`);
      });
    }
    
    const reportPath = this.generateReport();
    
    console.log('\n🎉 调试完成！');
    console.log(`📊 查看完整报告: ${path.basename(reportPath)}`);
    
    return {
      issues: this.issues,
      recommendations: this.recommendations,
      reportPath
    };
  }
}

// 运行调试器
if (require.main === module) {
  const debugger = new PackageDebugger();
  debugger.debug().catch(console.error);
}

module.exports = PackageDebugger;