/**
 * React应用运行时调试工具
 * 提供性能监控、错误追踪、状态检查等功能
 */

class ReactDebugger {
  constructor(options = {}) {
    this.options = {
      enableLogging: process.env.NODE_ENV === 'development',
      enablePerformanceMonitoring: true,
      enableStateTracking: true,
      logLevel: 'info', // 'debug', 'info', 'warn', 'error'
      ...options
    };
    
    this.logs = [];
    this.performanceMetrics = [];
    this.stateChanges = [];
    this.errorLog = [];
    
    if (this.options.enableLogging) {
      this.initializeLogging();
    }
    
    if (this.options.enablePerformanceMonitoring) {
      this.initializePerformanceMonitoring();
    }
  }

  // 初始化日志系统
  initializeLogging() {
    const originalConsole = { ...console };
    
    ['log', 'warn', 'error', 'info'].forEach(method => {
      console[method] = (...args) => {
        // 记录到内部日志
        this.logs.push({
          level: method,
          message: args,
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
        
        // 保持原有行为
        originalConsole[method](...args);
        
        // 限制日志数量
        if (this.logs.length > 1000) {
          this.logs = this.logs.slice(-500);
        }
      };
    });
  }

  // 初始化性能监控
  initializePerformanceMonitoring() {
    // 监控组件渲染性能
    if (window.performance && window.performance.mark) {
      this.monitorRenderPerformance();
    }
    
    // 监控网络请求
    this.monitorNetworkRequests();
    
    // 监控内存使用
    this.monitorMemoryUsage();
  }

  // 监控组件渲染性能
  monitorRenderPerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.performanceMetrics.push({
            type: 'render',
            name: entry.name,
            duration: entry.duration,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }

  // 监控网络请求
  monitorNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.performanceMetrics.push({
          type: 'network',
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.performanceMetrics.push({
          type: 'network',
          url,
          method: args[1]?.method || 'GET',
          status: 'error',
          duration: endTime - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    };
  }

  // 监控内存使用
  monitorMemoryUsage() {
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        const memory = window.performance.memory;
        this.performanceMetrics.push({
          type: 'memory',
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: new Date().toISOString()
        });
        
        // 限制内存记录数量
        const memoryRecords = this.performanceMetrics.filter(m => m.type === 'memory');
        if (memoryRecords.length > 100) {
          this.performanceMetrics = this.performanceMetrics.filter(m => 
            m.type !== 'memory' || 
            memoryRecords.indexOf(m) >= memoryRecords.length - 50
          );
        }
      }, 30000); // 每30秒记录一次
    }
  }

  // 记录组件状态变化
  trackStateChange(componentName, oldState, newState) {
    if (!this.options.enableStateTracking) return;
    
    this.stateChanges.push({
      componentName,
      oldState: JSON.parse(JSON.stringify(oldState)),
      newState: JSON.parse(JSON.stringify(newState)),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    
    // 限制状态变化记录数量
    if (this.stateChanges.length > 500) {
      this.stateChanges = this.stateChanges.slice(-250);
    }
  }

  // 记录错误
  logError(error, errorInfo = {}) {
    const errorRecord = {
      message: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.errorLog.push(errorRecord);
    
    if (this.options.enableLogging) {
      console.error('🚨 React Debugger - Error:', errorRecord);
    }
    
    return errorRecord;
  }

  // 性能分析
  analyzePerformance() {
    const analysis = {
      renderPerformance: [],
      networkPerformance: [],
      memoryUsage: []
    };
    
    // 分析渲染性能
    const renderMetrics = this.performanceMetrics.filter(m => m.type === 'render');
    if (renderMetrics.length > 0) {
      const avgRenderTime = renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length;
      const slowRenders = renderMetrics.filter(m => m.duration > 16); // 超过16ms的渲染
      
      analysis.renderPerformance = {
        totalRenders: renderMetrics.length,
        averageRenderTime: avgRenderTime,
        slowRenders: slowRenders.length,
        slowRenderPercentage: (slowRenders.length / renderMetrics.length * 100).toFixed(2)
      };
    }
    
    // 分析网络性能
    const networkMetrics = this.performanceMetrics.filter(m => m.type === 'network');
    if (networkMetrics.length > 0) {
      const avgRequestTime = networkMetrics.reduce((sum, m) => sum + m.duration, 0) / networkMetrics.length;
      const slowRequests = networkMetrics.filter(m => m.duration > 1000); // 超过1秒的请求
      const errorRequests = networkMetrics.filter(m => m.status === 'error' || m.status >= 400);
      
      analysis.networkPerformance = {
        totalRequests: networkMetrics.length,
        averageRequestTime: avgRequestTime,
        slowRequests: slowRequests.length,
        errorRequests: errorRequests.length,
        errorRate: (errorRequests.length / networkMetrics.length * 100).toFixed(2)
      };
    }
    
    // 分析内存使用
    const memoryMetrics = this.performanceMetrics.filter(m => m.type === 'memory');
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      const memoryUsagePercentage = (latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit * 100).toFixed(2);
      
      analysis.memoryUsage = {
        currentUsage: latestMemory.usedJSHeapSize,
        totalHeap: latestMemory.totalJSHeapSize,
        heapLimit: latestMemory.jsHeapSizeLimit,
        usagePercentage: memoryUsagePercentage
      };
    }
    
    return analysis;
  }

  // 获取调试报告
  getDebugReport() {
    const report = {
      timestamp: new Date().toISOString(),
      logs: this.logs.slice(-50), // 最近50条日志
      performanceAnalysis: this.analyzePerformance(),
      recentStateChanges: this.stateChanges.slice(-20), // 最近20次状态变化
      recentErrors: this.errorLog.slice(-10), // 最近10个错误
      metrics: {
        totalLogs: this.logs.length,
        totalPerformanceMetrics: this.performanceMetrics.length,
        totalStateChanges: this.stateChanges.length,
        totalErrors: this.errorLog.length
      }
    };
    
    return report;
  }

  // 导出调试数据
  exportDebugData() {
    const data = {
      logs: this.logs,
      performanceMetrics: this.performanceMetrics,
      stateChanges: this.stateChanges,
      errorLog: this.errorLog,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `react-debug-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 清理调试数据
  clearDebugData() {
    this.logs = [];
    this.performanceMetrics = [];
    this.stateChanges = [];
    this.errorLog = [];
    
    console.log('🧹 调试数据已清理');
  }

  // 显示调试面板
  showDebugPanel() {
    if (document.getElementById('react-debug-panel')) {
      return; // 面板已存在
    }
    
    const panel = document.createElement('div');
    panel.id = 'react-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      overflow: hidden;
    `;
    
    const analysis = this.analyzePerformance();
    
    panel.innerHTML = `
      <div style="padding: 10px; border-bottom: 1px solid #eee; background: #f5f5f5; font-weight: bold;">
        React Debugger
        <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; cursor: pointer;">×</button>
      </div>
      <div style="padding: 10px; max-height: 350px; overflow-y: auto;">
        <div><strong>📊 性能分析</strong></div>
        <div>渲染次数: ${analysis.renderPerformance?.totalRenders || 0}</div>
        <div>平均渲染时间: ${(analysis.renderPerformance?.averageRenderTime || 0).toFixed(2)}ms</div>
        <div>网络请求: ${analysis.networkPerformance?.totalRequests || 0}</div>
        <div>内存使用: ${analysis.memoryUsage?.usagePercentage || 0}%</div>
        <hr>
        <div><strong>📝 统计信息</strong></div>
        <div>日志: ${this.logs.length}</div>
        <div>状态变化: ${this.stateChanges.length}</div>
        <div>错误: ${this.errorLog.length}</div>
        <hr>
        <button onclick="window.reactDebugger.exportDebugData()" style="margin-right: 5px;">导出数据</button>
        <button onclick="window.reactDebugger.clearDebugData()">清理数据</button>
      </div>
    `;
    
    document.body.appendChild(panel);
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.reactDebugger = new ReactDebugger();
  
  // 开发环境下提供快捷键
  if (process.env.NODE_ENV === 'development') {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D 显示调试面板
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.reactDebugger.showDebugPanel();
      }
    });
    
    console.log('🐛 React Debugger已启用');
    console.log('💡 按 Ctrl+Shift+D 显示调试面板');
  }
}

export default ReactDebugger;