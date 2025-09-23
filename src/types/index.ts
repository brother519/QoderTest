/**
 * TypeScript类型定义模块
 * 
 * 功能说明：
 * - 定义任务管理系统的所有数据类型
 * - 提供类型安全和代码提示支持
 * - 定义Redux状态管理的Action和State类型
 * - 支持任务过滤和搜索功能的类型定义
 * 
 * 主要类型：
 * - Task: 任务对象的完整类型定义
 * - TaskFilter: 任务过滤条件类型
 * - AppState: 应用全局状态类型
 * - AppAction: Redux Action类型联合
 * 
 * @author AI Assistant
 * @since 2025-09-20
 * @version 1.0.0
 */

/**
 * 任务对象接口
 * 
 * @interface Task
 * @description 定义任务的完整数据结构，包含所有必要的任务信息
 * 
 * @example
 * ```typescript
 * const task: Task = {
 *   id: 'task_123',
 *   title: '开发新功能',
 *   description: '实现用户登录功能',
 *   assignee: '张三',
 *   priority: 'HIGH',
 *   status: 'IN_PROGRESS',
 *   dueDate: new Date(),
 *   tags: ['前端', '登录'],
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface Task {
  /** 任务唯一标识符，由系统自动生成 */
  id: string;
  
  /** 任务标题，简洁描述任务内容 */
  title: string;
  
  /** 任务详细描述，包含具体需求和实现要求 */
  description: string;
  
  /** 任务负责人姓名 */
  assignee: string;
  
  /** 
   * 任务优先级
   * - LOW: 低优先级，可延后处理
   * - MEDIUM: 中等优先级，正常排期处理
   * - HIGH: 高优先级，需要优先处理
   */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  
  /** 
   * 任务当前状态
   * - TODO: 待处理，尚未开始
   * - IN_PROGRESS: 进行中，正在执行
   * - DONE: 已完成，任务已结束
   */
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  
  /** 任务截止日期，可为空表示无截止日期 */
  dueDate: Date | null;
  
  /** 任务标签数组，用于分类和过滤 */
  tags: string[];
  
  /** 任务创建时间 */
  createdAt: Date;
  
  /** 任务最后修改时间 */
  updatedAt: Date;
}

/**
 * 任务过滤条件接口
 * 
 * @interface TaskFilter
 * @description 定义任务列表过滤和搜索的条件参数
 * 
 * @example
 * ```typescript
 * const filter: TaskFilter = {
 *   status: 'IN_PROGRESS',
 *   priority: 'HIGH',
 *   assignee: '张三',
 *   search: '登录功能',
 *   tags: ['前端', 'React']
 * };
 * ```
 */
export interface TaskFilter {
  /** 按任务状态过滤，可选 */
  status?: Task['status'];
  
  /** 按任务优先级过滤，可选 */
  priority?: Task['priority'];
  
  /** 按负责人过滤，精确匹配姓名 */
  assignee?: string;
  
  /** 关键词搜索，在标题和描述中进行模糊匹配 */
  search?: string;
  
  /** 按标签过滤，包含任意指定标签的任务 */
  tags?: string[];
}

/**
 * 应用全局状态接口
 * 
 * @interface AppState
 * @description 定义应用的全局状态结构，用于状态管理
 * 
 * @example
 * ```typescript
 * const initialState: AppState = {
 *   tasks: [],
 *   filter: {},
 *   selectedTask: null,
 *   isCreateModalOpen: false,
 *   isDetailModalOpen: false,
 *   isConfirmModalOpen: false,
 *   confirmModalConfig: null
 * };
 * ```
 */
export interface AppState {
  /** 任务列表，包含所有加载的任务数据 */
  tasks: Task[];
  
  /** 当前激活的过滤条件 */
  filter: TaskFilter;
  
  /** 当前选中的任务，用于查看详情和编辑 */
  selectedTask: Task | null;
  
  /** 创建/编辑任务模态框的显示状态 */
  isCreateModalOpen: boolean;
  
  /** 任务详情模态框的显示状态 */
  isDetailModalOpen: boolean;
  
  /** 确认对话框的显示状态 */
  isConfirmModalOpen: boolean;
  
  /** 确认对话框的配置信息 */
  confirmModalConfig: {
    /** 对话框标题 */
    title: string;
    /** 对话框内容消息 */
    message: string;
    /** 确认按钮的回调函数 */
    onConfirm: () => void;
  } | null;
}

/**
 * 应用Action类型联合
 * 
 * @type AppAction
 * @description 定义所有可能的Redux Action类型，用于状态更新
 * 
 * Action类型说明：
 * - SET_TASKS: 设置任务列表
 * - ADD_TASK: 添加新任务
 * - UPDATE_TASK: 更新现有任务
 * - DELETE_TASK: 删除任务
 * - SET_FILTER: 设置过滤条件
 * - SET_SELECTED_TASK: 设置选中任务
 * - TOGGLE_*_MODAL: 切换模态框显示状态
 * - SET_CONFIRM_MODAL_CONFIG: 设置确认模态框配置
 * 
 * @example
 * ```typescript
 * // 添加任务Action
 * const addAction: AppAction = {
 *   type: 'ADD_TASK',
 *   payload: newTask
 * };
 * 
 * // 设置过滤Action
 * const filterAction: AppAction = {
 *   type: 'SET_FILTER',
 *   payload: { status: 'DONE' }
 * };
 * ```
 */
export type AppAction =
  | { type: 'SET_TASKS'; payload: Task[] }           // 设置任务列表
  | { type: 'ADD_TASK'; payload: Task }              // 添加新任务
  | { type: 'UPDATE_TASK'; payload: Task }           // 更新任务信息
  | { type: 'DELETE_TASK'; payload: string }         // 删除任务（传入任务ID）
  | { type: 'SET_FILTER'; payload: Partial<TaskFilter> } // 设置过滤条件
  | { type: 'SET_SELECTED_TASK'; payload: Task | null }   // 设置当前选中任务
  | { type: 'TOGGLE_CREATE_MODAL'; payload?: boolean }    // 切换创建模态框
  | { type: 'TOGGLE_DETAIL_MODAL'; payload?: boolean }    // 切换详情模态框
  | { type: 'TOGGLE_CONFIRM_MODAL'; payload?: boolean }   // 切换确认模态框
  | { type: 'SET_CONFIRM_MODAL_CONFIG'; payload: AppState['confirmModalConfig'] }; // 设置确认模态框配置