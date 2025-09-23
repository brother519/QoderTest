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