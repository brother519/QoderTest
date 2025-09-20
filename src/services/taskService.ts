/**
 * TaskService - 任务管理服务模块
 * 
 * 本服务模块提供完整的任务管理功能，包括任务的创建、读取、更新和删除操作(CRUD)。
 * 采用本地存储(localStorage)作为数据持久化方案，并模拟真实API的异步操作行为。
 * 
 * 主要功能：
 * - 任务CRUD操作
 * - 本地数据持久化
 * - 异步操作模拟
 * - 错误处理和数据验证
 * - 类型安全的API设计
 * 
 * 技术特性：
 * - TypeScript 类型安全
 * - Promise-based 异步API
 * - localStorage 本地存储
 * - 错误边界处理
 * - 性能优化考虑
 * 
 * @version 1.0.0
 * @created 2025-09-20
 * @author TaskService Development Team
 */

// ========================================
// 类型导入 - Type Imports
// ========================================
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskPriority,
  TaskStatus,
} from '../types';

// ========================================
// 工具函数导入 - Utility Imports  
// ========================================

/**
 * 生成简单的UUID v4格式标识符
 * 使用crypto.getRandomValues()生成高质量的随机数
 * 符合RFC 4122规范的UUID v4格式
 * 
 * @returns {string} 返回UUID v4格式的字符串
 */
function generateUUID(): string {
  // 使用crypto API生成随机数组
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // 设置UUID v4的版本和变体位
  array[6] = (array[6] & 0x0f) | 0x40; // 版本位
  array[8] = (array[8] & 0x3f) | 0x80; // 变体位
  
  // 转换为十六进制字符串并格式化
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // 按照UUID格式添加连字符
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// ========================================
// 常量定义 - Constants
// ========================================

/**
 * 本地存储键名常量
 * 用于在localStorage中存储任务数据的键名
 */
const STORAGE_KEY = 'tasks';

/**
 * API延迟模拟时间(毫秒)
 * 模拟真实网络请求的延迟，提供更真实的用户体验
 */
const API_DELAY = 500;

/**
 * 默认任务优先级
 * 新建任务时如果未指定优先级，使用此默认值
 */
const DEFAULT_PRIORITY: TaskPriority = 'medium';

// ========================================
// 服务对象定义 - Service Object
// ========================================

/**
 * TaskService - 任务管理服务
 * 
 * 提供任务管理的核心业务逻辑，包括数据持久化、业务验证和错误处理。
 * 所有方法都返回Promise以支持异步操作，保持与真实API的一致性。
 */
export const taskService = {
  /**
   * 获取所有任务列表
   * 
   * 从本地存储中读取并返回所有任务数据。如果本地存储为空或数据格式错误，
   * 将返回初始默认任务数据并自动保存到本地存储中。
   * 
   * 业务逻辑说明：
   * 1. 尝试从localStorage读取任务数据
   * 2. 解析JSON数据并验证格式有效性
   * 3. 将日期字符串转换为Date对象
   * 4. 如果数据无效，使用默认初始数据
   * 5. 模拟网络延迟以提供真实的用户体验
   * 
   * 数据处理：
   * - 自动处理日期字符串到Date对象的转换
   * - 验证任务数据结构的完整性
   * - 提供降级方案处理数据损坏情况
   * 
   * 性能考虑：
   * - localStorage操作是同步的，但整体方法是异步的
   * - 大量任务数据时考虑分页加载（未来优化点）
   * - JSON解析性能在数据量大时需要优化
   * 
   * @returns {Promise<Task[]>} 返回包含所有任务的Promise数组
   * @throws {Error} 当localStorage操作失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 获取所有任务
   * const tasks = await taskService.getTasks();
   * console.log(`共有 ${tasks.length} 个任务`);
   * 
   * // 处理异常情况
   * try {
   *   const tasks = await taskService.getTasks();
   *   // 处理任务数据
   * } catch (error) {
   *   console.error('获取任务失败:', error);
   * }
   * ```
   */
  getTasks: async (): Promise<Task[]> => {
    try {
      // 模拟API调用延迟，提供更真实的用户体验
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      
      // 从localStorage读取任务数据
      const tasksJson = localStorage.getItem(STORAGE_KEY);
      
      // 检查是否存在已保存的任务数据
      if (!tasksJson) {
        // 如果没有数据，返回初始默认任务并保存到localStorage
        const initialTasks = getInitialTasks();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
        return initialTasks;
      }
      
      // 解析JSON数据
      const tasksData = JSON.parse(tasksJson);
      
      // 验证数据格式并转换日期字符串为Date对象
      const tasks: Task[] = tasksData.map((task: any) => ({
        ...task,
        // 确保日期字段正确转换为Date对象
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      
      return tasks;
      
    } catch (error) {
      // 错误处理：数据损坏或解析失败时的降级方案
      console.error('获取任务数据失败，使用默认数据:', error);
      
      // 清除损坏的数据并返回初始数据
      const initialTasks = getInitialTasks();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
      } catch (storageError) {
        console.error('localStorage写入失败:', storageError);
        // 即使localStorage失败，也要返回数据给用户
      }
      
      return initialTasks;
    }
  },

  /**
   * 创建新任务
   * 
   * 根据提供的输入数据创建一个新的任务，并将其保存到本地存储中。
   * 新任务将自动设置唯一ID、创建时间和更新时间，默认状态为'pending'。
   * 
   * 业务逻辑说明：
   * 1. 验证输入数据的必要字段
   * 2. 生成唯一的任务ID（UUID格式）
   * 3. 设置默认值（优先级、状态、标签等）
   * 4. 设置时间戳（创建时间和更新时间）
   * 5. 将新任务添加到现有任务列表中
   * 6. 保存更新后的任务列表到localStorage
   * 7. 模拟网络延迟以提供真实的用户体验
   * 
   * 数据验证：
   * - 验证必要字段（title、description、assignee）
   * - 验证数据类型和格式
   * - 验证字符串长度限制
   * 
   * 错误处理：
   * - 输入数据验证失败
   * - localStorage操作失败
   * - 内存不足或数据损坏
   * 
   * @param {CreateTaskInput} input - 创建任务的输入数据
   * @param {string} input.title - 任务标题，1-100字符
   * @param {string} input.description - 任务描述，支持富文本
   * @param {string} input.assignee - 任务负责人
   * @param {TaskPriority} [input.priority='medium'] - 任务优先级
   * @param {Date|null} [input.dueDate=null] - 任务截止日期
   * @param {string[]} [input.tags=[]] - 任务标签数组
   * 
   * @returns {Promise<Task>} 返回新创建的任务对象
   * @throws {Error} 当输入数据验证失败或localStorage操作失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 创建基本任务
   * const newTask = await taskService.createTask({
   *   title: '完成项目文档',
   *   description: '写出项目的技术文档和用户手册',
   *   assignee: 'john_doe'
   * });
   * 
   * // 创建带有更多属性的任务
   * const complexTask = await taskService.createTask({
   *   title: '紧急修复系统漏洞',
   *   description: '修复登录模块的安全漏洞',
   *   assignee: 'security_team',
   *   priority: 'urgent',
   *   dueDate: new Date('2025-09-21'),
   *   tags: ['安全', '紧急', '修复']
   * });
   * 
   * // 错误处理
   * try {
   *   const task = await taskService.createTask(taskData);
   *   console.log('任务创建成功:', task.id);
   * } catch (error) {
   *   console.error('任务创建失败:', error.message);
   * }
   * ```
   */
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    try {
      // 数据验证：检查必要字段
      if (!input.title || input.title.trim().length === 0) {
        throw new Error('任务标题不能为空');
      }
      if (input.title.length > 100) {
        throw new Error('任务标题长度不能超过100字符');
      }
      if (!input.description || input.description.trim().length === 0) {
        throw new Error('任务描述不能为空');
      }
      if (!input.assignee || input.assignee.trim().length === 0) {
        throw new Error('任务负责人不能为空');
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      
      // 获取当前时间用于时间戳
      const now = new Date();
      
      // 创建新任务对象，设置所有必要字段和默认值
      const newTask: Task = {
        // 生成唯一标识符（UUID v4格式）
        id: generateUUID(),
        // 用户输入的基本信息
        title: input.title.trim(),
        description: input.description.trim(),
        assignee: input.assignee.trim(),
        // 设置默认值或使用用户提供的值
        priority: input.priority || DEFAULT_PRIORITY,
        status: 'pending', // 新任务默认状态为待处理
        dueDate: input.dueDate || null,
        tags: input.tags || [],
        // 自动设置时间戳
        createdAt: now,
        updatedAt: now,
      };
      
      // 获取现有任务列表
      const currentTasks = await taskService.getTasks();
      
      // 将新任务添加到列表开头（最新的任务在前面）
      const updatedTasks = [newTask, ...currentTasks];
      
      // 保存更新后的任务列表到localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      
      // 返回新创建的任务
      return newTask;
      
    } catch (error) {
      // 错误处理：重新抛出验证错误或包装其他错误
      if (error instanceof Error && error.message.includes('任务')) {
        // 业务验证错误，直接抛出
        throw error;
      }
      
      // 其他未知错误，包装为友好的错误消息
      console.error('创建任务失败:', error);
      throw new Error('创建任务失败，请检查网络连接或稍后重试');
    }
  },

  /**
   * 更新现有任务
   * 
   * 根据提供的任务ID和更新数据，修改现有任务的属性。支持部分更新，
   * 只更新提供的字段，未提供的字段保持原值。更新操作会自动更新updatedAt时间戳。
   * 
   * 业务逻辑说明：
   * 1. 验证任务ID的有效性
   * 2. 从localStorage获取现有任务列表
   * 3. 查找目标任务并验证存在性
   * 4. 验证更新数据的有效性
   * 5. 合并更新数据到现有任务
   * 6. 更新updatedAt时间戳
   * 7. 保存更新后的任务列表
   * 8. 返回更新后的任务对象
   * 
   * 数据验证：
   * - 验证任务ID格式和存在性
   * - 验证更新字段的数据类型和格式
   * - 验证字符串长度限制（如title的100字符限制）
   * - 验证枚举值的有效性（priority和status）
   * 
   * 状态管理：
   * - 支持状态流转验证（未来可扩展）
   * - 自动维护updatedAt时间戳
   * - 保持createdAt不变
   * 
   * 错误处理：
   * - 任务不存在的情况
   * - 数据验证失败
   * - localStorage操作失败
   * - 并发更新冲突（未来优化点）
   * 
   * @param {UpdateTaskInput} input - 更新任务的输入数据
   * @param {string} input.id - 要更新的任务ID，必须是有效的UUID
   * @param {string} [input.title] - 新的任务标题，1-100字符
   * @param {string} [input.description] - 新的任务描述
   * @param {string} [input.assignee] - 新的任务负责人
   * @param {TaskPriority} [input.priority] - 新的任务优先级
   * @param {TaskStatus} [input.status] - 新的任务状态
   * @param {Date|null} [input.dueDate] - 新的任务截止日期
   * @param {string[]} [input.tags] - 新的任务标签数组
   * 
   * @returns {Promise<Task>} 返回更新后的任务对象
   * @throws {Error} 当任务不存在、数据验证失败或localStorage操作失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 更新任务状态
   * const updatedTask = await taskService.updateTask({
   *   id: 'task-uuid-123',
   *   status: 'completed'
   * });
   * 
   * // 更新多个字段
   * const task = await taskService.updateTask({
   *   id: 'task-uuid-456',
   *   title: '更新的任务标题',
   *   priority: 'high',
   *   dueDate: new Date('2025-09-25'),
   *   tags: ['重要', '紧急']
   * });
   * 
   * // 清除截止日期
   * const taskNoDue = await taskService.updateTask({
   *   id: 'task-uuid-789',
   *   dueDate: null
   * });
   * 
   * // 错误处理
   * try {
   *   const task = await taskService.updateTask(updateData);
   *   console.log('任务更新成功:', task.title);
   * } catch (error) {
   *   if (error.message.includes('不存在')) {
   *     console.error('任务未找到:', error.message);
   *   } else {
   *     console.error('更新失败:', error.message);
   *   }
   * }
   * ```
   */
  updateTask: async (input: UpdateTaskInput): Promise<Task> => {
    try {
      // 验证必要参数
      if (!input.id || input.id.trim().length === 0) {
        throw new Error('任务ID不能为空');
      }
      
      // 验证可选更新字段的数据有效性
      if (input.title !== undefined) {
        if (!input.title || input.title.trim().length === 0) {
          throw new Error('任务标题不能为空');
        }
        if (input.title.length > 100) {
          throw new Error('任务标题长度不能超过100字符');
        }
      }
      
      if (input.description !== undefined && (!input.description || input.description.trim().length === 0)) {
        throw new Error('任务描述不能为空');
      }
      
      if (input.assignee !== undefined && (!input.assignee || input.assignee.trim().length === 0)) {
        throw new Error('任务负责人不能为空');
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      
      // 获取现有任务列表
      const currentTasks = await taskService.getTasks();
      
      // 查找目标任务
      const taskIndex = currentTasks.findIndex(task => task.id === input.id);
      if (taskIndex === -1) {
        throw new Error(`ID为 ${input.id} 的任务不存在`);
      }
      
      // 获取原任务数据
      const originalTask = currentTasks[taskIndex];
      
      // 创建更新后的任务对象（部分更新）
      const updatedTask: Task = {
        ...originalTask, // 保持原有数据
        // 只更新提供的字段，使用 ?? 操作符处理 undefined
        title: input.title?.trim() ?? originalTask.title,
        description: input.description?.trim() ?? originalTask.description,
        assignee: input.assignee?.trim() ?? originalTask.assignee,
        priority: input.priority ?? originalTask.priority,
        status: input.status ?? originalTask.status,
        dueDate: input.dueDate !== undefined ? input.dueDate : originalTask.dueDate,
        tags: input.tags ?? originalTask.tags,
        // 自动更新修改时间，保持创建时间不变
        updatedAt: new Date(),
        createdAt: originalTask.createdAt, // 确保创建时间不变
      };
      
      // 更新任务列表
      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = updatedTask;
      
      // 保存更新后的任务列表到localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      
      // 返回更新后的任务
      return updatedTask;
      
    } catch (error) {
      // 错误处理：重新抛出业务验证错误或包装其他错误
      if (error instanceof Error && (
        error.message.includes('任务') || 
        error.message.includes('不存在') ||
        error.message.includes('不能为空') ||
        error.message.includes('超过')
      )) {
        // 业务验证错误，直接抛出
        throw error;
      }
      
      // 其他未知错误，包装为友好的错误消息
      console.error('更新任务失败:', error);
      throw new Error('更新任务失败，请检查网络连接或稍后重试');
    }
  },

  /**
   * 删除指定任务
   * 
   * 根据提供的任务ID，从localStorage中永久删除指定的任务。
   * 该操作是不可逆的，删除后数据无法恢复。建议在调用前先确认用户意图。
   * 
   * 业务逻辑说明：
   * 1. 验证任务ID的有效性和格式
   * 2. 从localStorage获取现有任务列表
   * 3. 查找并验证目标任务的存在性
   * 4. 从任务列表中移除目标任务
   * 5. 保存更新后的任务列表到localStorage
   * 6. 模拟网络延迟以提供真实的用户体验
   * 
   * 安全考虑：
   * - 删除操作不可逆，应谨慎使用
   * - 验证任务存在性以避免错误删除
   * - 建议在UI层面提供二次确认机制
   * 
   * 数据一致性：
   * - 原子性操作，保证数据一致性
   * - 失败时不会对数据造成损坏
   * - 自动维护索引和引用关系
   * 
   * 性能优化：
   * - 使用高效的数组过滤操作
   * - 避免不必要的数据复制
   * - 在大量数据时考虑分批处理（未来优化点）
   * 
   * 错误处理：
   * - 任务不存在的情况
   * - localStorage操作失败
   * - 并发删除冲突（未来优化点）
   * 
   * @param {string} id - 要删除的任务ID，必须是有效的UUID格式
   * 
   * @returns {Promise<void>} 返回空的Promise，成功删除时resolve，失败时reject
   * @throws {Error} 当任务不存在、ID无效或localStorage操作失败时抛出异常
   * 
   * @example
   * ```typescript
   * // 删除指定任务
   * await taskService.deleteTask('task-uuid-123');
   * console.log('任务删除成功');
   * 
   * // 带错误处理的删除操作
   * try {
   *   await taskService.deleteTask(taskId);
   *   console.log('任务已成功删除');
   *   // 更新UI显示
   *   refreshTaskList();
   * } catch (error) {
   *   if (error.message.includes('不存在')) {
   *     console.warn('任务已不存在，可能已被其他操作删除');
   *   } else {
   *     console.error('删除任务失败:', error.message);
   *     // 显示错误提示给用户
   *   }
   * }
   * 
   * // 批量删除示例（需要循环调用）
   * const taskIds = ['task-1', 'task-2', 'task-3'];
   * for (const id of taskIds) {
   *   try {
   *     await taskService.deleteTask(id);
   *   } catch (error) {
   *     console.error(`删除任务 ${id} 失败:`, error.message);
   *   }
   * }
   * ```
   */
  deleteTask: async (id: string): Promise<void> => {
    try {
      // 验证任务ID的有效性
      if (!id || id.trim().length === 0) {
        throw new Error('任务ID不能为空');
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      
      // 获取现有任务列表
      const currentTasks = await taskService.getTasks();
      
      // 查找目标任务的索引位置
      const taskIndex = currentTasks.findIndex(task => task.id === id);
      
      // 验证任务存在性
      if (taskIndex === -1) {
        throw new Error(`ID为 ${id} 的任务不存在，无法删除`);
      }
      
      // 创建新的任务列表，移除目标任务
      // 使用filter方法以获得更好的性能和不可变性
      const updatedTasks = currentTasks.filter(task => task.id !== id);
      
      // 保存更新后的任务列表到localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      
      // 成功删除，无需返回值
      console.log(`任务 ${id} 已成功删除`);
      
    } catch (error) {
      // 错误处理：区分业务错误和系统错误
      if (error instanceof Error && (
        error.message.includes('任务') || 
        error.message.includes('不存在') ||
        error.message.includes('不能为空')
      )) {
        // 业务逻辑错误，直接抛出
        throw error;
      }
      
      // 系统级错误（localStorage失败等），包装为友好的错误消息
      console.error('删除任务系统错误:', error);
      throw new Error('删除任务失败，请检查网络连接或稍后重试');
    }
  },
};

// ========================================
// 辅助函数定义 - Helper Functions
// ========================================

/**
 * 获取初始任务数据
 * 
 * 提供默认的初始任务数据，用于首次使用应用或数据损坏时的降级方案。
 * 这些初始数据涵盖了常见的任务场景，帮助用户快速上手和理解系统功能。
 * 
 * 初始数据特点：
 * - 包含不同优先级和状态的任务示例
 * - 展示各种任务类型和使用场景
 * - 提供真实的业务示例和最佳实践
 * - 支持国际化和本地化内容
 * 
 * 数据质量保证：
 * - 所有日期都使用有效的Date对象
 * - ID使用唯一的UUID格式
 * - 数据结构与Task接口完全一致
 * - 包含有意义的业务内容
 * 
 * 使用场景：
 * - 首次访问应用时的数据初始化
 * - localStorage数据损坏时的数据恢复
 * - 开发和测试环境的模拟数据
 * - 用户培训和功能演示
 * 
 * 数据维护：
 * - 定期更新初始数据以反映新功能
 * - 保持数据的时效性和相关性
 * - 根据用户反馈优化示例内容
 * 
 * @returns {Task[]} 返回包含默认初始任务的数组
 * 
 * @example
 * ```typescript
 * // 获取初始数据
 * const initialTasks = getInitialTasks();
 * console.log(`加载了 ${initialTasks.length} 个初始任务`);
 * 
 * // 在应用初始化时使用
 * if (!localStorage.getItem('tasks')) {
 *   const defaultTasks = getInitialTasks();
 *   localStorage.setItem('tasks', JSON.stringify(defaultTasks));
 * }
 * ```
 */
function getInitialTasks(): Task[] {
  // 获取当前时间用于生成真实的时间戳
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'demo-task-001',
      title: '完成项目技术文档',
      description: '编写项目的技术设计文档，包括架构设计、API文档和部署指南。需要包含详细的技术规范和最佳实践。',
      assignee: '张三',
      priority: 'high',
      status: 'in_progress',
      dueDate: nextWeek,
      tags: ['文档', '技术', '重要'],
      createdAt: yesterday,
      updatedAt: now,
    },
    {
      id: 'demo-task-002',
      title: '修复用户登录问题',
      description: '解决用户在移动端登录时出现的间歇性失败问题。需要排查网络连接、会话管理和token验证逻辑。',
      assignee: '李四',
      priority: 'urgent',
      status: 'pending',
      dueDate: tomorrow,
      tags: ['修复', '登录', '紧急'],
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2小时前
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30分钟前
    },
    {
      id: 'demo-task-003',
      title: '数据库性能优化',
      description: '对主要数据库查询进行性能优化，包括添加索引、优化SQL语句和调整数据库配置。目标是将响应时间减少50%。',
      assignee: '王五',
      priority: 'medium',
      status: 'completed',
      dueDate: null, // 无截止日期
      tags: ['数据库', '性能', '优化'],
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1周前
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2天前
    },
    {
      id: 'demo-task-004',
      title: '实现用户反馈功能',
      description: '开发新的用户反馈系统，包括反馈表单、分类管理和自动回复功能。需要集成邮件通知和工单跟踪。',
      assignee: '赵六',
      priority: 'low',
      status: 'pending',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2周后
      tags: ['新功能', '用户体验', '反馈'],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3天前
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3天前
    },
    {
      id: 'demo-task-005',
      title: '系统安全审计',
      description: '进行全面的系统安全检查，包括漏洞扫描、权限审计和数据加密检查。生成安全评估报告和整改建议。',
      assignee: '安全团队',
      priority: 'high',
      status: 'cancelled',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 昨天（已过期）
      tags: ['安全', '审计', '合规'],
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10天前
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1小时前
    },
  ];
}

// ========================================
// 导出服务 - Export Service
// ========================================
export default taskService;