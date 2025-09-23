/**
 * 任务详情查看模态框组件
 * 
 * 该组件提供一个综合的任务信息展示界面，允许用户查看任务的所有详细信息，
 * 并提供快速编辑和删除功能。组件采用响应式设计，支持不同屏幕尺寸的适配。
 * 
 * 主要功能特性：
 * - 完整的任务信息展示（标题、描述、状态、优先级等）
 * - 智能状态标签显示（优先级、状态、逾期提醒）
 * - 日期时间格式化展示和逾期检测
 * - 标签管理和展示
 * - 快速编辑和删除操作
 * - 安全删除确认机制
 * 
 * 交互设计：
 * - 点击编辑按钮直接跳转到编辑模式
 * - 删除操作需要用户确认以防止误操作
 * - 自动关闭模态框并清理状态
 * 
 * @fileoverview 任务详情查看模态框组件
 * @author 任务管理系统开发团队
 * @version 1.0.0
 * @created 2025-01-20
 * @lastModified 2025-01-20
 * 
 * @example
 * ```tsx
 * // 在TaskList组件中触发详情查看
 * const handleViewTask = (task: Task) => {
 *   dispatch({ type: 'SET_SELECTED_TASK', payload: task });
 *   dispatch({ type: 'TOGGLE_DETAIL_MODAL', payload: true });
 * };
 * 
 * // 在App组件中引入
 * <TaskDetailModal />
 * ```
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../../contexts/AppContext';
import { formatDateTime, getPriorityColor, getStatusColor } from '../../../utils';

export const TaskDetailModal: React.FC = () => {
  const { state, dispatch, showConfirmDialog, deleteTask } = useAppContext();
  const { isDetailModalOpen, selectedTask } = state;

  if (!selectedTask) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_DETAIL_MODAL', payload: false });
    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
  };

  const handleEdit = () => {
    dispatch({ type: 'TOGGLE_DETAIL_MODAL', payload: false });
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: true });
  };

  const handleDelete = () => {
    showConfirmDialog(
      '删除任务',
      `确定要删除任务"${selectedTask.title}"吗？此操作无法撤销。`,
      async () => {
        try {
          await deleteTask(selectedTask.id);
          handleClose();
        } catch (error) {
          console.error('删除任务失败:', error);
        }
      }
    );
  };

  const isOverdue = selectedTask.dueDate && 
    selectedTask.dueDate < new Date() && 
    selectedTask.status !== 'DONE';

  return (
    <Dialog
      open={isDetailModalOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {selectedTask.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={selectedTask.priority}
              color={getPriorityColor(selectedTask.priority) as any}
              size="small"
            />
            <Chip
              label={selectedTask.status.replace('_', ' ')}
              color={getStatusColor(selectedTask.status) as any}
              size="small"
            />
            {isOverdue && (
              <Chip
                label="已逾期"
                color="error"
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              描述
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedTask.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              负责人
            </Typography>
            <Typography variant="body1">
              {selectedTask.assignee}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              截止日期
            </Typography>
            <Typography 
              variant="body1" 
              color={isOverdue ? 'error' : 'text.primary'}
            >
              {selectedTask.dueDate 
                ? formatDateTime(selectedTask.dueDate) 
                : '未设置'
              }
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              标签
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedTask.tags.length > 0 ? (
                selectedTask.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    variant="outlined"
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  无标签
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              创建时间
            </Typography>
            <Typography variant="body2">
              {formatDateTime(selectedTask.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              最后更新
            </Typography>
            <Typography variant="body2">
              {formatDateTime(selectedTask.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          关闭
        </Button>
        <Button
          onClick={handleEdit}
          variant="outlined"
          startIcon={<EditIcon />}
        >
          编辑
        </Button>
        <Button
          onClick={handleDelete}
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
        >
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
};