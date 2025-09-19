import { Task, TaskStatus, TaskPriority, FilterCriteria, ApiResponse } from '../types';

// 模拟用户数据
const mockUsers = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'
];

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成用户认证功能开发',
    description: '实现用户登录、注册、密码重置功能',
    assignee: ['张三', '李四'],
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: '优化数据库查询性能',
    description: '分析慢查询，优化数据库索引',
    assignee: ['王五'],
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: '编写API文档',
    description: '为所有接口编写详细的API文档',
    assignee: ['赵六', '钱七'],
    priority: TaskPriority.LOW,
    status: TaskStatus.COMPLETED,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '4',
    title: '修复页面响应式布局问题',
    description: '解决移动端显示异常的问题',
    assignee: ['孙八'],
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    dueDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// 模拟API延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// API服务类
export class TaskService {
  private static tasks: Task[] = [...mockTasks];

  // 获取所有任务
  static async getAllTasks(): Promise<ApiResponse<Task[]>> {
    await delay();
    try {
      return {
        success: true,
        data: [...this.tasks]
      };
    } catch (error) {
      return {
        success: false,
        error: '获取任务列表失败'
      };
    }
  }

  // 根据筛选条件获取任务
  static async getFilteredTasks(criteria: FilterCriteria): Promise<ApiResponse<Task[]>> {
    await delay();
    try {
      let filteredTasks = [...this.tasks];

      // 关键词搜索
      if (criteria.keyword) {
        const keyword = criteria.keyword.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(keyword) ||
          task.description?.toLowerCase().includes(keyword)
        );
      }

      // 状态筛选
      if (criteria.status && criteria.status.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          criteria.status!.includes(task.status)
        );
      }

      // 优先级筛选
      if (criteria.priority && criteria.priority.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          criteria.priority!.includes(task.priority)
        );
      }

      // 负责人筛选
      if (criteria.assignee && criteria.assignee.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          task.assignee.some(assignee => criteria.assignee!.includes(assignee))
        );
      }

      return {
        success: true,
        data: filteredTasks
      };
    } catch (error) {
      return {
        success: false,
        error: '筛选任务失败'
      };
    }
  }

  // 创建任务
  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> {
    await delay();
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.tasks.push(newTask);

      return {
        success: true,
        data: newTask
      };
    } catch (error) {
      return {
        success: false,
        error: '创建任务失败'
      };
    }
  }

  // 更新任务
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    await delay();
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        return {
          success: false,
          error: '任务不存在'
        };
      }

      const updatedTask = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: new Date()
      };

      this.tasks[taskIndex] = updatedTask;

      return {
        success: true,
        data: updatedTask
      };
    } catch (error) {
      return {
        success: false,
        error: '更新任务失败'
      };
    }
  }

  // 删除任务
  static async deleteTask(taskId: string): Promise<ApiResponse<boolean>> {
    await delay();
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        return {
          success: false,
          error: '任务不存在'
        };
      }

      this.tasks.splice(taskIndex, 1);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: '删除任务失败'
      };
    }
  }

  // 归档任务
  static async archiveTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.updateTask(taskId, { status: TaskStatus.ARCHIVED });
  }

  // 取消归档任务
  static async unarchiveTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.updateTask(taskId, { status: TaskStatus.PENDING });
  }

  // 获取所有用户
  static async getAllUsers(): Promise<ApiResponse<string[]>> {
    await delay(200);
    return {
      success: true,
      data: [...mockUsers]
    };
  }
}