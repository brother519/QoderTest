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
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import { useAppContext } from '../../contexts/AppContext';
import { Task, TaskPriority, TaskStatus, ValidationError } from '../../types';
import { TaskService } from '../../services/taskService';
import { ValidationUtils } from '../../utils';

const CreateTaskModal: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { modalState } = state;

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: [] as string[],
    priority: '' as TaskPriority | '',
    dueDate: null as Date | null
  });

  // 可用用户列表
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  
  // 验证错误
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化用户列表
  useEffect(() => {
    if (modalState.createTask) {
      loadUsers();
    }
  }, [modalState.createTask]);

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
    dispatch({ type: 'SET_MODAL_STATE', payload: { createTask: false } });
    // 重置表单
    setFormData({
      title: '',
      description: '',
      assignee: [],
      priority: '',
      dueDate: null
    });
    setErrors([]);
    setIsSubmitting(false);
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除相关字段的错误
    setErrors(prev => prev.filter(error => error.field !== field));
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

  // 表单验证
  const validateForm = (): boolean => {
    const taskData: Partial<Task> = {
      title: formData.title,
      assignee: formData.assignee,
      priority: formData.priority as TaskPriority,
      dueDate: formData.dueDate || undefined
    };

    const validationErrors = ValidationUtils.validateTask(taskData);
    setErrors(validationErrors);
    
    return validationErrors.length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee,
        priority: formData.priority as TaskPriority,
        status: TaskStatus.PENDING,
        dueDate: formData.dueDate || undefined
      };

      const response = await TaskService.createTask(taskData);
      
      if (response.success && response.data) {
        dispatch({ type: 'ADD_TASK', payload: response.data });
        handleClose();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '创建任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '创建任务失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取字段错误信息
  const getFieldError = (field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error?.message;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Dialog
        open={modalState.createTask}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="h2">
            创建新任务
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* 任务标题 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务标题"
                placeholder="请输入任务标题..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!getFieldError('title')}
                helperText={getFieldError('title')}
                multiline
                rows={2}
                required
              />
            </Grid>

            {/* 任务描述 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务描述"
                placeholder="请输入任务描述（可选）..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            {/* 优先级选择 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!getFieldError('priority')}>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
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
            </Grid>

            {/* 完成时间 */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="完成时间（可选）"
                value={formData.dueDate}
                onChange={(date) => handleInputChange('dueDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!getFieldError('dueDate'),
                    helperText: getFieldError('dueDate')
                  }
                }}
                minDate={new Date()}
              />
            </Grid>

            {/* 负责人选择 */}
            <Grid item xs={12}>
              <FormControl 
                component="fieldset" 
                error={!!getFieldError('assignee')}
                required
              >
                <Typography variant="subtitle1" gutterBottom>
                  选择负责人 *
                </Typography>
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
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            size="large"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            size="large"
          >
            {isSubmitting ? '创建中...' : '创建任务'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateTaskModal;