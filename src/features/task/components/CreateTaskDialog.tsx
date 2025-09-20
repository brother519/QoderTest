import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TaskPriority, TaskStatus } from '@/shared/types';
import { useTaskStore } from '../store/taskStore';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onClose }) => {
  const { addTask } = useTaskStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: '',
    assignee: '',
    dueDate: null as Date | null,
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      return;
    }

    addTask({
      title: formData.title,
      description: formData.description,
      status: TaskStatus.TODO,
      priority: formData.priority,
      category: formData.category || '默认分类',
      assignee: formData.assignee || undefined,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags
    });

    // 重置表单
    setFormData({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      category: '',
      assignee: '',
      dueDate: null,
      tags: []
    });
    setTagInput('');
    onClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>创建新任务</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 任务标题 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务标题"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>

            {/* 任务描述 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="任务描述"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>

            {/* 优先级和分类 */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <MenuItem value={TaskPriority.LOW}>低</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>中</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>高</MenuItem>
                  <MenuItem value={TaskPriority.URGENT}>紧急</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="分类"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="如：开发、设计、测试"
              />
            </Grid>

            {/* 负责人和截止日期 */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="负责人"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                label="截止日期"
                value={formData.dueDate}
                onChange={(date) => handleInputChange('dueDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            {/* 标签 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="添加标签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入标签后按回车添加"
              />
              
              {formData.tags.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title.trim()}
          >
            创建任务
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateTaskDialog;