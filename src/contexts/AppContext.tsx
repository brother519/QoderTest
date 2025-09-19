import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, FilterCriteria, ModalState, ConfirmConfig } from '../types';

// 应用状态接口
interface AppState {
  tasks: Task[];
  filteredTasks: Task[];
  filterCriteria: FilterCriteria;
  modalState: ModalState;
  confirmConfig: ConfirmConfig | null;
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

// 动作类型
type AppAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTER_CRITERIA'; payload: FilterCriteria }
  | { type: 'SET_FILTERED_TASKS'; payload: Task[] }
  | { type: 'SET_MODAL_STATE'; payload: Partial<ModalState> }
  | { type: 'SET_CONFIRM_CONFIG'; payload: ConfirmConfig | null }
  | { type: 'SET_SELECTED_TASK'; payload: Task | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// 初始状态
const initialState: AppState = {
  tasks: [],
  filteredTasks: [],
  filterCriteria: {},
  modalState: {
    createTask: false,
    taskDetail: false,
    confirm: false
  },
  confirmConfig: null,
  selectedTask: null,
  loading: false,
  error: null
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
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
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_FILTER_CRITERIA':
      return { ...state, filterCriteria: action.payload };
    case 'SET_FILTERED_TASKS':
      return { ...state, filteredTasks: action.payload };
    case 'SET_MODAL_STATE':
      return { ...state, modalState: { ...state.modalState, ...action.payload } };
    case 'SET_CONFIRM_CONFIG':
      return { ...state, confirmConfig: action.payload };
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Context创建
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}