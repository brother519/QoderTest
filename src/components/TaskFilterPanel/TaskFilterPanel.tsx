import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Grid,
  Button,
  Typography
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { TaskStatus, TaskPriority, FilterCriteria } from '../../types';
import { TaskService } from '../../services/taskService';
import { CommonUtils, TaskUtils } from '../../utils';

const TaskFilterPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filterCriteria } = state;

  // 本地状态
  const [localCriteria, setLocalCriteria] = useState<FilterCriteria>({});
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);

  // 防抖搜索
  const debouncedSearch = CommonUtils.debounce((criteria: FilterCriteria) => {
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: criteria });
  }, 300);

  // 初始化用户列表
  useEffect(() => {
    loadUsers();
  }, []);

  // 同步本地状态和全局状态
  useEffect(() => {
    setLocalCriteria(filterCriteria);
  }, [filterCriteria]);

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

  // 处理关键词搜索
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = event.target.value;
    const newCriteria = { ...localCriteria, keyword };
    setLocalCriteria(newCriteria);
    debouncedSearch(newCriteria);
  };

  // 处理状态筛选
  const handleStatusChange = (event: any) => {
    const status = event.target.value as TaskStatus[];
    const newCriteria = { ...localCriteria, status };
    setLocalCriteria(newCriteria);
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: newCriteria });
  };

  // 处理优先级筛选
  const handlePriorityChange = (event: any) => {
    const priority = event.target.value as TaskPriority[];
    const newCriteria = { ...localCriteria, priority };
    setLocalCriteria(newCriteria);
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: newCriteria });
  };

  // 处理负责人筛选
  const handleAssigneeChange = (event: any) => {
    const assignee = event.target.value as string[];
    const newCriteria = { ...localCriteria, assignee };
    setLocalCriteria(newCriteria);
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: newCriteria });
  };

  // 清空所有筛选条件
  const handleClearFilters = () => {
    const emptyCriteria = {};
    setLocalCriteria(emptyCriteria);
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: emptyCriteria });
  };

  // 检查是否有激活的筛选条件
  const hasActiveFilters = !CommonUtils.isEmpty(localCriteria);

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          任务筛选
        </Typography>
        {hasActiveFilters && (
          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            size="small"
            color="inherit"
          >
            清空筛选
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* 关键词搜索 */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="搜索任务"
            placeholder="输入任务标题或描述..."
            value={localCriteria.keyword || ''}
            onChange={handleKeywordChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
            size="small"
          />
        </Grid>

        {/* 状态筛选 */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>任务状态</InputLabel>
            <Select
              multiple
              value={localCriteria.status || []}
              onChange={handleStatusChange}
              input={<OutlinedInput label="任务状态" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={TaskUtils.getStatusText(value)}
                      size="small"
                      sx={{
                        backgroundColor: TaskUtils.getStatusColor(value),
                        color: 'white'
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.values(TaskStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {TaskUtils.getStatusText(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 优先级筛选 */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>优先级</InputLabel>
            <Select
              multiple
              value={localCriteria.priority || []}
              onChange={handlePriorityChange}
              input={<OutlinedInput label="优先级" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={TaskUtils.getPriorityText(value)}
                      size="small"
                      sx={{
                        backgroundColor: TaskUtils.getPriorityColor(value),
                        color: 'white'
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.values(TaskPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {TaskUtils.getPriorityText(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 负责人筛选 */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>负责人</InputLabel>
            <Select
              multiple
              value={localCriteria.assignee || []}
              onChange={handleAssigneeChange}
              input={<OutlinedInput label="负责人" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableUsers.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TaskFilterPanel;