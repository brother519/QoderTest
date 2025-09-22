/**
 * @fileoverview AppContext 模块统一导出文件
 * 
 * 本文件作为应用上下文管理模块的入口点，统一导出所有相关的
 * 类型、组件、Hook和工具函数，方便其他模块使用。
 * 
 * 导出内容：
 * - 核心类型定义 (AppState, AppAction, AppContextType)
 * - Context对象和初始状态
 * - AppProvider 组件
 * - useAppContext 及相关Hook
 * - 工具函数和选择器
 * 
 * 使用方式：
 * ```tsx
 * // 导入主要功能
 * import { AppProvider, useAppContext } from '@/context';
 * 
 * // 导入特定Hook
 * import { useCartUtils, useProductSearch } from '@/context';
 * 
 * // 导入类型
 * import type { AppState, AppContextType } from '@/context';
 * ```
 * 
 * @author 系统开发团队
 * @version 1.0.0
 * @created 2025-09-22
 * @lastModified 2025-09-22
 */

// ====== 核心Context导出 ======

/**
 * 核心类型和Context对象
 * 从 AppContext.tsx 导出所有基础类型定义和Context对象
 */
export type { 
  AppState, 
  AppAction, 
  AppContextType, 
  AppProviderProps 
} from './AppContext';

export { 
  AppContext, 
  initialState, 
  appReducer 
} from './AppContext';

// ====== Provider组件导出 ======

/**
 * AppProvider 组件
 * 提供全局状态管理的Provider组件
 */
export { AppProvider } from './AppProvider';

// ====== Hook导出 ======

/**
 * 应用上下文访问Hook
 * 提供类型安全的Context访问方式
 */
export { 
  useAppContext,
  useAppSelector,
  useAppActions,
  useAppErrorHandler,
  useCartUtils,
  useProductSearch
} from './useAppContext';

// ====== 便捷导出 ======

/**
 * 默认导出：最常用的AppProvider和useAppContext
 * 支持默认导入方式
 */
export { AppProvider as default } from './AppProvider';

// ====== 重新导出类型（用于类型推导） ======

/**
 * 重新导出Product相关类型，方便使用
 * 避免需要从多个文件导入类型
 */
export type { 
  Product, 
  CartItem, 
  User, 
  Order, 
  Address, 
  PaymentMethod, 
  SearchFilters 
} from '../types';

/**
 * 常用类型别名
 * 为常用的复杂类型提供简化的别名
 */
export type ProductWithQuantity = {
  product: import('../types').Product;
  quantity: number;
};

export type CartItemWithProduct = import('../types').CartItem & {
  product?: import('../types').Product;
};

export type OrderStatus = import('../types').Order['status'];
export type PaymentMethodType = import('../types').PaymentMethod['type'];

/**
 * Context相关的工具类型
 * 用于类型推导和高级TypeScript用法
 */
export type AppContextValue = ReturnType<typeof import('./useAppContext').useAppContext>;
export type AppSelectorFn<T> = (state: AppContextType) => T;

/**
 * 模块元信息
 * 用于调试和开发工具
 */
export const MODULE_INFO = {
  name: 'AppContext',
  version: '1.0.0',
  description: '应用全局状态管理模块',
  exports: [
    'AppProvider',
    'useAppContext',
    'useAppSelector', 
    'useAppActions',
    'useAppErrorHandler',
    'useCartUtils',
    'useProductSearch'
  ]
} as const;

/**
 * 开发工具
 * 仅在开发环境下可用的调试工具
 */
if (process.env.NODE_ENV === 'development') {
  // 开发环境下的全局调试工具
  (window as any).__APP_CONTEXT_DEBUG__ = {
    MODULE_INFO,
    version: '1.0.0',
    documentation: 'https://your-docs-url.com/app-context'
  };
}