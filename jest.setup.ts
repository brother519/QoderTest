import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '',
      push: jest.fn(),
      back: jest.fn(),
    };
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  setTimeout(callback, 0);
  return 0;
};

// Console 抑制配置 - 仅在非 DEBUG 模式下抑制 error/warn
// 这样可以保留重要调试信息，同时避免测试输出过于嘈杂
if (!process.env.DEBUG_CONSOLE) {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
  };
}
