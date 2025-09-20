// 任务管理相关类型定义
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  tags: string[];
  assignee?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: string;
  assignee?: string;
  dateRange?: [Date, Date];
  tags?: string[];
}

export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<string, number>;
}