import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import { Task } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  priority: Task['priority'];
  status: Task['status'];
  dueDate: Date | null;
  tags: string[];
}

export const CreateTaskModal: React.FC = () => {
  const { state, dispatch, createTask, updateTask } = useAppContext();
  const { isCreateModalOpen, selectedTask, tasks } = state;
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assignee: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: null,
    tags: [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  const isEditMode = Boolean(selectedTask);
  // 获取现有的负责人列表12345
  const existingAssignees = Array.from(new Set(tasks.map(task => task.assignee)));

  useEffect(() => {
    if (isCreateModalOpen) {
      if (selectedTask) {
        // 编辑模式 - 填充现有数据
        setFormData({
          title: selectedTask.title,
          description: selectedTask.description,
          assignee: selectedTask.assignee,
          priority: selectedTask.priority,
          status: selectedTask.status,
          dueDate: selectedTask.dueDate,
          tags: [...selectedTask.tags],
        });
      } else {
        // 创建模式 - 重置表单
        setFormData({
          title: '',
          description: '',
          assignee: '',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: null,
          tags: [],
        });
      }
      setErrors({});
    }
  }, [isCreateModalOpen, selectedTask]);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
    setFormData({
      title: '',
      description: '',
      assignee: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: null,
      tags: [],
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof TaskFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '描述不能为空';
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = '负责人不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && selectedTask) {
        await updateTask(selectedTask.id, formData);
      } else {
        await createTask(formData);
      }
      handleClose();
    } catch (error) {
      console.error('保存任务失败:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Dialog
        open={isCreateModalOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? '编辑任务' : '创建新任务'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务标题"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={Boolean(errors.title)}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务描述"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange('description')}
                error={Boolean(errors.description)}
                helperText={errors.description}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="负责人"
                value={formData.assignee}
                onChange={handleInputChange('assignee')}
                error={Boolean(errors.assignee)}
                helperText={errors.assignee}
                required
                inputProps={{ list: "assignee-list" }}
              />
              <datalist id="assignee-list">
                {existingAssignees.map(assignee => (
                  <option key={assignee} value={assignee} />
                ))}
              </datalist>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="截止日期"
                value={formData.dueDate}
                onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={formData.priority}
                  label="优先级"
                  onChange={handleInputChange('priority')}
                >
                  <MenuItem value="LOW">低</MenuItem>
                  <MenuItem value="MEDIUM">中</MenuItem>
                  <MenuItem value="HIGH">高</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>状态</InputLabel>
                <Select
                  value={formData.status}
                  label="状态"
                  onChange={handleInputChange('status')}
                >
                  <MenuItem value="TODO">待办</MenuItem>
                  <MenuItem value="IN_PROGRESS">进行中</MenuItem>
                  <MenuItem value="DONE">已完成</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                标签
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  size="small"
                  placeholder="添加标签"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  添加
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {isEditMode ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};