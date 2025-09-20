/**
 * Jest测试环境设置
 * 
 * 配置Jest测试环境，包括全局设置和模拟对象。
 */

// 模拟jsdom环境的扩展
import '@testing-library/jest-dom';

// 全局测试设置
global.console = {
  ...console,
  // 在测试中静默警告日志，避免测试输出过多噪音
  warn: jest.fn(),
  error: jest.fn(),
};