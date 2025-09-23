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