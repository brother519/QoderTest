import { ValidationError, Task, TaskPriority } from '../types';

// 表单验证工具函数
export class ValidationUtils {
  // 验证任务标题
  static validateTitle(title: string): ValidationError | null {
    if (!title || title.trim().length === 0) {
      return { field: 'title', message: '任务标题不能为空' };
    }
    if (title.length > 200) {
      return { field: 'title', message: '任务标题不能超过200个字符' };
    }
    return null;
  }

  // 验证负责人
  static validateAssignee(assignee: string[]): ValidationError | null {
    if (!assignee || assignee.length === 0) {
      return { field: 'assignee', message: '请至少选择一个负责人' };
    }
    return null;
  }

  // 验证优先级
  static validatePriority(priority: TaskPriority | undefined): ValidationError | null {
    if (!priority) {
      return { field: 'priority', message: '请选择任务优先级' };
    }
    return null;
  }

  // 验证完成时间
  static validateDueDate(dueDate: Date | undefined): ValidationError | null {
    if (dueDate && dueDate < new Date()) {
      return { field: 'dueDate', message: '完成时间不能早于当前时间' };
    }
    return null;
  }

  // 验证整个任务表单
  static validateTask(task: Partial<Task>): ValidationError[] {
    const errors: ValidationError[] = [];

    const titleError = this.validateTitle(task.title || '');
    if (titleError) errors.push(titleError);

    const assigneeError = this.validateAssignee(task.assignee || []);
    if (assigneeError) errors.push(assigneeError);

    const priorityError = this.validatePriority(task.priority);
    if (priorityError) errors.push(priorityError);

    const dueDateError = this.validateDueDate(task.dueDate);
    if (dueDateError) errors.push(dueDateError);

    return errors;
  }
}

// 日期格式化工具函数
export class DateUtils {
  // 格式化日期为字符串
  static formatDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 格式化日期时间为字符串
  static formatDateTime(date: Date): string {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 判断日期是否过期
  static isOverdue(date: Date): boolean {
    return date < new Date();
  }

  // 计算距离今天的天数
  static getDaysFromNow(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// 任务工具函数
export class TaskUtils {
  // 获取任务状态的中文显示
  static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': '待开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'archived': '已归档'
    };
    return statusMap[status] || status;
  }

  // 获取任务优先级的中文显示
  static getPriorityText(priority: string): string {
    const priorityMap: Record<string, string> = {
      'high': '高',
      'medium': '中',
      'low': '低'
    };
    return priorityMap[priority] || priority;
  }

  // 获取任务优先级的颜色
  static getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'high': '#f44336',
      'medium': '#ff9800',
      'low': '#4caf50'
    };
    return colorMap[priority] || '#999';
  }

  // 获取任务状态的颜色
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': '#9e9e9e',
      'in_progress': '#2196f3',
      'completed': '#4caf50',
      'archived': '#607d8b'
    };
    return colorMap[status] || '#999';
  }

  // 生成任务摘要
  static generateTaskSummary(task: Task): string {
    const assigneeText = task.assignee.length > 2 
      ? `${task.assignee.slice(0, 2).join('、')}等${task.assignee.length}人`
      : task.assignee.join('、');

    let summary = `负责人：${assigneeText}`;
    
    if (task.dueDate) {
      const daysFromNow = DateUtils.getDaysFromNow(task.dueDate);
      if (daysFromNow < 0) {
        summary += ` | 已逾期${Math.abs(daysFromNow)}天`;
      } else if (daysFromNow === 0) {
        summary += ` | 今天到期`;
      } else {
        summary += ` | ${daysFromNow}天后到期`;
      }
    }

    return summary;
  }
}

// 通用工具函数
export class CommonUtils {
  // 防抖函数
  static debounce<T extends (...args: any[]) => void>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 生成唯一ID
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 深拷贝对象
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // 检查对象是否为空
  static isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  }
}