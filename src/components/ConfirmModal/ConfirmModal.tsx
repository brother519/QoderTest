import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon
} from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { ConfirmType } from '../../types';
import { TaskService } from '../../services/taskService';

const ConfirmModal: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { modalState, confirmConfig } = state;
  
  const [isProcessing, setIsProcessing] = useState(false);

  // 关闭确认对话框
  const handleClose = () => {
    dispatch({ type: 'SET_MODAL_STATE', payload: { confirm: false } });
    dispatch({ type: 'SET_CONFIRM_CONFIG', payload: null });
  };

  // 确认操作
  const handleConfirm = async () => {
    if (!confirmConfig) return;

    setIsProcessing(true);

    try {
      let response;
      
      switch (confirmConfig.type) {
        case ConfirmType.DELETE:
          response = await TaskService.deleteTask(confirmConfig.taskId);
          if (response.success) {
            dispatch({ type: 'DELETE_TASK', payload: confirmConfig.taskId });
            // 如果当前选中的任务被删除，清除选中状态
            if (state.selectedTask?.id === confirmConfig.taskId) {
              dispatch({ type: 'SET_SELECTED_TASK', payload: null });
              dispatch({ type: 'SET_MODAL_STATE', payload: { taskDetail: false } });
            }
          }
          break;
          
        case ConfirmType.ARCHIVE:
          response = await TaskService.archiveTask(confirmConfig.taskId);
          if (response.success && response.data) {
            dispatch({ type: 'UPDATE_TASK', payload: response.data });
            // 更新选中的任务状态
            if (state.selectedTask?.id === confirmConfig.taskId) {
              dispatch({ type: 'SET_SELECTED_TASK', payload: response.data });
            }
          }
          break;
          
        case ConfirmType.UNARCHIVE:
          response = await TaskService.unarchiveTask(confirmConfig.taskId);
          if (response.success && response.data) {
            dispatch({ type: 'UPDATE_TASK', payload: response.data });
            // 更新选中的任务状态
            if (state.selectedTask?.id === confirmConfig.taskId) {
              dispatch({ type: 'SET_SELECTED_TASK', payload: response.data });
            }
          }
          break;
          
        default:
          throw new Error('未知的操作类型');
      }

      if (response?.success) {
        handleClose();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response?.error || '操作失败' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '操作失败，请重试' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 获取操作图标
  const getOperationIcon = () => {
    if (!confirmConfig) return null;
    
    switch (confirmConfig.type) {
      case ConfirmType.DELETE:
        return <DeleteIcon sx={{ color: 'error.main', fontSize: 48 }} />;
      case ConfirmType.ARCHIVE:
        return <ArchiveIcon sx={{ color: 'warning.main', fontSize: 48 }} />;
      case ConfirmType.UNARCHIVE:
        return <UnarchiveIcon sx={{ color: 'info.main', fontSize: 48 }} />;
      default:
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 48 }} />;
    }
  };

  // 获取操作类型对应的颜色和文本
  const getOperationStyle = () => {
    if (!confirmConfig) return { color: 'primary', buttonText: '确认' };
    
    switch (confirmConfig.type) {
      case ConfirmType.DELETE:
        return { color: 'error' as const, buttonText: '删除' };
      case ConfirmType.ARCHIVE:
        return { color: 'warning' as const, buttonText: '归档' };
      case ConfirmType.UNARCHIVE:
        return { color: 'info' as const, buttonText: '取消归档' };
      default:
        return { color: 'primary' as const, buttonText: '确认' };
    }
  };

  if (!confirmConfig) {
    return null;
  }

  const operationStyle = getOperationStyle();

  return (
    <Dialog
      open={modalState.confirm}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { textAlign: 'center' }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {getOperationIcon()}
          <Typography variant="h5" component="h2">
            {confirmConfig.title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {confirmConfig.content}
        </Typography>

        {confirmConfig.type === ConfirmType.DELETE && (
          <Alert severity="error" sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>警告：</strong>此操作不可撤销，删除后的任务无法恢复。
            </Typography>
          </Alert>
        )}

        {confirmConfig.type === ConfirmType.ARCHIVE && (
          <Alert severity="warning" sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              归档后的任务将从常规列表中隐藏，但可以通过筛选查看或取消归档。
            </Typography>
          </Alert>
        )}

        {confirmConfig.type === ConfirmType.UNARCHIVE && (
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              取消归档后，任务将重新显示在常规任务列表中。
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          size="large"
          sx={{ minWidth: 100 }}
        >
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={operationStyle.color}
          disabled={isProcessing}
          size="large"
          sx={{ minWidth: 100 }}
        >
          {isProcessing ? '处理中...' : operationStyle.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;