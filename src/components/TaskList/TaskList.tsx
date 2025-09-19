import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import TaskCard from '../TaskCard/TaskCard';

const TaskList: React.FC = () => {
  const { state } = useAppContext();
  const { filteredTasks } = state;

  if (filteredTasks.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          暂无任务
        </Typography>
        <Typography variant="body2" color="text.secondary">
          点击右下角的"+"按钮创建新任务
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {filteredTasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id}>
          <TaskCard task={task} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskList;