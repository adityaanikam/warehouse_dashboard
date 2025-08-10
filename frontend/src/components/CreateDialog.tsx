// frontend/src/components/CreateDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

type CreateDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  formId: string;
  submitting?: boolean;
  children: React.ReactNode;
};

const CreateDialog: React.FC<CreateDialogProps> = ({ open, title, onClose, formId, submitting = false, children }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button type="submit" form={formId} variant="contained" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDialog;


