/**
 * AppContext.tsx - Application Global State Management Context Implementation
 * 
 * File Overview:
 * - Provides application-level global state management using React Context API + useReducer pattern
 * - Unified management of task state, modal state, filter configuration and other globally shared data
 * - Provides unified state access interface and state change methods for the entire application
 * 
 * Core Responsibilities:
 * - Task Management: CRUD operations, status changes, batch operations for tasks
 * - Modal State: Confirmation dialogs, alert boxes and other UI state management
 * - Filter Management: Global search and filter condition state maintenance
 * - App Settings: Theme, language, user preferences and other configuration management
 * 
 * Use Cases:
 * - Cross-component state sharing and communication
 * - Centralized management of complex business logic
 * - Application-level data persistence and synchronization
 * 
 * Dependencies:
 * - React Context API: For cross-component state sharing
 * - useReducer Hook: For complex state logic management
 * - Existing Store System: Integration with Zustand store
 * 
 * Technical Architecture:
 * - Single state tree design with centralized state management
 * - Immutable data update pattern ensuring state consistency
 * - Support for async operations and error handling mechanisms
 * - TypeScript type safety guarantees
 * 
 * @author System Generated
 * @version 1.0.0
 * @since 2024-09-20
 * @lastModified 2024-09-20
 */

/* ========== Dependency Import Groups ========== */

// React core functionality imports - Provides Context, Reducer, Effect and other core Hooks
import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback,
  useMemo 
} from 'react';

// TypeScript type definition imports - Application internal type system
import type { 
  Product, 
  CartItem, 
  User, 
  Comment, 
  SearchFilters,
  Order 
} from './types/index.js';

/* ========== Application State Type Definitions ========== */

/**
 * Task Data Model
 * Defines the complete data structure for task entities in the application
 */
export interface Task {
  /** Unique task identifier */
  id: string;
  /** Task title, brief description of task content */
  title: string;
  /** Detailed task description, including specific requirements and instructions */
  description: string;
  /** Current task status: pending, in progress, completed, cancelled */
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  /** Task priority: high, medium, low */
  priority: 'high' | 'medium' | 'low';
  /** Task creation timestamp */
  createdAt: Date;
  /** Task last update timestamp */
  updatedAt: Date;
  /** Task due date, optional field */
  dueDate?: Date;
  /** Task category tags for filtering and classification */
  tags: string[];
  /** Task assignee ID, linked to user data */
  assigneeId?: string;
}

/**
 * Confirmation Dialog Configuration
 * Defines the display content and callback handling for confirmation dialogs
 */
export interface ConfirmDialog {
  /** Whether the dialog is visible */
  isVisible: boolean;
  /** Dialog title text */
  title: string;
  /** Dialog content description */
  message: string;
  /** Confirm button text, defaults to "Confirm" */
  confirmText?: string;
  /** Cancel button text, defaults to "Cancel" */
  cancelText?: string;
  /** Confirm action callback function */
  onConfirm?: () => void;
  /** Cancel action callback function */
  onCancel?: () => void;
  /** Dialog type: info, warning, error, success */
  type?: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Application Global State Interface
 * Defines the entire application's state tree structure, containing all shared states
 */
export interface AppState {
  /* ===== Task Management State ===== */
  /** Task list data, stores all task information */
  tasks: Task[];
  /** Currently selected task, used for detail display and editing */
  currentTask: Task | null;
  /** Task filter conditions, controls task list display */
  taskFilters: {
    /** Filter by status */
    status?: Task['status'];
    /** Filter by priority */
    priority?: Task['priority'];
    /** Filter by tags */
    tags?: string[];
    /** Search keyword */
    searchKeyword?: string;
  };

  /* ===== UI State Management ===== */
  /** Confirmation dialog state configuration */
  confirmDialog: ConfirmDialog;
  /** Global loading state, used to display loading indicators */
  loading: boolean;
  /** Error message state, used for global error prompts */
  error: string | null;
  /** Success message */
  successMessage: string | null;

  /* ===== Application Settings State ===== */
  /** Application theme configuration: light, dark, auto */
  theme: 'light' | 'dark' | 'auto';
  /** Application language setting */
  language: 'zh-CN' | 'en-US';
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** User preference settings */
  userPreferences: {
    /** Items per page */
    pageSize: number;
    /** Default sort method */
    defaultSort: string;
    /** Auto-save interval (minutes) */
    autoSaveInterval: number;
  };
}

/**
 * State Change Action Type Definitions
 * Defines all possible state change operations, following Redux-style Action pattern
 */
export type AppAction =
  /* ===== Task Related Actions ===== */
  /** Set task list */
  | { type: 'SET_TASKS'; payload: Task[] }
  /** Add new task */
  | { type: 'ADD_TASK'; payload: Task }
  /** Update task information */
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  /** Delete task */
  | { type: 'DELETE_TASK'; payload: string }
  /** Set current task */
  | { type: 'SET_CURRENT_TASK'; payload: Task | null }
  /** Update task filter conditions */
  | { type: 'UPDATE_TASK_FILTERS'; payload: Partial<AppState['taskFilters']> }
  /** Clear task filters */
  | { type: 'CLEAR_TASK_FILTERS' }

  /* ===== UI State Actions ===== */
  /** Show confirmation dialog */
  | { type: 'SHOW_CONFIRM_DIALOG'; payload: Omit<ConfirmDialog, 'isVisible'> }
  /** Hide confirmation dialog */
  | { type: 'HIDE_CONFIRM_DIALOG' }
  /** Set loading state */
  | { type: 'SET_LOADING'; payload: boolean }
  /** Set error message */
  | { type: 'SET_ERROR'; payload: string | null }
  /** Set success message */
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  /** Clear all messages */
  | { type: 'CLEAR_MESSAGES' }

  /* ===== Application Settings Actions ===== */
  /** Toggle theme */
  | { type: 'TOGGLE_THEME' }
  /** Set theme */
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  /** Set language */
  | { type: 'SET_LANGUAGE'; payload: AppState['language'] }
  /** Toggle sidebar */
  | { type: 'TOGGLE_SIDEBAR' }
  /** Update user preferences */
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<AppState['userPreferences']> };

/* ========== Context Interface Definition ========== */

/**
 * AppContext Interface Definition
 * Defines the complete API interface provided by Context to consumer components
 */
export interface AppContextType {
  /* ===== State Access Interface ===== */
  /** Current application state */
  state: AppState;

  /* ===== Task Management Methods ===== */
  /** 
   * Load task list
   * Load task data from server or local storage
   */
  loadTasks: () => Promise<void>;
  
  /** 
   * Create new task
   * @param taskData New task data
   * @returns Successfully created task object
   */
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  
  /** 
   * Update task information
   * @param taskId Task ID
   * @param updates Fields to update
   */
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  
  /** 
   * Delete task
   * @param taskId Task ID
   */
  deleteTask: (taskId: string) => Promise<void>;
  
  /** 
   * Set currently selected task
   * @param task Task object or null
   */
  setCurrentTask: (task: Task | null) => void;

  /* ===== UI Interaction Methods ===== */
  /** 
   * Show confirmation dialog
   * @param config Dialog configuration
   */
  showConfirmDialog: (config: Omit<ConfirmDialog, 'isVisible'>) => void;
  
  /** Hide confirmation dialog */
  hideConfirmDialog: () => void;
  
  /** 
   * Show success message
   * @param message Success message
   */
  showSuccess: (message: string) => void;
  
  /** 
   * Show error message
   * @param message Error message
   */
  showError: (message: string) => void;
  
  /** Clear all messages */
  clearMessages: () => void;

  /* ===== Application Settings Methods ===== */
  /** Toggle application theme */
  toggleTheme: () => void;
  
  /** 
   * Set application theme
   * @param theme Theme name
   */
  setTheme: (theme: AppState['theme']) => void;
  
  /** 
   * Set application language
   * @param language Language code
   */
  setLanguage: (language: AppState['language']) => void;
  
  /** Toggle sidebar expand state */
  toggleSidebar: () => void;
  
  /** 
   * Update user preference settings
   * @param preferences Preference configuration
   */
  updateUserPreferences: (preferences: Partial<AppState['userPreferences']>) => void;
}

/* ========== Initial State Definition ========== */

/**
 * Application Initial State Configuration
 * Defines default state values when the application starts, ensuring all states have reasonable initial values
 */
const initialState: AppState = {
  /* ===== Task Management Initial State ===== */
  tasks: [], // Initial task list is empty, waiting to load from storage or API
  currentTask: null, // Initially no task is selected
  taskFilters: {
    // Initial filter conditions are empty, showing all tasks
    status: undefined,
    priority: undefined,
    tags: [],
    searchKeyword: ''
  },

  /* ===== UI State Initial Values ===== */
  confirmDialog: {
    isVisible: false, // Dialog initially hidden
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  },
  loading: false, // Application initially not in loading state
  error: null, // Initially no error messages
  successMessage: null, // Initially no success messages

  /* ===== Application Settings Initial Values ===== */
  theme: 'light', // Default to light theme
  language: 'zh-CN', // Default to Chinese
  sidebarCollapsed: false, // Sidebar initially expanded
  userPreferences: {
    pageSize: 20, // Default 20 items per page
    defaultSort: 'createdAt_desc', // Default sort by creation time desc
    autoSaveInterval: 5 // Default 5-minute auto-save interval
  }
};

/* ========== Reducer Function Implementation ========== */

/**
 * Application State Reducer Function
 * Executes corresponding state change logic based on different Action types
 * Strictly follows immutable data update principles to ensure predictable state changes
 * 
 * @param state Current state
 * @param action State change action
 * @returns New state object
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ===== Task Management Related State Changes ===== */
    
    case 'SET_TASKS': {
      // Set task list, usually used for initialization or reloading task data
      // Ensure tasks are sorted by creation time to maintain list consistency
      const sortedTasks = [...action.payload].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...state,
        tasks: sortedTasks
      };
    }
    
    case 'ADD_TASK': {
      // Add new task to the beginning of list, keeping newest tasks at top
      // Use spread operator to ensure original array is not directly modified
      return {
        ...state,
        tasks: [action.payload, ...state.tasks]
      };
    }
    
    case 'UPDATE_TASK': {
      // Update specified task information, keeping other tasks unchanged
      // Also update updatedAt timestamp to record last modification time
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                ...updates, 
                updatedAt: new Date() // Automatically update modification time
              }
            : task
        ),
        // If updating the currently selected task, sync update currentTask
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

    /* ===== Default Case Handling ===== */
    default: {
      // For unknown action types, return current state unchanged
      // Can add warning logs in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unknown action type:', (action as any).type);
      }
      return state;
    }
  }
}

/* ========== Context Creation and Management ========== */

/**
 * Application Global Context Instance
 * Creates global state sharing Context object using React.createContext
 * Initial value set to undefined, actual value provided in Provider
 * This design allows detection of usage outside Provider in useContext
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