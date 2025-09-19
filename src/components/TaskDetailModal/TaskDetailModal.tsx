import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormHelperText,
  Box,
  Typography,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import { Task, TaskPriority, ValidationError } from '../../types';
import { TaskService } from '../../services/taskService';
import { ValidationUtils, TaskUtils, DateUtils } from '../../utils';

const TaskDetailModal: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { modalState, selectedTask } = state;

  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    assignee: [] as string[],
    priority: '' as TaskPriority | ''
  });

  // 可用用户列表
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  
  // 验证错误
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (selectedTask && modalState.taskDetail) {
      setFormData({
        assignee: [...selectedTask.assignee],
        priority: selectedTask.priority
      });
      loadUsers();
    }
  }, [selectedTask, modalState.taskDetail]);

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const response = await TaskService.getAllUsers();
      if (response.success && response.data) {
        setAvailableUsers(response.data);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    dispatch({ type: 'SET_MODAL_STATE', payload: { taskDetail: false } });
    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
    setIsEditing(false);
    setErrors([]);
    setIsSubmitting(false);
  };

  // 切换编辑模式
  const handleToggleEdit = () => {
    if (isEditing) {
      // 取消编辑，恢复原始数据
      if (selectedTask) {
        setFormData({
          assignee: [...selectedTask.assignee],
          priority: selectedTask.priority
        });
      }
      setErrors([]);
    }
    setIsEditing(!isEditing);
  };

  // 处理负责人选择
  const handleAssigneeChange = (user: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignee: checked
        ? [...prev.assignee, user]
        : prev.assignee.filter(u => u !== user)
    }));
    
    // 清除负责人字段的错误
    setErrors(prev => prev.filter(error => error.field !== 'assignee'));
  };

  // 处理优先级变化
  const handlePriorityChange = (priority: TaskPriority) => {
    setFormData(prev => ({ ...prev, priority }));
    
    // 清除优先级字段的错误
    setErrors(prev => prev.filter(error => error.field !== 'priority'));
  };

  // 表单验证
  const validateForm = (): boolean => {
    const validationErrors: ValidationError[] = [];

    const assigneeError = ValidationUtils.validateAssignee(formData.assignee);
    if (assigneeError) validationErrors.push(assigneeError);

    const priorityError = ValidationUtils.validatePriority(formData.priority as TaskPriority);
    if (priorityError) validationErrors.push(priorityError);

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // 保存修改
  const handleSave = async () => {
    if (!selectedTask || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updates = {
        assignee: formData.assignee,
        priority: formData.priority as TaskPriority
      };

      const response = await TaskService.updateTask(selectedTask.id, updates);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data });
        dispatch({ type: 'SET_SELECTED_TASK', payload: response.data });
        setIsEditing(false);
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '更新任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '更新任务失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取字段错误信息
  const getFieldError = (field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error?.message;
  };

  if (!selectedTask) {
    return null;
  }

  return (
    <Dialog
      open={modalState.taskDetail}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="h2">
          任务详情
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* 任务标题 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              任务标题
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedTask.title}
            </Typography>
          </Grid>

          {/* 任务描述 */}
          {selectedTask.description && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                任务描述
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {selectedTask.description}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 任务状态和时间信息 */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              任务状态
            </Typography>
            <Chip
              label={TaskUtils.getStatusText(selectedTask.status)}
              sx={{
                backgroundColor: TaskUtils.getStatusColor(selectedTask.status),
                color: 'white',
                fontWeight: 500
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              创建时间
            </Typography>
            <Typography variant="body1">
              {DateUtils.formatDateTime(selectedTask.createdAt)}
            </Typography>
          </Grid>

          {selectedTask.dueDate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                完成时间
              </Typography>
              <Typography variant="body1">
                {DateUtils.formatDate(selectedTask.dueDate)}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              最后更新
            </Typography>
            <Typography variant="body1">
              {DateUtils.formatDateTime(selectedTask.updatedAt)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 可编辑字段：优先级 */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              优先级 {isEditing && '*'}
            </Typography>
            {isEditing ? (
              <FormControl fullWidth required error={!!getFieldError('priority')}>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  label="优先级"
                >
                  <MenuItem value={TaskPriority.HIGH}>高优先级</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>中优先级</MenuItem>
                  <MenuItem value={TaskPriority.LOW}>低优先级</MenuItem>
                </Select>
                {getFieldError('priority') && (
                  <FormHelperText>{getFieldError('priority')}</FormHelperText>
                )}
              </FormControl>
            ) : (
              <Chip
                label={TaskUtils.getPriorityText(selectedTask.priority)}
                sx={{
                  backgroundColor: TaskUtils.getPriorityColor(selectedTask.priority),
                  color: 'white',
                  fontWeight: 500
                }}
              />
            )}
          </Grid>

          {/* 可编辑字段：负责人 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              负责人 {isEditing && '*'}
            </Typography>
            {isEditing ? (
              <FormControl 
                component="fieldset" 
                error={!!getFieldError('assignee')}
                required
              >
                <FormGroup>
                  <Grid container spacing={1}>
                    {availableUsers.map((user) => (
                      <Grid item xs={6} sm={4} md={3} key={user}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.assignee.includes(user)}
                              onChange={(e) => handleAssigneeChange(user, e.target.checked)}
                            />
                          }
                          label={user}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
                {getFieldError('assignee') && (
                  <FormHelperText>{getFieldError('assignee')}</FormHelperText>
                )}
              </FormControl>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedTask.assignee.map((user) => (
                  <Chip key={user} label={user} />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} size="large">
          关闭
        </Button>
        
        {isEditing ? (
          <>
            <Button
              onClick={handleToggleEdit}
              disabled={isSubmitting}
              size="large"
            >
              取消编辑
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting ? '保存中...' : '保存修改'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleToggleEdit}
            variant="contained"
            size="large"
          >
            编辑任务
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailModal;