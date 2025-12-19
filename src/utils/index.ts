/**
 * 通用工具函数模块
 * 
 * 提供项目中使用的通用工具函数，包括ID生成、日期处理、
 * 数据验证等功能。这些函数被设计为纯函数，无副作用。
 */

/**
 * 生成唯一的任务ID
 * 
 * 使用时间戳和随机数组合生成唯一标识符，
 * 格式为：task_[timestamp]_[randomString]
 * 
 * @returns {string} 生成的唯一ID，格式如 "task_1640995200000_abc123"
 * 
 * @example
 * ```typescript
 * const taskId = generateId();
 * console.log(taskId); // "task_1640995200000_abc123"
 * ```
 */
export function generateId(): string {
  // 获取当前时间戳，确保时间唯一性
  const timestamp = Date.now();
  
  // 生成6位随机字符串，增加唯一性保证
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8);
  
  // 组合时间戳和随机字符串生成最终ID
  return `task_${timestamp}_${randomString}`;
}

/**
 * 延迟执行函数（用于模拟异步操作）
 * 
 * 返回一个Promise，在指定时间后resolve，
 * 主要用于模拟网络请求的延迟效果
 * 
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise<void>} 延迟Promise
 * 
 * @example
 * ```typescript
 * await delay(1000); // 延迟1秒
 * console.log('1秒后执行');
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * 深度克隆对象
 * 
 * 使用JSON序列化方式实现对象的深度复制，
 * 注意：不能处理函数、undefined、Symbol等类型
 * 
 * @template T - 要克隆的对象类型
 * @param {T} obj - 要克隆的对象
 * @returns {T} 克隆后的新对象
 * 
 * @example
 * ```typescript
 * const original = { name: 'test', nested: { value: 1 } };
 * const cloned = deepClone(original);
 * cloned.nested.value = 2; // 不会影响原对象
 * ```
 */
export function deepClone<T>(obj: T): T {
  // 使用JSON序列化实现深度克隆
  // 注意：此方法不能处理函数、Date对象、undefined等特殊类型
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 格式化日期为字符串
 * 
 * 将Date对象格式化为易读的字符串格式
 * 格式：YYYY-MM-DD HH:mm:ss
 * 
 * @param {Date} date - 要格式化的日期对象
 * @returns {string} 格式化后的日期字符串
 * 
 * @example
 * ```typescript
 * const now = new Date();
 * const formatted = formatDate(now);
 * console.log(formatted); // "2023-12-01 14:30:25"
 * ```
 */
export function formatDate(date: Date): string {
  // 获取年月日时分秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // 组合成最终格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 检查字符串是否为空或只包含空白字符
 * 
 * @param {string | undefined | null} str - 要检查的字符串
 * @returns {boolean} 如果字符串为空或只包含空白字符则返回true
 * 
 * @example
 * ```typescript
 * isEmptyString(''); // true
 * isEmptyString('   '); // true
 * isEmptyString('hello'); // false
 * isEmptyString(null); // true
 * ```
 */
export function isEmptyString(str: string | undefined | null): boolean {
  // 检查null、undefined或空字符串
  return !str || str.trim().length === 0;
}

/**
 * 安全的JSON解析
 * 
 * 提供带有默认值的JSON解析功能，避免解析失败时抛出异常
 * 
 * @template T - 期望的解析结果类型
 * @param {string} jsonString - 要解析的JSON字符串
 * @param {T} defaultValue - 解析失败时的默认值
 * @returns {T} 解析结果或默认值
 * 
 * @example
 * ```typescript
 * const result = safeJsonParse('{"name":"test"}', {});
 * const failed = safeJsonParse('invalid json', { name: 'default' });
 * ```
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    // 尝试解析JSON字符串
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    // 解析失败时返回默认值
    console.warn('JSON解析失败，使用默认值:', error);
    return defaultValue;
  }
}