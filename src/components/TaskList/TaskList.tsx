import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { TaskCard } from '../TaskCard/TaskCard';
import { useAppContext } from '../../contexts/AppContext';
import { filterTasks } from '../../utils';

export const TaskList: React.FC = () => {
  const { state } = useAppContext();
  const { tasks, filter } = state;

  const filteredTasks = filterTasks(tasks, filter);

  if (filteredTasks.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
        textAlign="center"
      >
        <Typography variant="h6" color="text.secondary">
          {tasks.length === 0 ? '暂无任务' : '没有符合条件的任务'}
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