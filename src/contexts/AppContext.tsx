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

const initialState: AppState = {
  tasks: [],
  filter: {},
  selectedTask: null,
  isCreateModalOpen: false,
  isDetailModalOpen: false,
  isConfirmModalOpen: false,
  confirmModalConfig: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        selectedTask: state.selectedTask?.id === action.payload.id 
          ? action.payload 
          : state.selectedTask
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload 
          ? null 
          : state.selectedTask
      };
    
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    
    case 'TOGGLE_CREATE_MODAL':
      return { 
        ...state, 
        isCreateModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isCreateModalOpen 
      };
    
    case 'TOGGLE_DETAIL_MODAL':
      return { 
        ...state, 
        isDetailModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isDetailModalOpen 
      };
    
    case 'TOGGLE_CONFIRM_MODAL':
      return { 
        ...state, 
        isConfirmModalOpen: action.payload !== undefined 
          ? action.payload 
          : !state.isConfirmModalOpen 
      };
    
    case 'SET_CONFIRM_MODAL_CONFIG':
      return { ...state, confirmModalConfig: action.payload };
    
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await taskService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    dispatch({
      type: 'SET_CONFIRM_MODAL_CONFIG',
      payload: { title, message, onConfirm }
    });
    dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: true });
  };

  useEffect(() => {
    loadTasks();
  }, []);

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

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};