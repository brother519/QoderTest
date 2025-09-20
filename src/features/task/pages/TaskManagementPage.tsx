import React, { useEffect } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTaskStore } from '../store/taskStore';
import TaskList from '../components/TaskList';
import TaskFilters from '../components/TaskFilters';
import CreateTaskDialog from '../components/CreateTaskDialog';

const TaskManagementPage: React.FC = () => {
  const { statistics, calculateStatistics } = useTaskStore();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  const handleCreateTask = () => {
    setCreateDialogOpen(true);
  };

  return (
    <Box>
      {/* 顶部导航栏 */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <TaskIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            统一业务平台 - 任务管理
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
          >
            新建任务
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* 统计卡片 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TaskIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      总任务数
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      已完成
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.completed}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      进行中
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.inProgress}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      已逾期
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.overdue}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 主要内容区域 */}
        <Grid container spacing={3}>
          {/* 筛选面板 */}
          <Grid item xs={12} md={3}>
            <TaskFilters />
          </Grid>

          {/* 任务列表 */}
          <Grid item xs={12} md={9}>
            <TaskList />
          </Grid>
        </Grid>
      </Container>

      {/* 浮动创建按钮 */}
      <Fab
        color="primary"
        aria-label="创建任务"
        onClick={handleCreateTask}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* 创建任务对话框 */}
      <CreateTaskDialog 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};

export default TaskManagementPage;