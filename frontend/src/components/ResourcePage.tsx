// frontend/src/components/ResourcePage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  alpha,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { getErrorMessage } from '../api/apiService';
import CreateDialog from './CreateDialog';
import { colors, fonts } from '../theme';

export interface FormRenderProps<V> {
  id: string;
  initialValues?: V;
  onSubmit: (values: V) => void;
}

interface ResourcePageProps<T extends { id: number }, V> {
  title: string;
  subtitle: string;
  /** "item", "shipment"... used in buttons and messages. */
  singular: string;
  plural: string;
  columns: GridColDef<T>[];
  fetchRows: () => Promise<T[]>;
  createRow: (values: V) => Promise<unknown>;
  updateRow: (id: number, values: V) => Promise<unknown>;
  deleteRow: (id: number) => Promise<unknown>;
  toFormValues: (row: T) => V;
  describeRow: (row: T) => string;
  renderForm: (props: FormRenderProps<V>) => React.ReactNode;
}

type DialogState<T> = { mode: 'create' } | { mode: 'edit'; row: T } | null;

/**
 * A complete list / create / edit / delete screen. The three data pages (inventory,
 * shipments, suppliers) only describe their columns, API calls and form, and share
 * all of the loading, error, dialog and notification handling here.
 */
function ResourcePage<T extends { id: number }, V>({
  title,
  subtitle,
  singular,
  plural,
  columns,
  fetchRows,
  createRow,
  updateRow,
  deleteRow,
  toFormValues,
  describeRow,
  renderForm,
}: ResourcePageProps<T, V>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState<DialogState<T>>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setRows(await fetchRows());
    } catch (error) {
      setLoadError(getErrorMessage(error, `Could not load ${plural}.`));
    } finally {
      setLoading(false);
    }
  }, [fetchRows, plural]);

  useEffect(() => {
    load();
  }, [load]);

  const closeDialog = () => {
    setDialog(null);
    setFormError('');
  };

  const handleSubmit = async (values: V) => {
    if (!dialog) return;
    setSubmitting(true);
    setFormError('');
    try {
      if (dialog.mode === 'edit') {
        await updateRow(dialog.row.id, values);
        setNotice(`${capitalise(singular)} updated.`);
      } else {
        await createRow(values);
        setNotice(`${capitalise(singular)} created.`);
      }
      closeDialog();
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error, `Could not save the ${singular}.`));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteRow(toDelete.id);
      setToDelete(null);
      setNotice(`${capitalise(singular)} deleted.`);
      await load();
    } catch (error) {
      // e.g. 409: the row is still referenced by another record.
      setDeleteError(getErrorMessage(error, `Could not delete the ${singular}.`));
    } finally {
      setDeleting(false);
    }
  };

  const actionColumn: GridColDef<T> = {
    field: 'actions',
    type: 'actions',
    headerName: '',
    width: 96,
    getActions: (params: GridRowParams<T>) => [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon />}
        label={`Edit ${singular}`}
        onClick={() => setDialog({ mode: 'edit', row: params.row })}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon />}
        label={`Delete ${singular}`}
        onClick={() => {
          setDeleteError('');
          setToDelete(params.row);
        }}
      />,
    ],
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create' })}>
          Add {singular}
        </Button>
      </Box>

      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      <Paper sx={{ height: 'calc(100vh - 260px)', minHeight: 440, width: '100%' }}>
        <DataGrid<T>
          rows={rows}
          columns={[...columns, actionColumn]}
          loading={loading}
          showToolbar
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          localeText={{ noRowsLabel: `No ${plural} yet. Use "Add ${singular}" to create one.` }}
          sx={{
            border: 0,
            borderRadius: 0,
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader': {
              backgroundColor: colors.ink,
              color: colors.nightText,
            },
            '& .MuiDataGrid-columnHeader .MuiIconButton-root, & .MuiDataGrid-columnHeader .MuiSvgIcon-root': { color: colors.nightText },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-cell': { fontFamily: fonts.body },
            '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'action.hover' },
            '& .MuiDataGrid-row:hover': { backgroundColor: alpha(colors.orange, 0.12) },
            '& .MuiDataGrid-footerContainer': { borderTop: (theme) => `1.5px solid ${theme.palette.divider}` },
          }}
        />
      </Paper>

      <CreateDialog
        open={dialog !== null}
        onClose={closeDialog}
        title={dialog?.mode === 'edit' ? `Edit ${singular}` : `Add ${singular}`}
        formId="resource-form"
        submitting={submitting}
      >
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {dialog &&
          renderForm({
            id: 'resource-form',
            initialValues: dialog.mode === 'edit' ? toFormValues(dialog.row) : undefined,
            onSubmit: handleSubmit,
          })}
      </CreateDialog>

      <Dialog open={toDelete !== null} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {singular}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete ? `"${describeRow(toDelete)}" will be removed permanently.` : ''}
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notice}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotice('')} severity="success" variant="filled" sx={{ width: '100%' }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default ResourcePage;
