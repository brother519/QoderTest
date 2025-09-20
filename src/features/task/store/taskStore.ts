import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskPriority, TaskFilter, TaskStatistics } from '@/shared/types';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilter;
  loading: boolean;
  error: string | null;
  statistics: TaskStatistics;
}

interface TaskActions {
  // 任务CRUD操作
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // 任务状态管理
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // 筛选和搜索
  setFilters: (filters: TaskFilter) => void;
  clearFilters: () => void;
  
  // 统计计算
  calculateStatistics: () => void;
  getFilteredTasks: () => Task[];
}

type TaskStore = TaskState & TaskActions;

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 初始化统计数据
const initialStatistics: TaskStatistics = {
  total: 0,
  completed: 0,
  inProgress: 0,
  overdue: 0,
  byPriority: {
    [TaskPriority.LOW]: 0,
    [TaskPriority.MEDIUM]: 0,
    [TaskPriority.HIGH]: 0,
    [TaskPriority.URGENT]: 0,
  },
  byCategory: {},
};

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        tasks: [],
        selectedTask: null,
        filters: {},
        loading: false,
        error: null,
        statistics: initialStatistics,

        // 任务CRUD操作
        addTask: (taskData) => {
          const newTask: Task = {
            ...taskData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => ({
            tasks: [...state.tasks, newTask]
          }));
          
          get().calculateStatistics();
        },

        updateTask: (id, updates) => {
          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            )
          }));
          
          get().calculateStatistics();
        },

        deleteTask: (id) => {
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
          }));
          
          get().calculateStatistics();
        },

        // 任务状态管理
        updateTaskStatus: (id, status) => {
          const updates: Partial<Task> = { status };
          
          if (status === TaskStatus.DONE) {
            updates.completedAt = new Date();
          }
          
          get().updateTask(id, updates);
        },

        setSelectedTask: (task) => set({ selectedTask: task }),

        // 筛选和搜索
        setFilters: (filters) => set({ filters }),
        clearFilters: () => set({ filters: {} }),

        // 统计计算
        calculateStatistics: () => {
          const { tasks } = get();
          const now = new Date();
          
          const statistics: TaskStatistics = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === TaskStatus.DONE).length,
            inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
            overdue: tasks.filter(task => 
              task.dueDate && 
              task.dueDate < now && 
              task.status !== TaskStatus.DONE
            ).length,
            byPriority: {
              [TaskPriority.LOW]: tasks.filter(task => task.priority === TaskPriority.LOW).length,
              [TaskPriority.MEDIUM]: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
              [TaskPriority.HIGH]: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
              [TaskPriority.URGENT]: tasks.filter(task => task.priority === TaskPriority.URGENT).length,
            },
            byCategory: tasks.reduce((acc, task) => {
              acc[task.category] = (acc[task.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          };
          
          set({ statistics });
        },

        getFilteredTasks: () => {
          const { tasks, filters } = get();
          
          return tasks.filter(task => {
            // 状态筛选
            if (filters.status && filters.status.length > 0) {
              if (!filters.status.includes(task.status)) return false;
            }
            
            // 优先级筛选
            if (filters.priority && filters.priority.length > 0) {
              if (!filters.priority.includes(task.priority)) return false;
            }
            
            // 分类筛选
            if (filters.category && task.category !== filters.category) {
              return false;
            }
            
            // 负责人筛选
            if (filters.assignee && task.assignee !== filters.assignee) {
              return false;
            }
            
            // 日期范围筛选
            if (filters.dateRange) {
              const [startDate, endDate] = filters.dateRange;
              if (task.dueDate) {
                if (task.dueDate < startDate || task.dueDate > endDate) {
                  return false;
                }
              }
            }
            
            // 标签筛选
            if (filters.tags && filters.tags.length > 0) {
              const hasMatchingTag = filters.tags.some(tag => 
                task.tags.includes(tag)
              );
              if (!hasMatchingTag) return false;
            }
            
            return true;
          });
        },
      }),
      {
        name: 'task-storage',
        partialize: (state) => ({ 
          tasks: state.tasks,
          filters: state.filters 
        }),
      }
    ),
    {
      name: 'task-store',
    }
  )
);