// 统一导出所有类型定义
export * from './product';
export * from './task';

// 通用类型定义
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// UI状态相关类型
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface DialogState {
  open: boolean;
  title?: string;
  content?: string;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  private?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}