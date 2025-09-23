/**
 * 任务管理API服务模块
 * 
 * 功能说明：
 * - 提供任务的CRUD操作接口（创建、读取、更新、删除）
 * - 模拟异步API调用和网络延迟
 * - 使用localStorage作为数据持久化存储
 * - 提供初始化示例数据
 * 
 * 数据存储：
 * - 使用localStorage存储任务数据
 * - 键名：'tasks'
 * - 数据格式：JSON字符串
 * 
 * 异常处理：
 * - 任务不存在时抛出'Task not found'错误
 * - 数据不存在时抛出'No tasks found'错误
 * 
 * @author AI Assistant
 * @since 2025-09-20
 * @version 1.0.0
 */

// 类型定义
import { Task } from '../types';
// 工具函数
import { generateId } from '../utils';

/**
 * 任务管理服务对象
 * 
 * @description 提供任务管理的所有API接口方法，模拟真实的后端服务
 */
export const taskService = {
  /**
   * 获取所有任务
   * 
   * @description 从本地存储获取任务列表，如果不存在则返回初始化数据
   * @returns {Promise<Task[]>} 任务列表的Promise对象
   * 
   * @example
   * ```typescript
   * const tasks = await taskService.getTasks();
   * console.log(tasks.length); // 输出任务数量
   * ```
   * 
   * @complexity O(1) - 时间复杂度
   * @since 1.0.0
   */
  getTasks: async (): Promise<Task[]> => {
    return new Promise((resolve) => {
      // 模拟网络延迟100ms
      setTimeout(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          // 转换日期字符串为Date对象（localStorage只能存储字符串）
          tasks.forEach((task: any) => {
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.dueDate) {
              task.dueDate = new Date(task.dueDate);
            }
          });
          resolve(tasks);
        } else {
          // 首次访问时返回初始化数据
          resolve(getInitialTasks());
        }
      }, 100);
    });
  },

  /**
   * 创建新任务
   * 
   * @param {Omit<Task, 'id' | 'createdAt' | 'updatedAt'>} taskData - 任务数据（不包含id和时间戳字段）
   * @returns {Promise<Task>} 创建完成的任务对象
   * 
   * @description 
   * - 自动生成唯一ID和时间戳
   * - 保存到localStorage
   * - 模拟200ms网络延迟
   * 
   * @example
   * ```typescript
   * const newTask = await taskService.createTask({
   *   title: '新任务',
   *   description: '任务描述',
   *   assignee: '张三',
   *   priority: 'HIGH',
   *   status: 'TODO',
   *   dueDate: new Date(),
   *   tags: ['标签1']
   * });
   * ```
   * 
   * @throws 此方法不会抛出异常
   * @since 1.0.0
   */
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    return new Promise((resolve) => {
      // 模拟网络延迟200ms
      setTimeout(() => {
        // 生成新任务对象，自动填充ID和时间戳
        const task: Task = {
          ...taskData,
          id: generateId(), // 生成唯一ID
          createdAt: new Date(), // 创建时间
          updatedAt: new Date(), // 更新时间
        };
        
        // 保存到localStorage
        const savedTasks = localStorage.getItem('tasks');
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        resolve(task);
      }, 200);
    });
  },

  /**
   * 更新任务
   * 
   * @param {string} id - 要更新的任务ID
   * @param {Partial<Task>} updates - 要更新的字段（部分更新）
   * @returns {Promise<Task>} 更新后的任务对象
   * 
   * @description 
   * - 根据ID查找任务并更新指定字段
   * - 自动更新updatedAt时间戳
   * - 模拟200ms网络延迟
   * 
   * @example
   * ```typescript
   * const updatedTask = await taskService.updateTask('task-id', {
   *   status: 'DONE',
   *   title: '更新后的标题'
   * });
   * ```
   * 
   * @throws {Error} 当任务不存在时抛出'Task not found'
   * @throws {Error} 当没有任务数据时抛出'No tasks found'
   * @since 1.0.0
   */
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (!savedTasks) {
          reject(new Error('No tasks found'));
          return;
        }

        const tasks = JSON.parse(savedTasks);
        // 查找要更新的任务索引
        const taskIndex = tasks.findIndex((task: Task) => task.id === id);
        
        if (taskIndex === -1) {
          reject(new Error('Task not found'));
          return;
        }

        // 合并更新数据并更新时间戳
        const updatedTask = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date(), // 自动更新修改时间
        };

        // 更新数组中的任务并保存
        tasks[taskIndex] = updatedTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        resolve(updatedTask);
      }, 200);
    });
  },

  /**
   * 删除任务
   * 
   * @param {string} id - 要删除的任务ID
   * @returns {Promise<void>} 空的Promise对象
   * 
   * @description 
   * - 根据ID从存储中删除指定任务
   * - 模拟200ms网络延迟
   * - 删除后更新localStorage
   * 
   * @example
   * ```typescript
   * await taskService.deleteTask('task-id');
   * console.log('任务已删除');
   * ```
   * 
   * @throws {Error} 当任务不存在时抛出'Task not found'
   * @throws {Error} 当没有任务数据时抛出'No tasks found'
   * @since 1.0.0
   */
  deleteTask: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (!savedTasks) {
          reject(new Error('No tasks found'));
          return;
        }

        const tasks = JSON.parse(savedTasks);
        // 过滤掉指定ID的任务
        const filteredTasks = tasks.filter((task: Task) => task.id !== id);
        
        // 检查是否真的删除了任务（长度有变化）
        if (filteredTasks.length === tasks.length) {
          reject(new Error('Task not found'));
          return;
        }

        // 更新localStorage
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        resolve();
      }, 200);
    });
  },
};

/**
 * 获取初始化示例任务数据
 * 
 * @description 在首次访问或本地存储为空时提供的默认任务数据
 * @returns {Task[]} 初始化任务列表
 * 
 * @example
 * 包含3个不同状态的示例任务：
 * - 进行中的设计任务
 * - 待处理的开发任务
 * - 已完成的文档任务
 * 
 * @since 1.0.0
 */
const getInitialTasks = (): Task[] => {
  return [
    // 示例任务1：进行中的设计任务
    {
      id: generateId(),
      title: '设计任务管理系统原型',
      description: '创建任务管理系统的UI/UX设计原型，包括所有主要功能页面',
      assignee: '张三',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      tags: ['设计', 'UI/UX'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
      updatedAt: new Date(),
    },
    // 示例任务2：待处理的开发任务
    {
      id: generateId(),
      title: '开发用户认证模块',
      description: '实现用户登录、注册、密码重置等功能',
      assignee: '李四',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10天后
      tags: ['开发', '认证'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    // 示例任务3：已完成的文档任务（逾期但已完成）
    {
      id: generateId(),
      title: '编写API文档',
      description: '为所有API端点编写详细的文档，包括请求/响应示例',
      assignee: '王五',
      priority: 'MEDIUM',
      status: 'DONE',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前（已过期但完成）
      tags: ['文档', 'API'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
    },
  ];
};