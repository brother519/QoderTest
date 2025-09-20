/**
 * 测试工具函数
 * 提供自定义的render方法和常用的测试辅助工具
 */
import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// 创建测试用的Provider包装器
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

// 自定义render方法
const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// 模拟Zustand store的工具函数
export const createMockStore = (initialState = {}) => {
  const store = {
    ...initialState,
    setState: vi.fn(),
    getState: vi.fn(() => store),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  }
  return store
}

// 模拟API响应
export const mockApiResponse = (data, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
      })
    }, delay)
  })
}

// 模拟API错误
export const mockApiError = (error = 'API Error', status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        ok: false,
        status,
        statusText: error,
        message: error,
      })
    }, delay)
  })
}

// 等待异步操作完成
export const waitForAsync = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// 创建测试用的商品数据
export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-1',
  name: '测试商品',
  description: '这是一个测试商品的描述',
  price: 99.99,
  category: '测试分类',
  stock: 10,
  rating: 4.5,
  images: ['https://example.com/image1.jpg'],
  tags: ['测试', '商品'],
  variants: [],
  ...overrides
})

// 创建测试用的用户数据
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  name: '测试用户',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  isLoggedIn: true,
  ...overrides
})

// 创建测试用的购物车数据
export const createMockCartItem = (overrides = {}) => ({
  id: 'test-product-1',
  name: '测试商品',
  price: 99.99,
  quantity: 1,
  variant: null,
  ...overrides
})

// 模拟事件对象
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '' },
  ...overrides
})

// 模拟文件对象
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  return new File(['test content'], name, { type, size })
}

// 重新导出testing-library的所有功能
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// 导出自定义render作为默认
export { customRender as render }