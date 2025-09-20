/**
 * 任务数据类型定义
 * 
 * 定义了任务管理系统中使用的核心数据结构，包括任务实体、
 * 任务状态枚举以及相关的创建和更新接口。
 */

/**
 * 任务优先级枚举
 * 用于标识任务的重要程度和紧急度
 */
export enum TaskPriority {
  /** 低优先级 - 可延后处理的任务 */
  LOW = 'low',
  /** 中等优先级 - 正常处理的任务 */
  MEDIUM = 'medium',
  /** 高优先级 - 需要优先处理的任务 */
  HIGH = 'high'
}

/**
 * 任务状态枚举
 * 表示任务当前的执行状态
 */
export enum TaskStatus {
  /** 待处理 - 任务已创建但尚未开始 */
  PENDING = 'pending',
  /** 进行中 - 任务正在执行 */
  IN_PROGRESS = 'in_progress',
  /** 已完成 - 任务已成功完成 */
  COMPLETED = 'completed',
  /** 已取消 - 任务被取消不再执行 */
  CANCELLED = 'cancelled'
}

/**
 * 任务实体接口
 * 
 * 定义了完整的任务数据结构，包含任务的所有必要信息
 * 用于在应用中传递和存储任务数据
 */
export interface Task {
  /** 任务唯一标识符 */
  id: string;
  
  /** 任务标题 */
  title: string;
  
  /** 任务详细描述，可选 */
  description?: string;
  
  /** 任务状态 */
  status: TaskStatus;
  
  /** 任务优先级 */
  priority: TaskPriority;
  
  /** 截止日期，可选 */
  dueDate?: Date;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 任务标签，用于分类和筛选 */
  tags?: string[];
}

/**
 * 创建任务数据接口
 * 
 * 用于创建新任务时传递的数据结构，
 * 排除了系统自动生成的字段（id、时间戳等）
 */
export interface CreateTaskData {
  /** 任务标题 */
  title: string;
  
  /** 任务详细描述，可选 */
  description?: string;
  
  /** 任务优先级，默认为中等优先级 */
  priority?: TaskPriority;
  
  /** 截止日期，可选 */
  dueDate?: Date;
  
  /** 任务标签，可选 */
  tags?: string[];
}

/**
 * 更新任务数据接口
 * 
 * 用于更新现有任务时传递的数据结构，
 * 所有字段都是可选的，支持部分更新
 */
export interface UpdateTaskData {
  /** 任务标题 */
  title?: string;
  
  /** 任务详细描述 */
  description?: string;
  
  /** 任务状态 */
  status?: TaskStatus;
  
  /** 任务优先级 */
  priority?: TaskPriority;
  
  /** 截止日期 */
  dueDate?: Date;
  
  /** 任务标签 */
  tags?: string[];
}

/**
 * 任务查询过滤条件接口
 * 
 * 用于筛选和查询任务时的条件参数
 */
export interface TaskFilter {
  /** 按状态筛选 */
  status?: TaskStatus;
  
  /** 按优先级筛选 */
  priority?: TaskPriority;
  
  /** 按标签筛选 */
  tags?: string[];
  
  /** 按截止日期范围筛选 */
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
}