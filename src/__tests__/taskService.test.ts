/**
 * TaskService单元测试
 * 
 * 测试任务管理服务的核心功能，包括CRUD操作和数据验证。
 */

import { TaskService, taskService } from '../services/taskService';
import { TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '../types/Task';

// 模拟localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// 模拟工具函数
jest.mock('../utils', () => ({
  generateId: jest.fn(() => `test_task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`),
  delay: jest.fn(() => Promise.resolve()),
  deepClone: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
  safeJsonParse: jest.fn((str, defaultValue) => {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }),
}));

describe('TaskService', () => {
  let service: TaskService;
  let mockLocalStorage: jest.Mocked<Storage>;

  beforeEach(() => {
    mockLocalStorage = window.localStorage as jest.Mocked<Storage>;
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    service = taskService;
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('应该返回TaskService的单例实例', () => {
      const instance1 = TaskService.getInstance();
      const instance2 = TaskService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(TaskService);
    });
  });

  describe('getTasks', () => {
    it('应该返回空数组当localStorage为空时', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const tasks = await service.getTasks();
      
      expect(tasks).toEqual([]);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('qoder_tasks');
    });

    it('应该正确解析localStorage中的任务数据', async () => {
      const mockTasks = [
        {
          id: 'task_1',
          title: '测试任务',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTasks));
      
      const tasks = await service.getTasks();
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('task_1');
      expect(tasks[0].title).toBe('测试任务');
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createTask', () => {
    it('应该成功创建新任务', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const taskData: CreateTaskData = {
        title: '新任务',
        description: '任务描述',
        priority: TaskPriority.HIGH
      };
      
      const createdTask = await service.createTask(taskData);
      
      expect(createdTask.title).toBe('新任务');
      expect(createdTask.description).toBe('任务描述');
      expect(createdTask.priority).toBe(TaskPriority.HIGH);
      expect(createdTask.status).toBe(TaskStatus.PENDING);
      expect(createdTask.id).toBeDefined();
      expect(createdTask.createdAt).toBeInstanceOf(Date);
      expect(createdTask.updatedAt).toBeInstanceOf(Date);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('应该拒绝空标题', async () => {
      const taskData: CreateTaskData = {
        title: '   '
      };
      
      await expect(service.createTask(taskData))
        .rejects
        .toThrow('任务标题不能为空');
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      const mockTasks = [
        {
          id: 'task_1',
          title: '原始任务',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTasks));
    });

    it('应该成功更新任务', async () => {
      const updates: UpdateTaskData = {
        title: '更新后的任务',
        status: TaskStatus.IN_PROGRESS
      };
      
      const updatedTask = await service.updateTask('task_1', updates);
      
      expect(updatedTask.title).toBe('更新后的任务');
      expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
      expect(updatedTask.updatedAt).toBeInstanceOf(Date);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('应该抛出错误当任务不存在时', async () => {
      const updates: UpdateTaskData = {
        title: '更新标题'
      };
      
      await expect(service.updateTask('nonexistent', updates))
        .rejects
        .toThrow('要更新的任务不存在 (ID: nonexistent)');
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      const mockTasks = [
        {
          id: 'task_1',
          title: '要删除的任务',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTasks));
    });

    it('应该成功删除任务', async () => {
      await service.deleteTask('task_1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('应该抛出错误当任务不存在时', async () => {
      await expect(service.deleteTask('nonexistent'))
        .rejects
        .toThrow('要删除的任务不存在 (ID: nonexistent)');
    });
  });

  describe('clearAllTasks', () => {
    it('应该清空所有任务', async () => {
      await service.clearAllTasks();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('qoder_tasks');
    });
  });
});