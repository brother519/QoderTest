import React, { useState, useEffect } from 'react';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus, TaskPriority, CreateTaskData } from '@/types/Task';

/**
 * 任务管理组件
 * 
 * 演示TaskService的使用方法，包括任务的增删改查操作。
 * 这是一个完整的任务管理界面示例。
 */
const TaskManager: React.FC = () => {
  // 组件状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');

  /**
   * 加载任务列表
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const taskList = await taskService.getTasks();
      setTasks(taskList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建新任务
   */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      setError('任务标题不能为空');
      return;
    }

    try {
      setError('');
      const taskData: CreateTaskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: TaskPriority.MEDIUM
      };

      await taskService.createTask(taskData);
      setNewTaskTitle('');
      setNewTaskDescription('');
      await loadTasks(); // 重新加载任务列表
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败');
    }
  };

  /**
   * 更新任务状态
   */
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      setError('');
      await taskService.updateTask(taskId, { status });
      await loadTasks(); // 重新加载任务列表
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新任务失败');
    }
  };

  /**
   * 删除任务
   */
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('确定要删除这个任务吗？')) {
      return;
    }

    try {
      setError('');
      await taskService.deleteTask(taskId);
      await loadTasks(); // 重新加载任务列表
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除任务失败');
    }
  };

  /**
   * 获取状态显示文本
   */
  const getStatusText = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return '待处理';
      case TaskStatus.IN_PROGRESS:
        return '进行中';
      case TaskStatus.COMPLETED:
        return '已完成';
      case TaskStatus.CANCELLED:
        return '已取消';
      default:
        return '未知';
    }
  };

  /**
   * 获取优先级显示文本
   */
  const getPriorityText = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.HIGH:
        return '高';
      case TaskPriority.MEDIUM:
        return '中';
      case TaskPriority.LOW:
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 获取优先级样式类名
   */
  const getPriorityClass = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.MEDIUM:
        return 'priority-medium';
      case TaskPriority.LOW:
        return 'priority-low';
      default:
        return '';
    }
  };

  /**
   * 组件挂载时加载任务
   */
  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="task-manager">
      <h1>任务管理系统</h1>
      
      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          错误: {error}
        </div>
      )}

      {/* 新建任务表单 */}
      <div className="create-task-form">
        <h2>创建新任务</h2>
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label htmlFor="taskTitle">任务标题 *</label>
            <input
              id="taskTitle"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="请输入任务标题"
              maxLength={100}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="taskDescription">任务描述</label>
            <textarea
              id="taskDescription"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="请输入任务描述（可选）"
              maxLength={1000}
              rows={3}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            创建任务
          </button>
        </form>
      </div>

      {/* 任务列表 */}
      <div className="task-list">
        <h2>任务列表</h2>
        
        {loading ? (
          <div className="loading">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            暂无任务，请创建第一个任务。
          </div>
        ) : (
          <div className="tasks">
            {tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span className="task-status">
                    状态: {getStatusText(task.status)}
                  </span>
                  <span className="task-date">
                    创建: {task.createdAt.toLocaleDateString()}
                  </span>
                  {task.dueDate && (
                    <span className="task-due-date">
                      截止: {task.dueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* 任务操作按钮 */}
                <div className="task-actions">
                  {task.status === TaskStatus.PENDING && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}
                      className="btn btn-action"
                    >
                      开始执行
                    </button>
                  )}
                  
                  {task.status === TaskStatus.IN_PROGRESS && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.COMPLETED)}
                      className="btn btn-success"
                    >
                      标记完成
                    </button>
                  )}
                  
                  {task.status !== TaskStatus.COMPLETED && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.CANCELLED)}
                      className="btn btn-warning"
                    >
                      取消任务
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;