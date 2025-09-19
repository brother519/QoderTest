import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { Task, ConfirmType, TaskStatus } from '../../types';
import { TaskUtils, DateUtils } from '../../utils';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { dispatch } = useAppContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 处理点击任务卡片
  const handleCardClick = () => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
    dispatch({ type: 'SET_MODAL_STATE', payload: { taskDetail: true } });
  };

  // 处理菜单打开
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  // 处理删除任务
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'SET_CONFIRM_CONFIG',
      payload: {
        type: ConfirmType.DELETE,
        taskId: task.id,
        title: '确认删除任务',
        content: `确定要删除任务"${task.title}"吗？此操作不可撤销。`
      }
    });
    dispatch({ type: 'SET_MODAL_STATE', payload: { confirm: true } });
    handleMenuClose();
  };

  // 处理归档任务
  const handleArchive = (event: React.MouseEvent) => {
    event.stopPropagation();
    const isArchived = task.status === TaskStatus.ARCHIVED;
    dispatch({
      type: 'SET_CONFIRM_CONFIG',
      payload: {
        type: isArchived ? ConfirmType.UNARCHIVE : ConfirmType.ARCHIVE,
        taskId: task.id,
        title: isArchived ? '确认取消归档' : '确认归档任务',
        content: isArchived 
          ? `确定要取消归档任务"${task.title}"吗？`
          : `确定要归档任务"${task.title}"吗？`
      }
    });
    dispatch({ type: 'SET_MODAL_STATE', payload: { confirm: true } });
    handleMenuClose();
  };

  // 判断是否逾期
  const isOverdue = task.dueDate && DateUtils.isOverdue(task.dueDate) && task.status !== TaskStatus.COMPLETED;
  const daysFromNow = task.dueDate ? DateUtils.getDaysFromNow(task.dueDate) : null;

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        },
        border: isOverdue ? '2px solid #f44336' : 'none',
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 卡片头部 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {task.title}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* 任务描述 */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* 标签区域 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={TaskUtils.getStatusText(task.status)}
            size="small"
            sx={{
              backgroundColor: TaskUtils.getStatusColor(task.status),
              color: 'white',
              fontWeight: 500
            }}
          />
          <Chip
            label={TaskUtils.getPriorityText(task.priority)}
            size="small"
            sx={{
              backgroundColor: TaskUtils.getPriorityColor(task.priority),
              color: 'white',
              fontWeight: 500
            }}
          />
        </Box>

        {/* 负责人头像组 */}
        <Box sx={{ mb: 2 }}>
          <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
            {task.assignee.map((name, index) => (
              <Tooltip key={index} title={name} arrow>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    bgcolor: `hsl(${(name.charCodeAt(0) * 137) % 360}, 50%, 60%)`
                  }}
                >
                  {name.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>

        {/* 底部信息 */}
        <Box sx={{ mt: 'auto' }}>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isOverdue ? (
                <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
              ) : (
                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: isOverdue ? 'error.main' : 'text.secondary',
                  fontWeight: isOverdue ? 600 : 400
                }}
              >
                {isOverdue
                  ? `已逾期 ${Math.abs(daysFromNow!)} 天`
                  : daysFromNow === 0
                  ? '今天到期'
                  : daysFromNow! > 0
                  ? `${daysFromNow} 天后到期`
                  : `${DateUtils.formatDate(task.dueDate)}`
                }
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleMenuClose()}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleDelete}>
          删除任务
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          {task.status === TaskStatus.ARCHIVED ? '取消归档' : '归档任务'}
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;