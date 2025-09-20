import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button
} from '@mui/material';
import { TaskStatus, TaskPriority } from '@/shared/types';
import { useTaskStore } from '../store/taskStore';

const TaskFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useTaskStore();

  const handleStatusFilter = (status: TaskStatus[]) => {
    setFilters({ ...filters, status });
  };

  const handlePriorityFilter = (priority: TaskPriority[]) => {
    setFilters({ ...filters, priority });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          筛选任务
        </Typography>

        {/* 状态筛选 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>状态</InputLabel>
          <Select
            multiple
            value={filters.status || []}
            onChange={(e) => handleStatusFilter(e.target.value as TaskStatus[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            <MenuItem value={TaskStatus.TODO}>待办</MenuItem>
            <MenuItem value={TaskStatus.IN_PROGRESS}>进行中</MenuItem>
            <MenuItem value={TaskStatus.REVIEW}>审核中</MenuItem>
            <MenuItem value={TaskStatus.DONE}>已完成</MenuItem>
            <MenuItem value={TaskStatus.CANCELLED}>已取消</MenuItem>
          </Select>
        </FormControl>

        {/* 优先级筛选 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>优先级</InputLabel>
          <Select
            multiple
            value={filters.priority || []}
            onChange={(e) => handlePriorityFilter(e.target.value as TaskPriority[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            <MenuItem value={TaskPriority.LOW}>低</MenuItem>
            <MenuItem value={TaskPriority.MEDIUM}>中</MenuItem>
            <MenuItem value={TaskPriority.HIGH}>高</MenuItem>
            <MenuItem value={TaskPriority.URGENT}>紧急</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="outlined" 
          fullWidth 
          onClick={clearFilters}
        >
          清除筛选
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;