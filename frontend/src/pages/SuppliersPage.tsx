// frontend/src/pages/SuppliersPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert, Snackbar } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { createSupplier, getSuppliers } from '../api/apiService';
import { ISupplier } from '../types';
import CreateDialog from '../components/CreateDialog';
import SupplierForm, { SupplierFormValues } from '../components/SupplierForm';

/**
 * Renders the suppliers management page with a data table and create functionality.
 */
const SuppliersPage: React.FC = () => {
  const [items, setItems] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSuppliers();
      setItems(data);
    } catch (error) {
      setError('Failed to fetch suppliers. Please try again.');
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async (values: SupplierFormValues) => {
    try {
      setSubmitting(true);
      setError('');
      await createSupplier(values as any);
      setSuccessMessage('Supplier created successfully!');
      setOpen(false);
      await fetchItems();
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || 'Failed to create supplier. Please try again.';
      setError(errorMessage);
      console.error('Failed to create supplier', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Supplier Name', width: 250 },
    { field: 'contact_person', headerName: 'Contact Person', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Supplier Management</Typography>
        <Button variant="contained" onClick={handleOpen}>Add New Supplier</Button>
      </Box>
      
      <Paper style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>

      <CreateDialog
        open={open}
        onClose={handleClose}
        title="Add New Supplier"
        formId="supplier-form"
        submitting={submitting}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <SupplierForm id="supplier-form" onSubmit={handleSubmit} />
      </CreateDialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuppliersPage;