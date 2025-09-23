/**
 * 确认操作模态框组件
 * 
 * 该组件提供一个通用的确认对话框，用于处理需要用户明确确认的危险操作。
 * 组件支持自定义标题、消息内容和确认回调函数，通过全局状态管理显示控制。
 * 
 * 主要功能特性：
 * - 动态配置对话框标题和内容
 * - 支持自定义确认操作回调
 * - 提供标准的取消和确认按钮
 * - 自动处理模态框的打开和关闭状态
 * 
 * 使用场景：
 * - 删除任务确认
 * - 重要数据变更确认
 * - 不可逆操作的二次确认
 * 
 * @fileoverview 通用确认操作模态框组件
 * @author 任务管理系统开发团队
 * @version 1.0.0
 * @created 2025-01-20
 * @lastModified 2025-01-20
 * 
 * @example
 * ```tsx
 * // 在其他组件中触发确认对话框
 * const handleDelete = () => {
 *   dispatch({
 *     type: 'SET_CONFIRM_MODAL_CONFIG',
 *     payload: {
 *       title: '删除确认',
 *       message: '确定要删除这个任务吗？此操作不可撤销。',
 *       onConfirm: () => deleteTask(taskId)
 *     }
 *   });
 *   dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: true });
 * };
 * ```
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAppContext } from '../../../contexts/AppContext';

export const ConfirmModal: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isConfirmModalOpen, confirmModalConfig } = state;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_CONFIRM_MODAL', payload: false });
    dispatch({ type: 'SET_CONFIRM_MODAL_CONFIG', payload: null });
  };

  const handleConfirm = () => {
    if (confirmModalConfig?.onConfirm) {
      confirmModalConfig.onConfirm();
    }
    handleClose();
  };

  if (!confirmModalConfig) {
    return null;
  }

  return (
    <Dialog
      open={isConfirmModalOpen}
      onClose={handleClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {confirmModalConfig.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {confirmModalConfig.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          取消
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};