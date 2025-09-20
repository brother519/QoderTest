/**
 * AppContext.tsx - 应用全局状态管理Context实现
 * 
 * 文件功能概述：
 * - 提供应用级别的全局状态管理，采用React Context API + useReducer模式
 * - 统一管理任务状态、模态框状态、过滤器配置等全局共享数据
 * - 为整个应用提供统一的状态访问接口和状态变更方法
 * 
 * 核心职责：
 * - 任务管理：任务的增删改查、状态变更、批量操作
 * - 模态框状态：确认对话框、提示框等UI状态管理
 * - 过滤器管理：全局搜索、筛选条件的状态维护
 * - 应用设置：主题、语言、用户偏好等配置管理
 * 
 * 使用场景：
 * - 跨组件的状态共享和通信
 * - 复杂业务逻辑的集中管理
 * - 应用级别的数据持久化和同步
 * 
 * 依赖说明：
 * - React Context API：用于跨组件状态共享
 * - useReducer Hook：实现复杂状态逻辑管理
 * - 现有Store系统：与Zustand store进行集成协作
 * 
 * 技术架构：
 * - 采用单一状态树设计，所有状态集中管理
 * - 使用不可变数据更新模式，确保状态一致性
 * - 支持异步操作和错误处理机制
 * - 提供TypeScript类型安全保障
 * 
 * @author 系统生成
 * @version 1.0.0
 * @since 2024-09-20
 * @lastModified 2024-09-20
 */

/* ========== 依赖导入分组 ========== */

// React核心功能导入 - 提供Context、Reducer、Effect等核心Hook
import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback,
  useMemo 
} from 'react';

// TypeScript类型定义导入 - 应用内部类型系统
import type { 
  Product, 
  CartItem, 
  User, 
  Comment, 
  SearchFilters,
  Order 
} from './types/index.js';

/* ========== 应用状态类型定义 ========== */

/**
 * 任务数据模型
 * 定义应用中任务实体的完整数据结构
 */
export interface Task {
  /** 任务唯一标识符 */
  id: string;
  /** 任务标题，简短描述任务内容 */
  title: string;
  /** 任务详细描述，包含具体要求和说明 */
  description: string;
  /** 任务当前状态：待处理、进行中、已完成、已取消 */
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  /** 任务优先级：高、中、低 */
  priority: 'high' | 'medium' | 'low';
  /** 任务创建时间戳 */
  createdAt: Date;
  /** 任务最后更新时间戳 */
  updatedAt: Date;
  /** 任务截止时间，可选字段 */
  dueDate?: Date;
  /** 任务分类标签，用于筛选和归类 */
  tags: string[];
  /** 任务负责人ID，关联用户数据 */
  assigneeId?: string;
}

/**
 * 确认对话框配置
 * 定义确认对话框的显示内容和回调处理
 */
export interface ConfirmDialog {
  /** 对话框是否显示 */
  isVisible: boolean;
  /** 对话框标题文本 */
  title: string;
  /** 对话框内容描述 */
  message: string;
  /** 确认按钮文本，默认为"确认" */
  confirmText?: string;
  /** 取消按钮文本，默认为"取消" */
  cancelText?: string;
  /** 确认操作回调函数 */
  onConfirm?: () => void;
  /** 取消操作回调函数 */
  onCancel?: () => void;
  /** 对话框类型：信息、警告、错误、成功 */
  type?: 'info' | 'warning' | 'error' | 'success';
}

/**
 * 应用全局状态接口
 * 定义整个应用的状态树结构，包含所有共享状态
 */
export interface AppState {
  /* ===== 任务管理状态 ===== */
  /** 任务列表数据，存储所有任务信息 */
  tasks: Task[];
  /** 当前选中的任务，用于详情显示和编辑 */
  currentTask: Task | null;
  /** 任务筛选条件，控制任务列表的显示 */
  taskFilters: {
    /** 按状态筛选 */
    status?: Task['status'];
    /** 按优先级筛选 */
    priority?: Task['priority'];
    /** 按标签筛选 */
    tags?: string[];
    /** 搜索关键词 */
    searchKeyword?: string;
  };

  /* ===== UI状态管理 ===== */
  /** 确认对话框状态配置 */
  confirmDialog: ConfirmDialog;
  /** 全局加载状态，用于显示加载指示器 */
  loading: boolean;
  /** 错误信息状态，用于全局错误提示 */
  error: string | null;
  /** 成功提示信息 */
  successMessage: string | null;

  /* ===== 应用设置状态 ===== */
  /** 应用主题配置：亮色、暗色、自动 */
  theme: 'light' | 'dark' | 'auto';
  /** 应用语言设置 */
  language: 'zh-CN' | 'en-US';
  /** 侧边栏是否展开 */
  sidebarCollapsed: boolean;
  /** 用户偏好设置 */
  userPreferences: {
    /** 每页显示条数 */
    pageSize: number;
    /** 默认排序方式 */
    defaultSort: string;
    /** 自动保存间隔（分钟） */
    autoSaveInterval: number;
  };
}

/**
 * 状态变更动作类型定义
 * 定义所有可能的状态变更操作，遵循Redux风格的Action模式
 */
export type AppAction =
  /* ===== 任务相关动作 ===== */
  /** 设置任务列表 */
  | { type: 'SET_TASKS'; payload: Task[] }
  /** 添加新任务 */
  | { type: 'ADD_TASK'; payload: Task }
  /** 更新任务信息 */
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  /** 删除任务 */
  | { type: 'DELETE_TASK'; payload: string }
  /** 设置当前任务 */
  | { type: 'SET_CURRENT_TASK'; payload: Task | null }
  /** 更新任务筛选条件 */
  | { type: 'UPDATE_TASK_FILTERS'; payload: Partial<AppState['taskFilters']> }
  /** 清空任务筛选 */
  | { type: 'CLEAR_TASK_FILTERS' }

  /* ===== UI状态动作 ===== */
  /** 显示确认对话框 */
  | { type: 'SHOW_CONFIRM_DIALOG'; payload: Omit<ConfirmDialog, 'isVisible'> }
  /** 隐藏确认对话框 */
  | { type: 'HIDE_CONFIRM_DIALOG' }
  /** 设置加载状态 */
  | { type: 'SET_LOADING'; payload: boolean }
  /** 设置错误信息 */
  | { type: 'SET_ERROR'; payload: string | null }
  /** 设置成功信息 */
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  /** 清除所有提示信息 */
  | { type: 'CLEAR_MESSAGES' }

  /* ===== 应用设置动作 ===== */
  /** 切换主题 */
  | { type: 'TOGGLE_THEME' }
  /** 设置主题 */
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  /** 设置语言 */
  | { type: 'SET_LANGUAGE'; payload: AppState['language'] }
  /** 切换侧边栏状态 */
  | { type: 'TOGGLE_SIDEBAR' }
  /** 更新用户偏好 */
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<AppState['userPreferences']> };

/* ========== Context接口定义 ========== */

/**
 * AppContext接口定义
 * 定义Context提供给消费组件的完整API接口
 */
export interface AppContextType {
  /* ===== 状态访问接口 ===== */
  /** 当前应用状态 */
  state: AppState;

  /* ===== 任务管理方法 ===== */
  /** 
   * 加载任务列表
   * 从服务端或本地存储加载任务数据
   */
  loadTasks: () => Promise<void>;
  
  /** 
   * 创建新任务
   * @param taskData 新任务数据
   * @returns 创建成功的任务对象
   */
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  
  /** 
   * 更新任务信息
   * @param taskId 任务ID
   * @param updates 更新的字段
   */
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  
  /** 
   * 删除任务
   * @param taskId 任务ID
   */
  deleteTask: (taskId: string) => Promise<void>;
  
  /** 
   * 设置当前选中任务
   * @param task 任务对象或null
   */
  setCurrentTask: (task: Task | null) => void;

  /* ===== UI交互方法 ===== */
  /** 
   * 显示确认对话框
   * @param config 对话框配置
   */
  showConfirmDialog: (config: Omit<ConfirmDialog, 'isVisible'>) => void;
  
  /** 隐藏确认对话框 */
  hideConfirmDialog: () => void;
  
  /** 
   * 显示成功提示
   * @param message 提示信息
   */
  showSuccess: (message: string) => void;
  
  /** 
   * 显示错误提示
   * @param message 错误信息
   */
  showError: (message: string) => void;
  
  /** 清除所有提示信息 */
  clearMessages: () => void;

  /* ===== 应用设置方法 ===== */
  /** 切换应用主题 */
  toggleTheme: () => void;
  
  /** 
   * 设置应用主题
   * @param theme 主题名称
   */
  setTheme: (theme: AppState['theme']) => void;
  
  /** 
   * 设置应用语言
   * @param language 语言代码
   */
  setLanguage: (language: AppState['language']) => void;
  
  /** 切换侧边栏展开状态 */
  toggleSidebar: () => void;
  
  /** 
   * 更新用户偏好设置
   * @param preferences 偏好配置
   */
  updateUserPreferences: (preferences: Partial<AppState['userPreferences']>) => void;
}

/* ========== 初始状态定义 ========== */

/**
 * 应用初始状态配置
 * 定义应用启动时的默认状态值，确保所有状态都有合理的初始值
 */
const initialState: AppState = {
  /* ===== 任务管理初始状态 ===== */
  tasks: [], // 初始任务列表为空，等待从存储或API加载
  currentTask: null, // 初始未选中任何任务
  taskFilters: {
    // 初始筛选条件为空，显示所有任务
    status: undefined,
    priority: undefined,
    tags: [],
    searchKeyword: ''
  },

  /* ===== UI状态初始值 ===== */
  confirmDialog: {
    isVisible: false, // 对话框初始隐藏
    title: '',
    message: '',
    confirmText: '确认',
    cancelText: '取消',
    type: 'info'
  },
  loading: false, // 应用初始不处于加载状态
  error: null, // 初始无错误信息
  successMessage: null, // 初始无成功提示

  /* ===== 应用设置初始值 ===== */
  theme: 'light', // 默认使用亮色主题
  language: 'zh-CN', // 默认使用中文
  sidebarCollapsed: false, // 侧边栏初始展开
  userPreferences: {
    pageSize: 20, // 默认每页显示20条记录
    defaultSort: 'createdAt_desc', // 默认按创建时间倒序
    autoSaveInterval: 5 // 默认5分钟自动保存间隔
  }
};

/* ========== Reducer函数实现 ========== */

/**
 * 应用状态Reducer函数
 * 根据不同的Action类型执行相应的状态变更逻辑
 * 严格遵循不可变数据更新原则，确保状态变更的可预测性
 * 
 * @param state 当前状态
 * @param action 状态变更动作
 * @returns 新的状态对象
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ===== 任务管理相关的状态变更 ===== */
    
    case 'SET_TASKS': {
      // 设置任务列表，通常用于初始化或重新加载任务数据
      // 确保任务按创建时间排序，保持列表的一致性
      const sortedTasks = [...action.payload].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...state,
        tasks: sortedTasks
      };
    }
    
    case 'ADD_TASK': {
      // 添加新任务到列表开头，保持最新任务在顶部
      // 使用展开运算符确保不直接修改原数组
      return {
        ...state,
        tasks: [action.payload, ...state.tasks]
      };
    }
    
    case 'UPDATE_TASK': {
      // 更新指定任务的信息，保持其他任务不变
      // 同时更新updatedAt时间戳，记录最后修改时间
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                ...updates, 
                updatedAt: new Date() // 自动更新修改时间
              }
            : task
        ),
        // 如果更新的是当前选中的任务，同步更新currentTask
        currentTask: state.currentTask?.id === id 
          ? { ...state.currentTask, ...updates, updatedAt: new Date() }
          : state.currentTask
      };
    }
    
    case 'DELETE_TASK': {
      // 从任务列表中移除指定任务
      // 如果删除的是当前选中任务，则清空currentTask
      const taskIdToDelete = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskIdToDelete),
        currentTask: state.currentTask?.id === taskIdToDelete ? null : state.currentTask
      };
    }
    
    case 'SET_CURRENT_TASK': {
      // 设置当前选中的任务，用于详情显示或编辑
      return {
        ...state,
        currentTask: action.payload
      };
    }
    
    case 'UPDATE_TASK_FILTERS': {
      // 更新任务筛选条件，使用对象合并保持其他筛选条件
      return {
        ...state,
        taskFilters: {
          ...state.taskFilters,
          ...action.payload
        }
      };
    }
    
    case 'CLEAR_TASK_FILTERS': {
      // 清空所有筛选条件，恢复到初始状态
      return {
        ...state,
        taskFilters: {
          status: undefined,
          priority: undefined,
          tags: [],
          searchKeyword: ''
        }
      };
    }

    /* ===== UI状态相关的变更处理 ===== */
    
    case 'SHOW_CONFIRM_DIALOG': {
      // 显示确认对话框，合并传入的配置参数
      // 设置默认的按钮文本，如果没有提供的话
      return {
        ...state,
        confirmDialog: {
          ...action.payload,
          isVisible: true,
          confirmText: action.payload.confirmText || '确认',
          cancelText: action.payload.cancelText || '取消',
          type: action.payload.type || 'info'
        }
      };
    }
    
    case 'HIDE_CONFIRM_DIALOG': {
      // 隐藏确认对话框，重置对话框状态
      return {
        ...state,
        confirmDialog: {
          ...state.confirmDialog,
          isVisible: false,
          onConfirm: undefined, // 清除回调函数，避免内存泄漏
          onCancel: undefined
        }
      };
    }
    
    case 'SET_LOADING': {
      // 设置全局加载状态，用于显示加载指示器
      return {
        ...state,
        loading: action.payload
      };
    }
    
    case 'SET_ERROR': {
      // 设置错误信息，通常用于API调用失败等场景
      // 设置错误时自动关闭加载状态
      return {
        ...state,
        error: action.payload,
        loading: false // 出现错误时关闭加载状态
      };
    }
    
    case 'SET_SUCCESS_MESSAGE': {
      // 设置成功提示信息，用于操作成功反馈
      return {
        ...state,
        successMessage: action.payload,
        loading: false // 成功时也关闭加载状态
      };
    }
    
    case 'CLEAR_MESSAGES': {
      // 清除所有提示信息，包括错误和成功提示
      return {
        ...state,
        error: null,
        successMessage: null
      };
    }

    /* ===== 应用设置相关的状态变更 ===== */
    
    case 'TOGGLE_THEME': {
      // 切换主题：亮色 <-> 暗色 (忽略自动模式)
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        theme: newTheme
      };
    }
    
    case 'SET_THEME': {
      // 直接设置指定主题
      return {
        ...state,
        theme: action.payload
      };
    }
    
    case 'SET_LANGUAGE': {
      // 设置应用语言，支持中英文切换
      return {
        ...state,
        language: action.payload
      };
    }
    
    case 'TOGGLE_SIDEBAR': {
      // 切换侧边栏展开/收起状态
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
    }
    
    case 'UPDATE_USER_PREFERENCES': {
      // 更新用户偏好设置，使用对象合并保持其他设置
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };
    }

    /* ===== 默认情况处理 ===== */
    default: {
      // 对于未知的action类型，返回当前状态不变
      // 在开发模式下可以添加警告日志
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unknown action type:', (action as any).type);
      }
      return state;
    }
  }
}

/* ========== Context创建和管理 ========== */

/**
 * 应用全局Context实例
 * 使用React.createContext创建全局状态共享的Context对象
 * 初始值设为undefined，在Provider中提供实际值
 * 这样设计可以在useContext时检测到未在Provider内使用的情况
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/* ========== 模拟服务层函数 ========== */

/**
 * 模拟任务服务函数
 * 在实际项目中，这些函数应该调用后端 API 或本地存储
 * 当前使用 localStorage 进行数据持久化，并模拟异步执行
 */

/**
 * 生成唯一ID
 * 使用时间戳和随机数组合生成简单的唯一标识符
 * @returns 唯一字符串ID
 */
const generateId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 从本地存储加载任务数据
 * @returns Promise<Task[]> 任务数组
 */
const loadTasksFromStorage = async (): Promise<Task[]> => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      try {
        const storedTasks = localStorage.getItem('app_tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        // 转换日期字符串为Date对象
        const parsedTasks = tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        resolve(parsedTasks);
      } catch (error) {
        console.error('加载任务数据失败:', error);
        resolve([]); // 错误时返回空数组
      }
    }, 300); // 模拟300ms网络延迟
  });
};

/**
 * 保存任务数据到本地存储
 * @param tasks 任务数组
 * @returns Promise<void>
 */
const saveTasksToStorage = async (tasks: Task[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        localStorage.setItem('app_tasks', JSON.stringify(tasks));
        resolve();
      } catch (error) {
        console.error('保存任务数据失败:', error);
        reject(error);
      }
    }, 100); // 模拟100ms写入延迟
  });
};

/* ========== AppContextProvider组件实现 ========== */

/**
 * AppContextProvider组件属性接口
 * 定义Provider组件接收的属性类型
 */
interface AppContextProviderProps {
  /** 子组件，Provider包裹的所有子组件 */
  children: React.ReactNode;
}

/**
 * 应用全局状态管理Provider组件
 * 
 * 组件职责：
 * - 初始化应用全局状态，使用useReducer管理复杂状态逻辑
 * - 提供状态访问和更新方法给子组件
 * - 处理异步操作和错误管理
 * - 管理数据持久化和同步
 * 
 * 生命周期：
 * - 组件挂载时自动加载本地存储的任务数据
 * - 组件卸载时清理定时器和事件监听器
 * 
 * 性能优化：
 * - 使用useMemo缓存Context值，避免不必要的重渲染
 * - 使用useCallback缓存方法引用，减少子组件重渲染
 * 
 * @param props 组件属性
 * @returns JSX.Element Provider组件
 */
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  /* ===== 状态初始化 ===== */
  
  // 使用useReducer管理复杂的全局状态
  // reducer模式相比useState更适合复杂状态管理
  const [state, dispatch] = useReducer(appReducer, initialState);

  /* ===== 组件初始化逐程 ===== */
  
  // 组件挂载时自动加载任务数据
  // 使用useEffect确保只在组件首次渲染时执行
  useEffect(() => {
    /**
     * 异步加载初始数据
     * 从本地存储恢复任务数据，实现数据持久化
     */
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true }); // 开始加载
        
        const tasks = await loadTasksFromStorage();
        dispatch({ type: 'SET_TASKS', payload: tasks });
        
        // 加载用户偏好设置
        const storedPreferences = localStorage.getItem('app_preferences');
        if (storedPreferences) {
          const preferences = JSON.parse(storedPreferences);
          dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
        }
        
        // 加载主题设置
        const storedTheme = localStorage.getItem('app_theme') as AppState['theme'];
        if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
          dispatch({ type: 'SET_THEME', payload: storedTheme });
        }
        
      } catch (error) {
        console.error('初始化数据失败:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '加载应用数据失败，请刷新页面重试' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false }); // 结束加载
      }
    };

    initializeData();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /* ===== 自动保存机制 ===== */
  
  // 任务数据变化时自动保存到本地存储
  // 使用防抖机制避免频繁写入
  useEffect(() => {
    // 跳过初始状态，只在数据变化时保存
    if (state.tasks.length === 0) return;
    
    /**
     * 防抖保存函数
     * 延迟500ms执行保存，避免频繁写入localStorage
     */
    const saveTimer = setTimeout(async () => {
      try {
        await saveTasksToStorage(state.tasks);
      } catch (error) {
        console.error('自动保存任务失败:', error);
        // 保存失败不影响用户操作，只记录日志
      }
    }, 500);

    // 清理函数，组件卸载或依赖变化时取消定时器
    return () => clearTimeout(saveTimer);
  }, [state.tasks]); // 依赖任务数组，任务变化时触发

  // 用户偏好设置变化时保存
  useEffect(() => {
    localStorage.setItem('app_preferences', JSON.stringify(state.userPreferences));
  }, [state.userPreferences]);

  // 主题设置变化时保存
  useEffect(() => {
    localStorage.setItem('app_theme', state.theme);
    // 应用主题到页面根元素
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  /* ===== 任务管理业务方法定义 ===== */
  
  /**
   * 加载任务列表数据
   */
  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_MESSAGES' });
      
      const tasks = await loadTasksFromStorage();
      dispatch({ type: 'SET_TASKS', payload: tasks });
      
      if (tasks.length > 0) {
        dispatch({ 
          type: 'SET_SUCCESS_MESSAGE', 
          payload: `成功加载 ${tasks.length} 个任务` 
        });
      }
      
    } catch (error) {
      console.error('加载任务失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: '加载任务数据失败' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  /**
   * 创建新任务
   */
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      if (!taskData.title?.trim()) {
        throw new Error('任务标题不能为空');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_MESSAGES' });
      
      const now = new Date();
      const newTask: Task = {
        id: generateId(),
        ...taskData,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        tags: taskData.tags || [],
        createdAt: now,
        updatedAt: now
      };
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
      
      dispatch({ 
        type: 'SET_SUCCESS_MESSAGE', 
        payload: `任务 "${newTask.title}" 创建成功` 
      });
      
      return newTask;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建任务失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  /**
   * 更新任务信息
   */
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const existingTask = state.tasks.find(task => task.id === taskId);
      if (!existingTask) {
        throw new Error('要更新的任务不存在');
      }
      
      if (updates.title !== undefined && !updates.title.trim()) {
        throw new Error('任务标题不能为空');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_MESSAGES' });
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      dispatch({ 
        type: 'UPDATE_TASK', 
        payload: { id: taskId, updates } 
      });
      
      dispatch({ 
        type: 'SET_SUCCESS_MESSAGE', 
        payload: `任务更新成功` 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新任务失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.tasks]);
  
  /**
   * 删除任务
   */
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      const taskToDelete = state.tasks.find(task => task.id === taskId);
      if (!taskToDelete) {
        throw new Error('要删除的任务不存在');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_MESSAGES' });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      
      dispatch({ 
        type: 'SET_SUCCESS_MESSAGE', 
        payload: `任务 "${taskToDelete.title}" 已删除` 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除任务失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.tasks]);
  
  /**
   * 设置当前选中的任务
   */
  const setCurrentTask = useCallback((task: Task | null): void => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: task });
  }, []);

  /* ===== UI交互业务方法定义 ===== */
  
  /**
   * 显示确认对话框
   */
  const showConfirmDialog = useCallback((config: Omit<ConfirmDialog, 'isVisible'>): void => {
    if (!config.title?.trim() || !config.message?.trim()) {
      console.warn('确认对话框的标题和内容不能为空');
      return;
    }
    
    dispatch({ type: 'SHOW_CONFIRM_DIALOG', payload: config });
  }, []);
  
  /**
   * 隐藏确认对话框
   */
  const hideConfirmDialog = useCallback((): void => {
    dispatch({ type: 'HIDE_CONFIRM_DIALOG' });
  }, []);
  
  /**
   * 显示成功提示
   */
  const showSuccess = useCallback((message: string): void => {
    if (!message?.trim()) return;
    
    dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: message.trim() });
    
    setTimeout(() => {
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: null });
    }, 3000);
  }, []);
  
  /**
   * 显示错误提示
   */
  const showError = useCallback((message: string): void => {
    if (!message?.trim()) return;
    dispatch({ type: 'SET_ERROR', payload: message.trim() });
  }, []);
  
  /**
   * 清除所有提示信息
   */
  const clearMessages = useCallback((): void => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  /* ===== 应用设置业务方法定义 ===== */
  
  /**
   * 切换应用主题
   */
  const toggleTheme = useCallback((): void => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);
  
  /**
   * 设置指定主题
   */
  const setTheme = useCallback((theme: AppState['theme']): void => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);
  
  /**
   * 设置应用语言
   */
  const setLanguage = useCallback((language: AppState['language']): void => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);
  
  /**
   * 切换侧边栏状态
   */
  const toggleSidebar = useCallback((): void => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  
  /**
   * 更新用户偏好设置
   */
  const updateUserPreferences = useCallback((preferences: Partial<AppState['userPreferences']>): void => {
    dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
  }, []);

  /* ===== Context值的性能优化 ===== */
  
  /**
   * Context提供的值对象
   * 使用useMemo缓存Context值，避免不必要的子组件重渲染
   * 只有在state或方法引用发生变化时才重新创建对象
   */
  const contextValue = useMemo((): AppContextType => ({
    // 状态访问接口
    state,
    
    // 任务管理方法
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setCurrentTask,
    
    // UI交互方法
    showConfirmDialog,
    hideConfirmDialog,
    showSuccess,
    showError,
    clearMessages,
    
    // 应用设置方法
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    updateUserPreferences
  }), [
    // 依赖列表：状态和所有方法引用
    state,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setCurrentTask,
    showConfirmDialog,
    hideConfirmDialog,
    showSuccess,
    showError,
    clearMessages,
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    updateUserPreferences
  ]);

  /* ===== 组件返回和Provider包裹 ===== */
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/* ========== Hook导出函数定义 ========== */

/**
 * 使用AppContext的自定义Hook
 * 
 * 功能说明：
 * - 提供类型安全的Context访问方式
 * - 自动检测是否在Provider范围内使用
 * - 返回完整的状态和方法接口
 * 
 * 使用场景：
 * - 在任何需要访问全局状态的组件中使用
 * - 替代直接使用useContext(AppContext)
 * - 提供更好的开发体验和错误提示
 * 
 * 使用示例：
 * ```tsx
 * function TaskList() {
 *   const { state, loadTasks, createTask } = useAppContext();
 *   
 *   // 访问任务列表
 *   const tasks = state.tasks;
 *   
 *   // 调用业务方法
 *   const handleCreateTask = async (taskData) => {
 *     try {
 *       await createTask(taskData);
 *     } catch (error) {
 *       console.error('创建任务失败:', error);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {tasks.map(task => (
 *         <TaskItem key={task.id} task={task} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * 注意事项：
 * - 必须在AppContextProvider包裹的组件内使用
 * - 不要在组件外部或顶层组件中使用
 * - 使用时注意异步方法的错误处理
 * 
 * @returns AppContextType 完整的Context接口
 * @throws Error 当在Provider外使用时抛出错误
 */
export const useAppContext = (): AppContextType => {
  // 获取Context值
  const context = useContext(AppContext);
  
  // 检查是否在Provider内使用
  if (context === undefined) {
    throw new Error(
      'useAppContext must be used within an AppContextProvider. ' +
      'Make sure to wrap your component tree with <AppContextProvider>. ' +
      '请确保在 <AppContextProvider> 组件内使用 useAppContext Hook'
    );
  }
  
  return context;
};

/* ========== 便捷Hook导出函数 ========== */

/**
 * 使用任务状态的便捷Hook
 * 仅返回任务相关的状态和方法，减少不必要的重渲染
 * 
 * @returns 任务相关的状态和方法
 */
export const useTaskContext = () => {
  const { 
    state: { tasks, currentTask, taskFilters, loading },
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setCurrentTask
  } = useAppContext();
  
  return {
    // 任务状态
    tasks,
    currentTask,
    taskFilters,
    loading,
    
    // 任务方法
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setCurrentTask
  };
};

/**
 * 使用UI状态的便捷Hook
 * 仅返回UI相关的状态和方法
 * 
 * @returns UI相关的状态和方法
 */
export const useUIContext = () => {
  const {
    state: { confirmDialog, loading, error, successMessage },
    showConfirmDialog,
    hideConfirmDialog,
    showSuccess,
    showError,
    clearMessages
  } = useAppContext();
  
  return {
    // UI状态
    confirmDialog,
    loading,
    error,
    successMessage,
    
    // UI方法
    showConfirmDialog,
    hideConfirmDialog,
    showSuccess,
    showError,
    clearMessages
  };
};

/**
 * 使用应用设置的便捷Hook
 * 仅返回应用设置相关的状态和方法
 * 
 * @returns 应用设置相关的状态和方法
 */
export const useAppSettings = () => {
  const {
    state: { theme, language, sidebarCollapsed, userPreferences },
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    updateUserPreferences
  } = useAppContext();
  
  return {
    // 设置状态
    theme,
    language,
    sidebarCollapsed,
    userPreferences,
    
    // 设置方法
    toggleTheme,
    setTheme,
    setLanguage,
    toggleSidebar,
    updateUserPreferences
  };
};

/* ========== 默认导出和命名导出 ========== */

/**
 * 默认导出 AppContextProvider 组件
 * 便于在应用根组件中直接使用
 * 
 * 使用示例：
 * ```tsx
 * import AppContextProvider from './AppContext';
 * 
 * function App() {
 *   return (
 *     <AppContextProvider>
 *       <YourAppComponents />
 *     </AppContextProvider>
 *   );
 * }
 * ```
 */
export default AppContextProvider;

// 命名导出，提供更灵活的导入方式
export { AppContextProvider };

// 导出所有类型定义，便于在其他文件中使用
export type {
  Task,
  ConfirmDialog,
  AppState,
  AppAction,
  AppContextType
};