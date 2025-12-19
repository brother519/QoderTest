/**
 * 任务管理服务模块
 * 
 * 功能描述：
 * - 提供任务CRUD操作的异步API接口
 * - 管理任务数据的本地存储持久化
 * - 处理任务数据的格式转换和验证
 * - 模拟真实API的延迟和错误处理
 * 
 * 依赖模块：
 * - Task相关类型定义：提供数据结构约束
 * - 工具函数：提供ID生成和延迟模拟功能
 * 
 * 技术特点：
 * - 使用localStorage作为数据持久化方案
 * - 模拟异步操作以接近真实API体验
 * - 提供完整的错误处理和数据验证
 * 
 * @author TaskService Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// 类型导入：任务相关的核心数据结构
import type { 
  Task, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskFilter,
  TaskStatus,
  TaskPriority 
} from '@/types/Task';

// 工具函数导入：提供通用功能支持
import { generateId, delay, deepClone, safeJsonParse } from '@/utils';

/**
 * 本地存储键名常量
 * 用于在localStorage中存储任务数据的键名
 */
const STORAGE_KEY = 'qoder_tasks';

/**
 * 模拟API延迟时间（毫秒）
 * 用于模拟真实网络请求的延迟效果，提升开发和测试的真实性
 */
const API_DELAY = 300;

/**
 * 任务管理服务类
 * 
 * 提供完整的任务管理功能，包括任务的增删改查操作。
 * 采用单例模式设计，确保全局唯一的服务实例。
 * 所有方法都返回Promise，模拟异步API调用。
 * 
 * 主要特性：
 * - 异步操作模拟：所有方法都包含延迟，模拟真实API调用
 * - 数据持久化：使用localStorage保存数据，页面刷新后数据不丢失
 * - 错误处理：提供完善的错误处理机制和用户友好的错误信息
 * - 数据验证：确保数据完整性和类型安全
 * - 初始数据：首次使用时自动创建示例数据
 * 
 * @example
 * ```typescript
 * // 获取任务列表
 * const tasks = await taskService.getTasks();
 * 
 * // 创建新任务
 * const newTask = await taskService.createTask({
 *   title: '完成项目文档',
 *   description: '编写API文档和用户手册',
 *   priority: TaskPriority.HIGH
 * });
 * 
 * // 更新任务状态
 * await taskService.updateTask(newTask.id, {
 *   status: TaskStatus.COMPLETED
 * });
 * ```
 */
class TaskService {
  /**
   * 单例实例
   * 确保整个应用中只有一个TaskService实例
   */
  private static instance: TaskService;

  /**
   * 私有构造函数，防止直接实例化
   * 确保只能通过getInstance()方法获取实例
   */
  private constructor() {
    // 初始化时检查并创建示例数据
    this.initializeDefaultTasks();
  }

  /**
   * 获取TaskService单例实例
   * 
   * 使用单例模式确保全局只有一个服务实例，
   * 避免数据状态不一致的问题。
   * 
   * @returns {TaskService} TaskService实例
   * 
   * @example
   * ```typescript
   * const taskService = TaskService.getInstance();
   * const tasks = await taskService.getTasks();
   * ```
   */
  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * 获取所有任务列表
   * 
   * 从localStorage读取任务数据，并进行必要的数据转换。
   * 特别处理日期字段的反序列化，确保Date对象的正确性。
   * 
   * @param {TaskFilter} filter - 可选的过滤条件
   * @returns {Promise<Task[]>} 任务列表Promise
   * @throws {Error} 当数据读取失败时抛出错误
   * 
   * @example
   * ```typescript
   * // 获取所有任务
   * const allTasks = await taskService.getTasks();
   * 
   * // 获取已完成的任务
   * const completedTasks = await taskService.getTasks({
   *   status: TaskStatus.COMPLETED
   * });
   * 
   * // 获取高优先级任务
   * const urgentTasks = await taskService.getTasks({
   *   priority: TaskPriority.HIGH
   * });
   * ```
   */
  public async getTasks(filter?: TaskFilter): Promise<Task[]> {
    try {
      // 模拟API调用延迟，提升开发体验的真实性
      await delay(API_DELAY);

      // 从localStorage读取原始数据
      const tasksJson = localStorage.getItem(STORAGE_KEY);
      
      // 使用安全的JSON解析，避免解析异常
      const tasksData = safeJsonParse<Task[]>(tasksJson || '[]', []);

      // 数据转换：将序列化的日期字符串转换为Date对象
      const tasks = tasksData.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));

      // 应用过滤条件（如果提供）
      if (filter) {
        return this.applyFilter(tasks, filter);
      }

      return tasks;
    } catch (error) {
      // 错误处理：提供用户友好的错误信息
      console.error('获取任务列表失败:', error);
      throw new Error('无法获取任务列表，请稍后重试');
    }
  }

  /**
   * 根据ID获取单个任务
   * 
   * 通过任务ID查找并返回对应的任务信息。
   * 如果任务不存在，将抛出相应的错误。
   * 
   * @param {string} id - 任务ID
   * @returns {Promise<Task>} 任务对象Promise
   * @throws {Error} 当任务不存在时抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const task = await taskService.getTaskById('task_123456_abc');
   *   console.log('找到任务:', task.title);
   * } catch (error) {
   *   console.error('任务不存在');
   * }
   * ```
   */
  public async getTaskById(id: string): Promise<Task> {
    // 模拟API延迟
    await delay(API_DELAY);

    // 获取所有任务并查找目标任务
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === id);

    // 任务存在性验证
    if (!task) {
      throw new Error(`任务不存在 (ID: ${id})`);
    }

    return task;
  }

  /**
   * 创建新任务
   * 
   * 根据提供的任务数据创建新任务，自动生成ID和时间戳。
   * 执行数据验证确保任务信息的完整性和正确性。
   * 
   * @param {CreateTaskData} taskData - 任务创建数据（不包含ID和时间戳）
   * @returns {Promise<Task>} 创建后的完整任务对象Promise
   * @throws {Error} 当数据验证失败或创建失败时抛出错误
   * 
   * @example
   * ```typescript
   * const newTask = await taskService.createTask({
   *   title: '学习TypeScript',
   *   description: '深入学习TypeScript的高级特性',
   *   priority: TaskPriority.MEDIUM,
   *   dueDate: new Date('2024-12-31'),
   *   tags: ['学习', '编程']
   * });
   * 
   * console.log('任务创建成功:', newTask.id);
   * ```
   */
  public async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      // 模拟API延迟
      await delay(API_DELAY);

      // 输入数据验证：确保必要字段存在且格式正确
      this.validateCreateTaskData(taskData);

      // 获取当前任务列表
      const tasks = await this.getTasks();
      
      // 构建完整的任务对象
      const now = new Date();
      const newTask: Task = {
        id: generateId(), // 生成唯一ID
        title: taskData.title.trim(), // 清理标题空白字符
        description: taskData.description?.trim(), // 可选描述处理
        status: TaskStatus.PENDING, // 新任务默认为待处理状态
        priority: taskData.priority || TaskPriority.MEDIUM, // 默认中等优先级
        dueDate: taskData.dueDate, // 截止日期（可选）
        tags: taskData.tags || [], // 标签数组（默认为空）
        createdAt: now, // 创建时间戳
        updatedAt: now // 初始更新时间与创建时间相同
      };

      // 添加到任务列表
      tasks.push(newTask);

      // 保存到localStorage
      await this.saveTasks(tasks);

      return newTask;
    } catch (error) {
      // 错误处理和日志记录
      console.error('创建任务失败:', error);
      if (error instanceof Error) {
        throw error; // 重新抛出已知错误
      }
      throw new Error('创建任务失败，请检查输入数据');
    }
  }

  /**
   * 更新现有任务
   * 
   * 根据任务ID更新任务的指定字段，支持部分更新。
   * 自动更新updatedAt时间戳，确保变更记录的准确性。
   * 
   * @param {string} id - 要更新的任务ID
   * @param {UpdateTaskData} updates - 要更新的字段数据
   * @returns {Promise<Task>} 更新后的任务对象Promise
   * @throws {Error} 当任务不存在或更新失败时抛出错误
   * 
   * @example
   * ```typescript
   * // 更新任务状态
   * const updatedTask = await taskService.updateTask('task_123', {
   *   status: TaskStatus.IN_PROGRESS
   * });
   * 
   * // 更新多个字段
   * const task = await taskService.updateTask('task_123', {
   *   title: '新的任务标题',
   *   priority: TaskPriority.HIGH,
   *   tags: ['重要', '紧急']
   * });
   * ```
   */
  public async updateTask(id: string, updates: UpdateTaskData): Promise<Task> {
    try {
      // 模拟API延迟
      await delay(API_DELAY);

      // 输入验证：确保更新数据有效
      this.validateUpdateTaskData(updates);

      // 获取当前任务列表
      const tasks = await this.getTasks();
      
      // 查找目标任务的索引
      const taskIndex = tasks.findIndex(task => task.id === id);
      
      // 任务存在性验证
      if (taskIndex === -1) {
        throw new Error(`要更新的任务不存在 (ID: ${id})`);
      }

      // 执行任务更新：合并新数据到现有任务
      const currentTask = tasks[taskIndex];
      const updatedTask: Task = {
        ...currentTask, // 保留原有数据
        ...updates, // 应用更新数据
        updatedAt: new Date() // 更新时间戳
      };

      // 更新任务列表中的任务
      tasks[taskIndex] = updatedTask;

      // 保存更改到localStorage
      await this.saveTasks(tasks);

      return updatedTask;
    } catch (error) {
      // 错误处理
      console.error('更新任务失败:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新任务失败，请检查输入数据');
    }
  }

  /**
   * 删除任务
   * 
   * 根据任务ID从系统中彻底删除任务。
   * 这是不可逆操作，删除后无法恢复。
   * 
   * @param {string} id - 要删除的任务ID
   * @returns {Promise<void>} 删除操作Promise
   * @throws {Error} 当任务不存在或删除失败时抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   await taskService.deleteTask('task_123456_abc');
   *   console.log('任务删除成功');
   * } catch (error) {
   *   console.error('删除失败:', error.message);
   * }
   * ```
   */
  public async deleteTask(id: string): Promise<void> {
    try {
      // 模拟API延迟
      await delay(API_DELAY);

      // 获取当前任务列表
      const tasks = await this.getTasks();
      
      // 查找要删除的任务
      const initialLength = tasks.length;
      const filteredTasks = tasks.filter(task => task.id !== id);

      // 验证任务是否存在（通过数组长度变化判断）
      if (filteredTasks.length === initialLength) {
        throw new Error(`要删除的任务不存在 (ID: ${id})`);
      }

      // 保存更新后的任务列表
      await this.saveTasks(filteredTasks);

      // 删除成功，无需返回值
    } catch (error) {
      // 错误处理
      console.error('删除任务失败:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除任务失败，请稍后重试');
    }
  }

  /**
   * 批量更新任务状态
   * 
   * 同时更新多个任务的状态，提高操作效率。
   * 适用于批量操作场景，如标记多个任务为已完成。
   * 
   * @param {string[]} ids - 要更新的任务ID数组
   * @param {TaskStatus} status - 新的任务状态
   * @returns {Promise<Task[]>} 更新后的任务数组Promise
   * @throws {Error} 当操作失败时抛出错误
   * 
   * @example
   * ```typescript
   * // 批量标记任务为已完成
   * const completedTasks = await taskService.batchUpdateStatus(
   *   ['task_1', 'task_2', 'task_3'],
   *   TaskStatus.COMPLETED
   * );
   * ```
   */
  public async batchUpdateStatus(ids: string[], status: TaskStatus): Promise<Task[]> {
    try {
      // 模拟API延迟
      await delay(API_DELAY);

      // 输入验证
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('任务ID列表不能为空');
      }

      // 获取当前任务列表
      const tasks = await this.getTasks();
      const updatedTasks: Task[] = [];
      const now = new Date();

      // 批量更新任务状态
      const newTasks = tasks.map(task => {
        if (ids.includes(task.id)) {
          const updatedTask = {
            ...task,
            status,
            updatedAt: now
          };
          updatedTasks.push(updatedTask);
          return updatedTask;
        }
        return task;
      });

      // 验证是否所有指定的任务都被找到
      if (updatedTasks.length !== ids.length) {
        const foundIds = updatedTasks.map(t => t.id);
        const notFoundIds = ids.filter(id => !foundIds.includes(id));
        throw new Error(`部分任务不存在: ${notFoundIds.join(', ')}`);
      }

      // 保存更改
      await this.saveTasks(newTasks);

      return updatedTasks;
    } catch (error) {
      console.error('批量更新任务状态失败:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('批量更新失败，请稍后重试');
    }
  }

  /**
   * 清空所有任务
   * 
   * 删除系统中的所有任务数据，通常用于重置或测试场景。
   * 这是危险操作，会不可逆地删除所有数据。
   * 
   * @returns {Promise<void>} 清空操作Promise
   * 
   * @example
   * ```typescript
   * await taskService.clearAllTasks();
   * console.log('所有任务已清空');
   * ```
   */
  public async clearAllTasks(): Promise<void> {
    try {
      // 模拟API延迟
      await delay(API_DELAY);

      // 清空localStorage中的任务数据
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清空任务失败:', error);
      throw new Error('清空任务失败，请稍后重试');
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 初始化默认任务数据
   * 
   * 在首次使用服务时创建示例任务，帮助用户快速了解系统功能。
   * 只有在localStorage中没有任务数据时才会创建示例数据。
   * 
   * @private
   */
  private initializeDefaultTasks(): void {
    try {
      // 检查是否已存在任务数据
      const existingData = localStorage.getItem(STORAGE_KEY);
      
      if (!existingData) {
        // 创建示例任务数据
        const defaultTasks: Task[] = [
          {
            id: generateId(),
            title: '完成项目文档',
            description: '编写API文档和用户手册，确保文档的完整性和准确性',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
            tags: ['文档', '项目'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: generateId(),
            title: '代码审查',
            description: '审查新功能的代码质量和安全性',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            tags: ['代码', '审查'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: generateId(),
            title: '部署测试环境',
            description: '配置并部署新版本到测试环境进行验证',
            status: TaskStatus.COMPLETED,
            priority: TaskPriority.LOW,
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
            tags: ['部署', '测试'],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前创建
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1天前更新
          }
        ];

        // 保存示例数据到localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
      }
    } catch (error) {
      // 初始化失败不应影响服务的正常使用
      console.warn('初始化默认任务数据失败:', error);
    }
  }

  /**
   * 保存任务列表到localStorage
   * 
   * 将任务数组序列化并保存到本地存储。
   * 处理序列化过程中可能出现的错误。
   * 
   * @private
   * @param {Task[]} tasks - 要保存的任务列表
   * @throws {Error} 当保存失败时抛出错误
   */
  private async saveTasks(tasks: Task[]): Promise<void> {
    try {
      // 序列化任务数据并保存到localStorage
      const tasksJson = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEY, tasksJson);
    } catch (error) {
      // 保存失败处理
      console.error('保存任务数据失败:', error);
      throw new Error('保存失败，可能是存储空间不足');
    }
  }

  /**
   * 验证创建任务数据
   * 
   * 检查创建任务时提供的数据是否满足业务规则。
   * 确保必要字段存在且格式正确。
   * 
   * @private
   * @param {CreateTaskData} data - 要验证的任务创建数据
   * @throws {Error} 当数据验证失败时抛出错误
   */
  private validateCreateTaskData(data: CreateTaskData): void {
    // 验证标题：必须存在且不为空
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('任务标题不能为空');
    }

    // 验证标题长度：防止过长的标题
    if (data.title.trim().length > 100) {
      throw new Error('任务标题不能超过100个字符');
    }

    // 验证描述长度（如果提供）
    if (data.description && data.description.trim().length > 1000) {
      throw new Error('任务描述不能超过1000个字符');
    }

    // 验证截止日期（如果提供）：不能是过去的日期
    if (data.dueDate && data.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前时间');
    }

    // 验证标签数量（如果提供）
    if (data.tags && data.tags.length > 10) {
      throw new Error('任务标签数量不能超过10个');
    }
  }

  /**
   * 验证更新任务数据
   * 
   * 检查更新任务时提供的数据是否有效。
   * 确保更新字段的格式和值符合业务规则。
   * 
   * @private
   * @param {UpdateTaskData} data - 要验证的任务更新数据
   * @throws {Error} 当数据验证失败时抛出错误
   */
  private validateUpdateTaskData(data: UpdateTaskData): void {
    // 验证标题（如果提供）
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('任务标题不能为空');
      }
      if (data.title.trim().length > 100) {
        throw new Error('任务标题不能超过100个字符');
      }
    }

    // 验证描述（如果提供）
    if (data.description !== undefined && data.description.trim().length > 1000) {
      throw new Error('任务描述不能超过1000个字符');
    }

    // 验证截止日期（如果提供）
    if (data.dueDate !== undefined && data.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前时间');
    }

    // 验证标签（如果提供）
    if (data.tags !== undefined && data.tags.length > 10) {
      throw new Error('任务标签数量不能超过10个');
    }
  }

  /**
   * 应用任务过滤条件
   * 
   * 根据提供的过滤条件筛选任务列表。
   * 支持按状态、优先级、标签和截止日期范围进行过滤。
   * 
   * @private
   * @param {Task[]} tasks - 要过滤的任务列表
   * @param {TaskFilter} filter - 过滤条件
   * @returns {Task[]} 过滤后的任务列表
   */
  private applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
    return tasks.filter(task => {
      // 按状态过滤
      if (filter.status && task.status !== filter.status) {
        return false;
      }

      // 按优先级过滤
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }

      // 按标签过滤：任务必须包含所有指定标签
      if (filter.tags && filter.tags.length > 0) {
        const taskTags = task.tags || [];
        const hasAllTags = filter.tags.every(tag => taskTags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // 按截止日期范围过滤
      if (filter.dueDateRange && task.dueDate) {
        const { start, end } = filter.dueDateRange;
        if (start && task.dueDate < start) {
          return false;
        }
        if (end && task.dueDate > end) {
          return false;
        }
      }

      return true;
    });
  }
}

/**
 * 导出TaskService单例实例
 * 
 * 提供全局访问的任务服务实例，确保整个应用使用相同的服务实例。
 * 使用单例模式避免数据状态不一致和重复初始化的问题。
 * 
 * @example
 * ```typescript
 * import { taskService } from '@/services/taskService';
 * 
 * // 在组件中使用
 * const tasks = await taskService.getTasks();
 * 
 * // 在其他服务中使用
 * const newTask = await taskService.createTask(taskData);
 * ```
 */
export const taskService = TaskService.getInstance();

/**
 * 同时导出TaskService类，用于测试或特殊场景
 * 
 * 在单元测试中可能需要创建独立的实例来避免测试间的数据污染。
 * 一般情况下建议使用默认导出的taskService实例。
 */
export { TaskService };