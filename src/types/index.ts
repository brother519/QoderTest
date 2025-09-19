// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// 任务优先级枚举
export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 任务数据模型
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string[];
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 筛选条件接口
export interface FilterCriteria {
  keyword?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
}

// 模态框状态接口
export interface ModalState {
  createTask: boolean;
  taskDetail: boolean;
  confirm: boolean;
}

// 确认对话框类型
export enum ConfirmType {
  DELETE = 'delete',
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive'
}

// 确认对话框配置
export interface ConfirmConfig {
  type: ConfirmType;
  taskId: string;
  title: string;
  content: string;
}

// 表单验证错误
export interface ValidationError {
  field: string;
  message: string;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}