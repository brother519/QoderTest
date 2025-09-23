/**
 * 任务卡片组件
 * 
 * 功能说明：
 * - 展示单个任务的详细信息，包括标题、描述、优先级、状态、标签等
 * - 提供任务操作功能：查看详情、编辑、删除
 * - 支持逾期状态显示和视觉提示
 * - 提供悬停交互效果和响应式设计
 * 
 * 使用场景：
 * - 任务管理页面的任务列表展示
 * - 看板视图中的任务卡片
 * 
 * @author AI Assistant
 * @since 2025-09-20
 * @version 1.0.0
 */

// React核心库
import React from 'react';

// Material-UI组件库 - UI组件
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
} from '@mui/material';

// Material-UI图标库 - 操作图标
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

// 本地模块 - 类型定义
import { Task } from '../../../types';

// 本地模块 - 工具函数
import { formatDate, getPriorityColor, getStatusColor } from '../../../utils';

// 本地模块 - 应用上下文
import { useAppContext } from '../../../contexts/AppContext';

/**
 * 任务卡片组件的Props接口
 * 
 * @interface TaskCardProps
 * @description 定义任务卡片组件接收的属性
 */
interface TaskCardProps {
  /** 要显示的任务对象，包含任务的完整信息 */
  task: Task;
}

/**
 * 任务卡片组件
 * 
 * @component
 * @description 展示单个任务信息的卡片组件，支持查看、编辑、删除操作
 * 
 * @param {TaskCardProps} props - 组件属性
 * @param {Task} props.task - 要显示的任务对象
 * 
 * @returns {JSX.Element} 任务卡片组件
 * 
 * @example
 * ```tsx
 * <TaskCard task={taskData} />
 * ```
 * 
 * @since 1.0.0
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // 从应用上下文获取状态管理和操作函数
  const { dispatch, showConfirmDialog, deleteTask } = useAppContext();
  
  // 菜单锚点元素状态，用于控制操作菜单的显示位置
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  /**
   * 打开操作菜单
   * 
   * @param {React.MouseEvent<HTMLElement>} event - 点击事件对象
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * 关闭操作菜单
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * 处理查看任务详情操作
   * 
   * @description 设置选中的任务并打开详情模态框
   */
  const handleView = () => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
    dispatch({ type: 'TOGGLE_DETAIL_MODAL', payload: true });
    handleMenuClose();
  };

  /**
   * 处理编辑任务操作
   * 
   * @description 设置选中的任务并打开编辑模态框
   */
  const handleEdit = () => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: true });
    handleMenuClose();
  };

  /**
   * 处理删除任务操作
   * 
   * @description 显示确认对话框，用户确认后执行删除操作
   */
  const handleDelete = () => {
    showConfirmDialog(
      '删除任务',
      `确定要删除任务"${task.title}"吗？此操作无法撤销。`,
      async () => {
        try {
          await deleteTask(task.id);
        } catch (error) {
          console.error('删除任务失败:', error);
        }
      }
    );
    handleMenuClose();
  };

  // 计算任务是否逾期：有截止日期且已过期且状态不是已完成
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'DONE';

  return (
    {/* 任务卡片主容器 - 支持逾期状态样式和悬停效果 */}
    <Card 
      sx={{ 
        mb: 2,
        border: isOverdue ? '2px solid #f44336' : 'none', // 逾期任务显示红色边框
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardContent>
        {/* 任务标题和操作按钮区域 */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
            {task.title}
          </Typography>
          {/* 更多操作按钮 */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* 任务描述 */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>

        {/* 任务状态标签区域 - 优先级、状态、逾期提示 */}
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {/* 优先级标签 */}
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority) as any}
            size="small"
          />
          {/* 任务状态标签 */}
          <Chip
            label={task.status.replace('_', ' ')}
            color={getStatusColor(task.status) as any}
            size="small"
          />
          {/* 逾期警告标签 - 仅在任务逾期时显示 */}
          {isOverdue && (
            <Chip
              label="已逾期"
              color="error"
              size="small"
            />
          )}
        </Box>

        {/* 任务标签区域 - 显示所有关联标签 */}
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
          {task.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>

        {/* 任务基本信息区域 - 负责人和截止日期 */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            负责人: {task.assignee}
          </Typography>
          {/* 截止日期 - 逾期时显示红色文字 */}
          {task.dueDate && (
            <Typography variant="body2" color={isOverdue ? 'error' : 'text.secondary'}>
              截止日期: {formatDate(task.dueDate)}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* 操作菜单 - 提供查看、编辑、删除功能 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* 查看详情菜单项 */}
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} />
          查看详情
        </MenuItem>
        {/* 编辑任务菜单项 */}
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          编辑
        </MenuItem>
        {/* 删除任务菜单项 - 红色文字提示危险操作 */}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>
    </Card>
  );
};