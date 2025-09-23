import React, { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../../contexts/AppContext';
import { debounce } from '../../../utils';

export const TaskFilterPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filter, tasks } = state;
  const [expanded, setExpanded] = useState(false);

  // 获取所有独特的负责人和标签
  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee)));
  const uniqueTags = Array.from(new Set(tasks.flatMap(task => task.tags)));

  // 防抖搜索
  const debouncedSearch = debounce((value: string) => {
    dispatch({ type: 'SET_FILTER', payload: { search: value || undefined } });
  }, 300);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleStatusChange = (event: any) => {
    const value = event.target.value;
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { status: value || undefined } 
    });
  };

  const handlePriorityChange = (event: any) => {
    const value = event.target.value;
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { priority: value || undefined } 
    });
  };

  const handleAssigneeChange = (event: any) => {
    const value = event.target.value;
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { assignee: value || undefined } 
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { tags: newTags.length > 0 ? newTags : undefined } 
    });
  };

  const handleClearFilters = () => {
    dispatch({ type: 'SET_FILTER', payload: {} });
  };

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <Paper elevation={1} sx={{ mb: 3 }}>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">筛选任务</Typography>
          <Box>
            {hasActiveFilters && (
              <IconButton size="small" onClick={handleClearFilters} sx={{ mr: 1 }}>
                <ClearIcon />
              </IconButton>
            )}
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="搜索任务标题或描述..."
          variant="outlined"
          size="small"
          onChange={handleSearchChange}
          defaultValue={filter.search || ''}
          sx={{ mb: 2 }}
        />

        <Collapse in={expanded}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2} mb={2}>
            <FormControl size="small">
              <InputLabel>状态</InputLabel>
              <Select
                value={filter.status || ''}
                label="状态"
                onChange={handleStatusChange}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="TODO">待办</MenuItem>
                <MenuItem value="IN_PROGRESS">进行中</MenuItem>
                <MenuItem value="DONE">已完成</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>优先级</InputLabel>
              <Select
                value={filter.priority || ''}
                label="优先级"
                onChange={handlePriorityChange}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>负责人</InputLabel>
              <Select
                value={filter.assignee || ''}
                label="负责人"
                onChange={handleAssigneeChange}
              >
                <MenuItem value="">全部</MenuItem>
                {uniqueAssignees.map(assignee => (
                  <MenuItem key={assignee} value={assignee}>
                    {assignee}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {uniqueTags.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>标签:</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {uniqueTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={filter.tags?.includes(tag) ? 'primary' : 'default'}
                    variant={filter.tags?.includes(tag) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};