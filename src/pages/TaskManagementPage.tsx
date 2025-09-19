import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Fab,
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { TaskService } from '../services/taskService';
import TaskFilterPanel from '../components/TaskFilterPanel/TaskFilterPanel';
import TaskList from '../components/TaskList/TaskList';
import CreateTaskModal from '../components/CreateTaskModal/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal/TaskDetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';

const TaskManagementPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const {
    tasks,
    filteredTasks,
    filterCriteria,
    modalState,
    loading,
    error
  } = state;

  // 初始化加载任务数据
  useEffect(() => {
    loadTasks();
  }, []);

  // 当筛选条件改变时，重新筛选任务
  useEffect(() => {
    if (tasks.length > 0) {
      filterTasks();
    }
  }, [filterCriteria, tasks]);

  // 加载所有任务
  const loadTasks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await TaskService.getAllTasks();
      if (response.success && response.data) {
        dispatch({ type: 'SET_TASKS', payload: response.data });
        dispatch({ type: 'SET_FILTERED_TASKS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '加载任务失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '加载任务失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 根据筛选条件筛选任务
  const filterTasks = async () => {
    try {
      const response = await TaskService.getFilteredTasks(filterCriteria);
      if (response.success && response.data) {
        dispatch({ type: 'SET_FILTERED_TASKS', payload: response.data });
      }
    } catch (error) {
      console.error('筛选任务失败:', error);
    }
  };

  // 打开创建任务模态框
  const handleOpenCreateModal = () => {
    dispatch({ type: 'SET_MODAL_STATE', payload: { createTask: true } });
  };

  // 关闭错误提示
  const handleCloseError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          任务管理系统
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          高效管理您的任务，提升工作效率
        </Typography>
      </Box>

      {/* 筛选面板 */}
      <Box sx={{ mb: 3 }}>
        <TaskFilterPanel />
      </Box>

      {/* 任务数量统计 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          共找到 {filteredTasks.length} 个任务
        </Typography>
      </Box>

      {/* 任务列表 */}
      <TaskList />

      {/* 创建任务浮动按钮 */}
      <Fab
        color="primary"
        aria-label="创建任务"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={handleOpenCreateModal}
      >
        <AddIcon />
      </Fab>

      {/* 模态框组件 */}
      {modalState.createTask && <CreateTaskModal />}
      {modalState.taskDetail && <TaskDetailModal />}
      {modalState.confirm && <ConfirmModal />}

      {/* 加载状态 */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskManagementPage;