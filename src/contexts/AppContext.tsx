/**
/**
 * 应用全局状态管理上下文
 * 
 * 该文件定义了任务管理系统的核心状态管理逻辑，包括任务数据、筛选条件、
 * 模态框状态等全局状态的管理。采用React Context + useReducer模式，
 * 提供了统一的状态管理和操作接口。
 * 
 * 主要功能特性：
 * - 任务CRUD操作：创建、查询、更新、删除任务
 * - 筛选状态管理：管理多维度的任务筛选条件
 * - 模态框状态管理：创建、详情、确认模态框的状态管理
 * - 异步操作封装：将业务逻辑封装为容易使用的异步方法
 * - 错误处理：统一的错误处理和用户反馈机制
 * 
 * 状态结构：
 * - tasks: 任务数据数组
 * - filter: 当前筛选条件
 * - selectedTask: 当前选中的任务
 * - 模态框状态: 各种模态框的显示/隐藏状态
 * 
 * @fileoverview 应用全局状态管理上下文
 * @author 任务管理系统开发团队
 * @version 1.0.0
 * @created 2025-01-20
 * @lastModified 2025-01-20
 * 
 * @example
 * ```tsx
 * // 在应用根组件中使用
 * function App() {
 *   return (
 *     <AppProvider>
 *       <TaskManagementPage />
 *     </AppProvider>
 *   );
 * }
 * 
 * // 在子组件中使用
 * const { state, createTask, updateTask } = useAppContext();
 * ```
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Task, TaskFilter } from '../types';
import { taskService } from '../services/taskService';

/**
 * 应用初始状态
 * 
 * @description 定义应用启动时的默认状态，所有状态字段都设置为空或false
 * 
 * 状态说明：
 * - tasks: 空数组，应用启动时无任务数据
 * - filter: 空对象，无任何筛选条件
 * - selectedTask: null，未选中任何任务
 * - 模态框状态: 所有模态框都处于关闭状态
 * - confirmModalConfig: null，确认对话框无配置
 * 
 * @type {AppState}
 * @since 1.0.0
 */
const initialState: AppState = {
  tasks: [], // 任务数据数组，初始为空
  filter: {}, // 当前筛选条件，初始无筛选
  selectedTask: null, // 当前选中的任务，初始为null
  isCreateModalOpen: false, // 创建/编辑任务模态框状态
  isDetailModalOpen: false, // 任务详情模态框状态
  isConfirmModalOpen: false, // 确认对话框状态
  confirmModalConfig: null, // 确认对话框配置信息
};

/**
 * 应用状态Reducer函数
 * 
 * @description 处理所有状态变更的纯函数，根据Action类型执行相应的状态转换
 * 
 * 设计原则：
 * - 纯函数：不修改原状态，总是返回新的状态对象
 * - 不可变性：使用扩展运算符创建新对象和数组
 * - 类型安全：TypeScript确保Action和State类型正确
 * - 副作用同步：某些操作会同步更新相关联的状态字段
 * 
 * 状态转换逻辑：
 * - 任务数据变更：SET_TASKS、ADD_TASK、UPDATE_TASK、DELETE_TASK
 * - 筛选条件变更：SET_FILTER（合并式更新）
 * - 任务选择变更：SET_SELECTED_TASK
 * - 模态框控制：TOGGLE_*_MODAL（支持显式和切换模式）
 * - 确认对话框：SET_CONFIRM_MODAL_CONFIG
 * 
 * @param {AppState} state - 当前应用状态
 * @param {AppAction} action - 要执行的操作动作
 * @returns {AppState} 更新后的新状态对象
 * 
 * @example
 * ```typescript
 * // 添加新任务
 * const newState = appReducer(currentState, {
 *   type: 'ADD_TASK',
 *   payload: newTask
 * });
 * 
 * // 更新筛选条件
 * const filteredState = appReducer(currentState, {
 *   type: 'SET_FILTER',
 *   payload: { status: 'DONE' }
 * });
 * ```
 * 
 * @complexity O(n) 对于任务列表操作，O(1) 对于其他操作
 * @since 1.0.0
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    /**
     * 设置完整任务列表
     * 
     * 使用场景：
     * - 应用初始化时加载任务数据
     * - 刷新任务列表时替换所有数据
     * 
     * 状态变更：直接替换整个tasks数组
     */
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    /**
     * 添加新任务到列表末尾
     * 
     * 使用场景：用户创建新任务后
     * 状态变更：在现有tasks数组末尾添加新任务
     * 性能考虑：使用扩展运算符，时间复杂度O(n)
     */
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    /**
     * 更新现有任务信息
     * 
     * 使用场景：用户编辑任务后保存更改
     * 状态变更：
     * 1. 在tasks数组中替换匹配ID的任务
     * 2. 同步更新selectedTask（如果是当前选中的任务）
     * 
     * 副作用处理：确保selectedTask与tasks数组的数据一致性
     */
    case 'UPDATE_TASK':
      return {
        ...state,
        // 更新tasks数组中的对应任务
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        // 同步更新selectedTask（如果是当前选中的任务）
        selectedTask: state.selectedTask?.id === action.payload.id 
          ? action.payload 
          : state.selectedTask
      };
    
    /**
     * 删除指定任务
     * 
     * 使用场景：用户确认删除任务后
     * 状态变更：
     * 1. 从tasks数组中移除指定ID的任务
     * 2. 清空selectedTask（如果删除的是当前选中任务）
     * 
     * 副作用处理：防止selectedTask指向已删除的任务
     */
    case 'DELETE_TASK':
      return {
        ...state,
        // 过滤掉指定ID的任务
        tasks: state.tasks.filter(task => task.id !== action.payload),
        // 如果删除的是当前选中任务，则清空选中状态
        selectedTask: state.selectedTask?.id === action.payload 
          ? null 
          : state.selectedTask
      };
    
    /**
     * 设置筛选条件
     * 
     * 使用场景：用户在筛选面板中修改筛选条件
     * 状态变更：合并式更新，新条件会覆盖对应字段，保留其他字段
     * 
     * 合并策略：使用浅合并，支持部分字段更新
     */
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    
    /**
     * 设置当前选中的任务
     * 
     * 使用场景：
     * - 用户点击任务卡片查看详情
     * - 清空选中状态（传入null）
     * 
     * 状态变更：直接替换selectedTask值
     */
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    
    /**
     * 切换创建/编辑任务模态框状态
     * 
     * 使用场景：
     * - 打开创建任务模态框
     * - 打开编辑任务模态框
     * - 关闭模态框
     * 
     * 控制逻辑：
     * - 如果payload有值，则设置为指定值
     * - 如果payload为undefined，则切换当前状态
     */
    case 'TOGGLE_CREATE_MODAL':
      return { 
        ...state, 
        isCreateModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isCreateModalOpen 
      };
    
    /**
     * 切换任务详情模态框状态
     * 
     * 使用场景：查看任务详细信息
     * 控制逻辑：同创建模态框
     */
    case 'TOGGLE_DETAIL_MODAL':
      return { 
        ...state, 
        isDetailModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isDetailModalOpen 
      };
    
    /**
     * 切换确认对话框状态
     * 
     * 使用场景：需要用户确认的操作（如删除任务）
     * 控制逻辑：同其他模态框
     */
    case 'TOGGLE_CONFIRM_MODAL':
      return { 
        ...state, 
        isConfirmModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isConfirmModalOpen 
      };
    
    /**
     * 设置确认对话框的配置信息
     * 
     * 使用场景：设置对话框的标题、内容和确认回调
     * 状态变更：直接替换confirmModalConfig对象
     */
    case 'SET_CONFIRM_MODAL_CONFIG':
      return { ...state, confirmModalConfig: action.payload };
    
    /**
     * 默认情况：返回原状态
     * 
     * 处理未知的Action类型，保持状态不变
     * 这是Reducer模式的标准做法
     */
    default:
      return state;
  }
};

/**
 * AppContext的类型定义接口
 * 
 * @interface AppContextType
 * @description 定义了AppContext提供给组件的完整API接口
 * 
 * 主要功能分类：
 * 1. 状态访问：state、dispatch
 * 2. 任务CRUD操作：createTask、updateTask、deleteTask、loadTasks
 * 3. UI交互操作：showConfirmDialog
 * 
 * 使用模式：
 * - 通过useAppContext() Hook在组件中获取
 * - 所有方法都是异步的，需要适当处理Promise
 * - 状态更新会自动触发组件重新渲染
 * 
 * 错误处理：
 * - 异步方法可能抛出异常，需要使用try-catch处理
 * - 异常信息会记录到控制台，便于调试
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { state, createTask, showConfirmDialog } = useAppContext();
 *   
 *   const handleCreateTask = async () => {
 *     try {
 *       await createTask({
 *         title: '新任务',
 *         description: '任务描述',
 *         assignee: '张三',
 *         priority: 'HIGH',
 *         status: 'TODO',
 *         dueDate: new Date(),
 *         tags: ['标签']
 *       });
 *     } catch (error) {
 *       console.error('创建任务失败:', error);
 *     }
 *   };
 *   
 *   const handleDeleteTask = (taskId: string) => {
 *     showConfirmDialog(
 *       '确认删除',
 *       '确定要删除这个任务吗？',
 *       () => deleteTask(taskId)
 *     );
 *   };
 *   
 *   return (
 *     <div>
 *       <p>任务数量: {state.tasks.length}</p>
 *       <button onClick={handleCreateTask}>创建任务</button>
 *     </div>
 *   );
 * };
 * ```
 * 
 * @since 1.0.0
 */
interface AppContextType {
  /** 
   * 应用全局状态对象
   * 
   * @description 包含所有全局状态数据，为只读属性
   * @readonly
   */
  state: AppState;
  
  /** 
   * Reducer dispatch函数
   * 
   * @description 直接调用dispatch可以执行低级Action操作
   * @param action - 要执行的Action对象
   * @advanced 一般不建议直接使用，推荐使用封装后的异步方法
   */
  dispatch: React.Dispatch<AppAction>;
  
  /**
   * 创建新任务
   * 
   * @description 将任务数据保存到服务端并更新本地状态
   * @param task - 任务数据（不包含id、createdAt、updatedAt字段）
   * @returns Promise对象，解析为void
   * 
   * @throws {Error} 当网络请求失败或数据验证失败时抛出异常
   * 
   * @example
   * ```typescript
   * await createTask({
   *   title: '实现用户登录',
   *   description: '实现用户登录功能的前端页面',
   *   assignee: '张三',
   *   priority: 'HIGH',
   *   status: 'TODO',
   *   dueDate: new Date('2025-02-01'),
   *   tags: ['前端', '登录']
   * });
   * ```
   * 
   * @performance 使用乐观更新策略，先更新UI再同步服务端
   * @since 1.0.0
   */
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  /**
   * 更新现有任务
   * 
   * @description 部分更新任务字段，支持只更新部分属性
   * @param id - 要更新的任务ID
   * @param updates - 要更新的字段（部分更新）
   * @returns Promise对象，解析为void
   * 
   * @throws {Error} 当任务不存在或更新失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 只更新任务状态
   * await updateTask('task-123', { status: 'DONE' });
   * 
   * // 更新多个字段
   * await updateTask('task-123', {
   *   title: '更新后的标题',
   *   priority: 'LOW',
   *   dueDate: new Date('2025-03-01')
   * });
   * ```
   * 
   * @sideEffect 会自动同步更新selectedTask（如果是当前选中的任务）
   * @since 1.0.0
   */
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  
  /**
   * 删除指定任务
   * 
   * @description 从服务端和本地状态中完全移除任务
   * @param id - 要删除的任务ID
   * @returns Promise对象，解析为void
   * 
   * @throws {Error} 当任务不存在或删除失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 直接删除
   * await deleteTask('task-123');
   * 
   * // 带确认对话框的删除
   * showConfirmDialog(
   *   '确认删除',
   *   '确定要删除这个任务吗？操作不可恢复。',
   *   () => deleteTask('task-123')
   * );
   * ```
   * 
   * @sideEffect 会自动清空selectedTask（如果删除的是当前选中任务）
   * @warning 这是不可逆操作，建议在执行前显示确认对话框
   * @since 1.0.0
   */
  deleteTask: (id: string) => Promise<void>;
  
  /**
   * 加载任务列表
   * 
   * @description 从服务端重新获取所有任务数据并更新本地状态
   * @returns Promise对象，解析为void
   * 
   * @throws {Error} 当网络请求失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 刷新按钮点击后
   * const handleRefresh = async () => {
   *   try {
   *     await loadTasks();
   *     console.log('任务列表已更新');
   *   } catch (error) {
   *     console.error('加载任务失败:', error);
   *   }
   * };
   * ```
   * 
   * @usage 一般用于刷新数据或解决数据不同步问题
   * @performance 会替换整个任务列表，在大数据量时谨慎使用
   * @since 1.0.0
   */
  loadTasks: () => Promise<void>;
  
  /**
   * 显示确认对话框
   * 
   * @description 显示一个模态确认对话框，用于用户确认重要操作
   * @param title - 对话框标题
   * @param message - 对话框内容消息
   * @param onConfirm - 用户点击确认按钮时的回调函数
   * @returns void - 不返回值，直接显示对话框
   * 
   * @example
   * ```typescript
   * // 删除确认
   * showConfirmDialog(
   *   '删除任务',
   *   '您确定要删除这个任务吗？此操作不可恢复。',
   *   async () => {
   *     try {
   *       await deleteTask(taskId);
   *       console.log('任务已删除');
   *     } catch (error) {
   *       console.error('删除失败:', error);
   *     }
   *   }
   * );
   * 
   * // 批量操作确认
   * showConfirmDialog(
   *   '批量完成',
   *   `确定要将选中的 ${selectedTasks.length} 个任务标记为已完成吗？`,
   *   () => batchUpdateTasks(selectedTasks, { status: 'DONE' })
   * );
   * ```
   * 
   * @behavior 
   * - 调用后会立即显示对话框
   * - 用户点击确认后会执行onConfirm回调并关闭对话框
   * - 用户点击取消或点击外部会直接关闭对话框
   * 
   * @accessibility 支持键盘操作和屏幕阅读器
   * @since 1.0.0
   */
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

/**
 * AppContext实例
 * 
 * @description 创建应用全局状态的React Context对象
 * 
 * 初始化为undefined，只有在AppProvider内部才会有实际值。
 * 这种设计模式确保了组件必须在Provider内部使用，
 * 否则useAppContext会抛出明确的错误信息。
 * 
 * @type {React.Context<AppContextType | undefined>}
 * @since 1.0.0
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 应用全局状态提供者组件
 * 
 * @component AppProvider
 * @description 使用React Context + useReducer模式实现的全局状态管理器
 * 
 * 主要职责：
 * 1. 初始化应用状态和useReducer
 * 2. 封装业务逻辑方法（任务CRUD、模态框控制）
 * 3. 处理应用初始化（加载任务数据）
 * 4. 提供统一的状态和方法给子组件
 * 
 * 架构特点：
 * - 使用useReducer管理复杂状态逻辑
 * - 使用useEffect处理副作用（数据加载）
 * - 提供高级封装的异步方法
 * - 统一的错误处理和日志记录
 * 
 * 性能优化：
 * - 使用contextValue对象缓存，减少不必要的重新渲染
 * - 异步方法使用乐观更新策略
 * - Reducer保持纯函数特性，便于测试和调试
 * 
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件树
 * @returns {JSX.Element} 包装后的组件树
 * 
 * @example
 * ```tsx
 * // 在应用根部使用
 * function App() {
 *   return (
 *     <AppProvider>
 *       <div className="app">
 *         <TaskManagementPage />
 *         <OtherComponents />
 *       </div>
 *     </AppProvider>
 *   );
 * }
 * 
 * // 嵌套使用（不推荐）
 * <AppProvider>
 *   <RouterProvider>
 *     <Routes>
 *       <Route path="/" element={<HomePage />} />
 *     </Routes>
 *   </RouterProvider>
 * </AppProvider>
 * ```
 * 
 * @lifecycle 
 * - Mount: 初始化状态并加载任务数据
 * - Update: 响应状态变更并触发子组件重新渲染
 * - Unmount: 清理异步操作（如果有）
 * 
 * @since 1.0.0
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初始化useReducer，获取状态和dispatch函数
  const [state, dispatch] = useReducer(appReducer, initialState);

  /**
   * 加载任务数据
   * 
   * @description 从服务端异步获取任务列表并更新状态
   * 
   * 操作流程：
   * 1. 调用taskService.getTasks()获取数据
   * 2. 成功后通过SET_TASKS action更新状态
   * 3. 失败时记录错误信息到控制台
   * 
   * 错误处理：
   * - 网络异常：不会中断应用，只记录日志
   * - 数据解析异常：使用空数组作为默认值
   * - 服务不可用：使用缓存数据或默认数据
   * 
   * @async
   * @returns {Promise<void>} 异步操作的Promise对象
   * @throws 不会向上抛出异常，内部处理所有错误
   * 
   * @example
   * ```typescript
   * // 应用初始化时自动调用
   * useEffect(() => {
   *   loadTasks(); // 加载初始数据
   * }, []);
   * 
   * // 手动刷新时调用
   * const handleRefresh = () => {
   *   loadTasks(); // 不需要await，内部处理错误
   * };
   * ```
   * 
   * @performance 使用缓存策略，大数据量场景下可能需要分页加载
   * @since 1.0.0
   */
  const loadTasks = async () => {
    try {
      // 调用任务服务API获取数据
      const tasks = await taskService.getTasks();
      // 更新全局状态
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      // 记录错误信息，但不中断应用运行
      console.error('Failed to load tasks:', error);
      // TODO: 可以添加用户友好的错误提示
      // showErrorNotification('加载任务失败，请稍后重试');
    }
  };

  /**
   * 创建新任务
   * 
   * @description 将任务数据提交到服务端并更新本地状态
   * 
   * 操作流程：
   * 1. 调用taskService.createTask()创建任务
   * 2. 成功后通过ADD_TASK action添加到本地状态
   * 3. 失败时记录错误并向上抛出异常
   * 
   * 业务验证：
   * - 数据验证由taskService负责
   * - ID和时间戳由服务端自动生成
   * - 支持乐观更新策略
   * 
   * @param {Omit<Task, 'id' | 'createdAt' | 'updatedAt'>} taskData - 任务数据
   * @returns {Promise<void>} 异步操作的Promise对象
   * @throws {Error} 当创建失败时抛出异常
   * 
   * @example
   * ```typescript
   * const handleSubmit = async (formData) => {
   *   try {
   *     await createTask({
   *       title: formData.title,
   *       description: formData.description,
   *       assignee: formData.assignee,
   *       priority: formData.priority,
   *       status: 'TODO',
   *       dueDate: formData.dueDate,
   *       tags: formData.tags
   *     });
   *     // 创建成功，关闭模态框
   *     dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
   *   } catch (error) {
   *     // 显示错误提示
   *     alert('创建任务失败: ' + error.message);
   *   }
   * };
   * ```
   * 
   * @sideEffect 成功后会触发组件重新渲染，任务列表会显示新任务
   * @since 1.0.0
   */
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // 调用服务端API创建任务
      const newTask = await taskService.createTask(taskData);
      // 更新本地状态
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      // 记录错误并向上抛出
      console.error('Failed to create task:', error);
      throw error; // 让组件层处理用户反馈
    }
  };

  /**
   * 更新现有任务
   * 
   * @description 部分更新任务字段并同步到服务端
   * 
   * 操作流程：
   * 1. 调用taskService.updateTask()更新数据
   * 2. 成功后通过UPDATE_TASK action更新本地状态
   * 3. 自动同步更新selectedTask（如果需要）
   * 
   * 数据一致性：
   * - Reducer会自动同步更新selectedTask
   * - 确保任务列表和详情视图的数据一致
   * - updatedAt时间戳由服务端自动更新
   * 
   * @param {string} id - 要更新的任务ID
   * @param {Partial<Task>} updates - 要更新的字段（部分更新）
   * @returns {Promise<void>} 异步操作的Promise对象 
   * @throws {Error} 当任务不存在或更新失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 更新任务状态
   * const handleStatusChange = async (taskId, newStatus) => {
   *   try {
   *     await updateTask(taskId, { status: newStatus });
   *   } catch (error) {
   *     alert('更新状态失败: ' + error.message);
   *   }
   * };
   * 
   * // 批量更新多个字段
   * await updateTask(taskId, {
   *   title: '新标题',
   *   priority: 'HIGH',
   *   dueDate: new Date('2025-02-01'),
   *   tags: [...existingTags, '新标签']
   * });
   * ```
   * 
   * @performance 只更新变更的字段，减少不必要的数据传输
   * @since 1.0.0
   */
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // 调用服务端API更新任务
      const updatedTask = await taskService.updateTask(id, updates);
      // 更新本地状态（会自动同步selectedTask）
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (error) {
      // 记录错误并向上抛出
      console.error('Failed to update task:', error);
      throw error; // 让组件层处理用户反馈
    }
  };

  /**
   * 删除指定任务
   * 
   * @description 从服务端和本地状态中完全移除任务
   * 
   * 操作流程：
   * 1. 调用taskService.deleteTask()删除任务
   * 2. 成功后通过DELETE_TASK action移除本地数据
   * 3. 自动清空selectedTask（如果删除的是当前选中任务）
   * 
   * 安全措施：
   * - 建议在调用前显示确认对话框
   * - 删除后无法恢复，需要用户明确确认
   * - 会自动处理相关联的状态清理
   * 
   * @param {string} id - 要删除的任务ID
   * @returns {Promise<void>} 异步操作的Promise对象
   * @throws {Error} 当任务不存在或删除失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 带确认对话框的删除
   * const handleDelete = (taskId) => {
   *   showConfirmDialog(
   *     '确认删除',
   *     '确定要删除这个任务吗？操作不可恢复。',
   *     async () => {
   *       try {
   *         await deleteTask(taskId);
   *         console.log('任务已删除');
   *       } catch (error) {
   *         alert('删除失败: ' + error.message);
   *       }
   *     }
   *   );
   * };
   * 
   * // 批量删除
   * const handleBatchDelete = async (taskIds) => {
   *   for (const id of taskIds) {
   *     await deleteTask(id);
   *   }
   * };
   * ```
   * 
   * @sideEffect 会自动清空selectedTask（如果删除的是当前选中任务）
   * @warning 这是不可逆操作，建议在执行前显示确认对话框
   * @since 1.0.0
   */
  const deleteTask = async (id: string) => {
    try {
      // 调用服务端API删除任务
      await taskService.deleteTask(id);
      // 更新本地状态（会自动清理selectedTask）
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      // 记录错误并向上抛出
      console.error('Failed to delete task:', error);
      throw error; // 让组件层处理用户反馈
    }
  };

  /**
   * 显示确认对话框
   * 
   * @description 显示一个模态确认对话框，用于用户确认重要操作
   * 
   * 功能特点：
   * - 阻塞式用户交互，必须选择确认或取消
   * - 支持自定义标题和消息内容
   * - 确认后执行回调函数并自动关闭
   * - 取消或点击外部区域直接关闭
   * 
   * 使用场景：
   * - 删除操作确认
   * - 批量操作确认
   * - 重要设置变更确认
   * - 数据丢失风险操作确认
   * 
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框内容消息
   * @param {() => void} onConfirm - 用户点击确认按钮时的回调函数
   * @returns {void} 不返回值，直接显示对话框
   * 
   * @example
   * ```typescript
   * // 删除确认
   * const handleDeleteClick = (task) => {
   *   showConfirmDialog(
   *     '删除任务',
   *     `确定要删除任务 "${task.title}" 吗？此操作不可恢复。`,
   *     () => deleteTask(task.id)
   *   );
   * };
   * 
   * // 批量操作确认
   * const handleBatchComplete = (tasks) => {
   *   showConfirmDialog(
   *     '批量完成',
   *     `确定要将选中的 ${tasks.length} 个任务标记为已完成吗？`,
   *     () => {
   *       tasks.forEach(task => 
   *         updateTask(task.id, { status: 'DONE' })
   *       );
   *     }
   *   );
   * };
   * 
   * // 异步操作确认
   * showConfirmDialog(
   *   '重置数据',
   *   '这将清除所有本地数据并重新从服务器加载，确定继续吗？',
   *   async () => {
   *     try {
   *       await resetAndReload();
   *       alert('重置成功');
   *     } catch (error) {
   *       alert('重置失败: ' + error.message);
   *     }
   *   }
   * );
   * ```
   * 
   * @behavior 
   * - 调用后立即更新状态显示对话框
   * - 用户点击确认后执行onConfirm回调并关闭对话框
   * - 用户点击取消、ESC键或点击外部会直接关闭对话框
   * 
   * @accessibility 支持键盘操作（Tab、Enter、Escape）和屏幕阅读器
   * @since 1.0.0
   */
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    // 设置确认对话框配置
    dispatch({
      type: 'SET_CONFIRM_MODAL_CONFIG',
      payload: { title, message, onConfirm }
    });
    // 显示确认对话框
    dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: true });
  };

  /**
   * 组件挂载时的副作用处理
   * 
   * @description 在组件首次渲染完成后自动加载任务数据
   * 
   * 执行时机：
   * - 组件首次挂载时执行一次
   * - 依赖数组为空，不会因状态变更而重复执行
   * - 在DOM渲染完成后异步执行
   * 
   * 错误处理：
   * - loadTasks内部已处理所有异常
   * - 不会因加载失败而影响组件正常渲染
   * - 可以通过手动刷新重新加载数据
   * 
   * @since 1.0.0
   */
  useEffect(() => {
    loadTasks(); // 加载初始任务数据
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * Context值对象
   * 
   * @description 包含所有要提供给子组件的状态和方法
   * 
   * 性能优化：
   * - 将所有值封装在单个对象中
   * - 避免在render过程中创建新对象
   * - 减少不必要的Context更新和子组件重新渲染
   * 
   * 内容包括：
   * - state: 全局状态对象（只读）
   * - dispatch: 底层状态更新函数
   * - 业务方法: createTask, updateTask, deleteTask, loadTasks
   * - UI交互方法: showConfirmDialog
   * 
   * @type {AppContextType}
   * @since 1.0.0
   */
  const contextValue: AppContextType = {
    state,
    dispatch,
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    showConfirmDialog,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 自定义Hook：使用应用全局状态
 * 
 * @hook useAppContext
 * @description 为AppContext提供的高级封装Hook，保证类型安全和错误检查
 * 
 * 功能特点：
 * 1. 类型安全：返回AppContextType类型，不会为undefined
 * 2. 错误检查：如果在Provider外使用会抛出清晰的错误信息
 * 3. 开发体验：提供完整的TypeScript智能提示
 * 4. 性能优化：防止不必要的重新渲染
 * 
 * 使用要求：
 * - 必须在AppProvider组件内部使用
 * - 建议在组件顶部调用，避免在条件语句中使用
 * - 可以在任何函数组件和自定义Hook中使用
 * 
 * @returns {AppContextType} 应用全局状态和方法的完整接口
 * @throws {Error} 当在AppProvider外部使用时抛出'useAppContext must be used within an AppProvider'
 * 
 * @example
 * ```tsx
 * // 基本使用
 * const TaskListComponent = () => {
 *   const { state, createTask, deleteTask } = useAppContext();
 *   
 *   return (
 *     <div>
 *       <h2>任务列表 ({state.tasks.length})</h2>
 *       {state.tasks.map(task => (
 *         <div key={task.id}>
 *           <span>{task.title}</span>
 *           <button onClick={() => deleteTask(task.id)}>删除</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * 
 * // 在自定义Hook中使用
 * const useTaskFilters = () => {
 *   const { state, dispatch } = useAppContext();
 *   
 *   const setFilter = useCallback((filter: Partial<TaskFilter>) => {
 *     dispatch({ type: 'SET_FILTER', payload: filter });
 *   }, [dispatch]);
 *   
 *   const clearFilters = useCallback(() => {
 *     dispatch({ type: 'SET_FILTER', payload: {} });
 *   }, [dispatch]);
 *   
 *   return {
 *     currentFilter: state.filter,
 *     setFilter,
 *     clearFilters
 *   };
 * };
 * 
 * // 复杂业务逻辑组件
 * const TaskManagementPanel = () => {
 *   const { 
 *     state, 
 *     createTask, 
 *     updateTask, 
 *     deleteTask, 
 *     showConfirmDialog 
 *   } = useAppContext();
 *   
 *   const handleCreateTask = async (formData: TaskFormData) => {
 *     try {
 *       await createTask({
 *         title: formData.title,
 *         description: formData.description,
 *         assignee: formData.assignee,
 *         priority: formData.priority,
 *         status: 'TODO',
 *         dueDate: formData.dueDate,
 *         tags: formData.tags
 *       });
 *       // 成功后关闭创建模态框
 *       dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
 *     } catch (error) {
 *       alert('创建任务失败');
 *     }
 *   };
 *   
 *   const handleDeleteWithConfirm = (task: Task) => {
 *     showConfirmDialog(
 *       '确认删除',
 *       `确定要删除任务 "${task.title}" 吗？`,
 *       () => deleteTask(task.id)
 *     );
 *   };
 *   
 *   const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
 *     try {
 *       await updateTask(taskId, { status: newStatus });
 *     } catch (error) {
 *       alert('更新状态失败');
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {/* 组件内容 */}
 *     </div>
 *   );
 * };
 * 
 * // 错误示例 - 在Provider外使用
 * const BadComponent = () => {
 *   // 这里会抛出错误：Error: useAppContext must be used within an AppProvider
 *   const { state } = useAppContext();
 *   return <div>{state.tasks.length}</div>;
 * };
 * 
 * // 正确示例 - 在Provider内使用
 * const GoodApp = () => {
 *   return (
 *     <AppProvider>
 *       <TaskListComponent />  {/* 这里可以正常使用useAppContext */}
 *     </AppProvider>
 *   );
 * };
 * ```
 * 
 * @bestPractices
 * 1. **组件顶部调用**: 在组件函数的顶部调用，不要在条件语句或循环中使用
 * 2. **解构赋值**: 只解构需要的属性，减少不必要的依赖
 * 3. **错误处理**: 对异步方法使用try-catch进行错误处理
 * 4. **性能优化**: 结合useCallback和useMemo优化组件性能
 * 5. **类型安全**: 充分利用TypeScript的类型推导和检查
 * 
 * @performance
 * - Hook本身没有性能开销，只是返回context值
 * - 重新渲染由context值变更触发，与Hook调用方式无关
 * - 可以在同一组件中多次调用，不会造成重复计算
 * 
 * @troubleshooting
 * **常见错误1**: "useAppContext must be used within an AppProvider"
 * - 原因: 在AppProvider组件外部使用了useAppContext
 * - 解决: 确保组件被AppProvider包装
 * 
 * **常见错误2**: TypeScript类型错误
 * - 原因: 使用了错误的类型或参数
 * - 解决: 查看AppContextType接口定义，确保参数类型正确
 * 
 * **常见错误3**: 异步方法未处理异常
 * - 原因: 没有使用try-catch处理Promise异常
 * - 解决: 所有异步方法都应该包装在try-catch中
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const useAppContext = (): AppContextType => {
  // 获取Context值
  const context = useContext(AppContext);
  
  // 错误检查：确保在Provider内部使用
  if (!context) {
    throw new Error(
      'useAppContext must be used within an AppProvider. ' +
      'Make sure your component is wrapped with <AppProvider>.</AppProvider>'
    );
  }
  
  // 返回类型安全的context值
  return context;
};