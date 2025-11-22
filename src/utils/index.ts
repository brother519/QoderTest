/**
 * 工具函数集合
 * 
 * 功能说明：
 * - 提供项目中常用的工具函数
 * - 包括ID生成、日期格式化、颜色映射、数据过滤等
 * - 支持任务管理和用户界面交互功能
 * 
 * 使用范围：
 * - 任务管理系统
 * - 产品销售系统
 * - 通用UI组件
 * 
 * @author AI Assistant
 * @since 2025-09-20
 * @version 1.0.0
 */

// 类型定义
import { Task } from '../types';

/**
 * 生成唯一ID
 * 
 * @description 使用Math.random()生成一个9位的随机字符串ID
 * @returns {string} 生成的唯一ID字符串
 * 
 * @example
 * ```typescript
 * const taskId = generateId();
 * console.log(taskId); // 输出类似 "k3n2m5r8q" 的字符串
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @note 此方法不保证绝对唯一性，但在实际应用中冲突概率极低
 * @since 1.0.0
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 格式化日期为中文显示
 * 
 * @param {Date} date - 要格式化的日期对象
 * @returns {string} 格式化后的中文日期字符串
 * 
 * @description 
 * - 使用中文语言环境格式化日期
 * - 输出格式："2025年9月20日"
 * - 适用于任务截止日期、创建日期等显示
 * 
 * @example
 * ```typescript
 * const date = new Date('2025-09-20');
 * const formatted = formatDate(date);
 * console.log(formatted); // 输出："2025年9月20日"
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @since 1.0.0
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 格式化日期时间为中文显示（包含时分）
 * 
 * @param {Date} date - 要格式化的日期时间对象
 * @returns {string} 格式化后的中文日期时间字符串
 * 
 * @description 
 * - 在formatDate基础上增加时分显示
 * - 输出格式："2025年9月20日 14:30"
 * - 适用于任务创建时间、更新时间等详细时间显示
 * 
 * @example
 * ```typescript
 * const now = new Date();
 * const formatted = formatDateTime(now);
 * console.log(formatted); // 输出："2025年9月20日 14:30"
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @since 1.0.0
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 获取任务优先级对应的颜色
 * 
 * @param {Task['priority']} priority - 任务优先级（'HIGH' | 'MEDIUM' | 'LOW'）
 * @returns {string} Material-UI颜色主题名称
 * 
 * @description 
 * 为不同优先级返回对应的颜色主题：
 * - HIGH: 'error' (红色，表示高优先级和紧急性)
 * - MEDIUM: 'warning' (橙色，表示中等优先级)
 * - LOW: 'success' (绿色，表示低优先级)
 * - 默认: 'default' (灰色，用于未知状态)
 * 
 * @example
 * ```typescript
 * const highColor = getPriorityColor('HIGH');
 * console.log(highColor); // 输出: "error"
 * 
 * // 用于Material-UI组件
 * <Chip color={getPriorityColor(task.priority)} />
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @since 1.0.0
 */
export const getPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * 获取任务状态对应的颜色
 * 
 * @param {Task['status']} status - 任务状态（'TODO' | 'IN_PROGRESS' | 'DONE'）
 * @returns {string} Material-UI颜色主题名称
 * 
 * @description 
 * 为不同任务状态返回对应的颜色主题：
 * - TODO: 'default' (灰色，表示待处理状态)
 * - IN_PROGRESS: 'primary' (蓝色，表示正在进行中)
 * - DONE: 'success' (绿色，表示已完成)
 * - 默认: 'default' (灰色，用于未知状态)
 * 
 * @example
 * ```typescript
 * const statusColor = getStatusColor('IN_PROGRESS');
 * console.log(statusColor); // 输出: "primary"
 * 
 * // 用于Material-UI组件
 * <Chip color={getStatusColor(task.status)} />
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @since 1.0.0
 */
export const getStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'TODO':
      return 'default';
    case 'IN_PROGRESS':
      return 'primary';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * 根据过滤条件过滤任务列表
 * 
 * @param {Task[]} tasks - 要过滤的任务数组
 * @param {any} filter - 过滤条件对象
 * @param {Task['status']} [filter.status] - 按状态过滤
 * @param {Task['priority']} [filter.priority] - 按优先级过滤
 * @param {string} [filter.assignee] - 按负责人过滤
 * @param {string} [filter.search] - 按关键词搜索（标题和描述）
 * @param {string[]} [filter.tags] - 按标签过滤
 * @returns {Task[]} 过滤后的任务数组
 * 
 * @description 
 * 支持多条件组合过滤：
 * - 状态过滤：精确匹配
 * - 优先级过滤：精确匹配
 * - 负责人过滤：精确匹配
 * - 关键词搜索：模糊匹配标题和描述（不区分大小写）
 * - 标签过滤：包含任意指定标签
 * 
 * @example
 * ```typescript
 * const filteredTasks = filterTasks(allTasks, {
 *   status: 'IN_PROGRESS',
 *   priority: 'HIGH',
 *   search: '设计',
 *   tags: ['前端', 'UI']
 * });
 * ```
 * 
 * @complexity O(n*m) - n为任务数量，m为平均标签数量
 * @since 1.0.0
 */
export const filterTasks = (tasks: Task[], filter: any): Task[] => {
  return tasks.filter((task) => {
    // 状态过滤 - 精确匹配
    if (filter.status && task.status !== filter.status) return false;
    
    // 优先级过滤 - 精确匹配
    if (filter.priority && task.priority !== filter.priority) return false;
    
    // 负责人过滤 - 精确匹配
    if (filter.assignee && task.assignee !== filter.assignee) return false;
    
    // 关键词搜索 - 模糊匹配标题和描述
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !task.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    
    // 标签过滤 - 包含任意指定标签
    if (filter.tags && filter.tags.length > 0) {
      if (!filter.tags.some((tag: string) => task.tags.includes(tag))) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 防抖动函数
 * 
 * @template T - 函数类型参数
 * @param {T} func - 要进行防抖动处理的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {T} 返回防抖动处理后的函数
 * 
 * @description 
 * 防抖动机制的实现：
 * - 在指定时间内频繁调用时，只执行最后一次
 * - 适用于搜索输入、窗口尺寸变化等高频事件
 * - 使用setTimeout和clearTimeout实现
 * 
 * @example
 * ```typescript
 * // 搜索输入防抖动
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('搜索:', query);
 * }, 300);
 * 
 * // 频繁调用，但只执行最后一次
 * debouncedSearch('关键词1');
 * debouncedSearch('关键词2');
 * debouncedSearch('关键词3'); // 只有这个会执行
 * ```
 * 
 * @complexity O(1) - 时间复杂度
 * @performance 显著减少高频操作的性能开销
 * @since 1.0.0
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeout: number;
  return ((...args: any[]) => {
    // 清除上一次的定时器
    clearTimeout(timeout);
    // 设置新的定时器
    timeout = window.setTimeout(() => func(...args), delay);
  }) as T;
};