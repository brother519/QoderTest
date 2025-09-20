import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Avatar,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useTaskStore } from '../store/taskStore';
import { Task, TaskStatus, TaskPriority } from '@/shared/types';

const TaskList: React.FC = () => {
  const { getFilteredTasks, updateTaskStatus, deleteTask } = useTaskStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const tasks = getFilteredTasks();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (selectedTask) {
      updateTaskStatus(selectedTask.id, status);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'default';
      case TaskStatus.IN_PROGRESS:
        return 'primary';
      case TaskStatus.REVIEW:
        return 'warning';
      case TaskStatus.DONE:
        return 'success';
      case TaskStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return '待办';
      case TaskStatus.IN_PROGRESS:
        return '进行中';
      case TaskStatus.REVIEW:
        return '审核中';
      case TaskStatus.DONE:
        return '已完成';
      case TaskStatus.CANCELLED:
        return '已取消';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'success';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return '低';
      case TaskPriority.MEDIUM:
        return '中';
      case TaskPriority.HIGH:
        return '高';
      case TaskPriority.URGENT:
        return '紧急';
      default:
        return priority;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && 
           task.dueDate < new Date() && 
           task.status !== TaskStatus.DONE;
  };

  if (tasks.length === 0) {
    return (
      <Alert severity="info">
        暂无任务数据，点击"新建任务"开始创建您的第一个任务。
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Card 
              sx={{ 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                borderLeft: 4,
                borderLeftColor: isOverdue(task) ? 'error.main' : 'transparent'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {task.description}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* 状态和优先级 */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={getStatusLabel(task.status)}
                    color={getStatusColor(task.status)}
                    size="small"
                    icon={task.status === TaskStatus.DONE ? <CheckCircleIcon /> : undefined}
                  />
                  <Chip
                    label={`优先级: ${getPriorityLabel(task.priority)}`}
                    color={getPriorityColor(task.priority)}
                    size="small"
                    variant="outlined"
                    icon={<FlagIcon />}
                  />
                  <Chip
                    label={task.category}
                    size="small"
                    variant="outlined"
                  />
                  {isOverdue(task) && (
                    <Chip
                      label="已逾期"
                      color="error"
                      size="small"
                      icon={<ScheduleIcon />}
                    />
                  )}
                </Box>

                {/* 标签 */}
                {task.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {task.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}

                {/* 底部信息 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {task.assignee && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {task.assignee[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {task.assignee}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {task.dueDate && (
                      <Typography 
                        variant="caption" 
                        color={isOverdue(task) ? 'error.main' : 'text.secondary'}
                      >
                        截止: {formatDate(task.dueDate)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      创建: {formatDate(task.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* 进度条 (仅在进行中状态显示) */}
                {task.status === TaskStatus.IN_PROGRESS && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      进度
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={50} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange(TaskStatus.TODO)}>
          标记为待办
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}>
          标记为进行中
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(TaskStatus.REVIEW)}>
          标记为审核中
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(TaskStatus.DONE)}>
          <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
          标记为完成
        </MenuItem>
        <MenuItem onClick={() => console.log('编辑任务')}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          编辑任务
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          删除任务
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;