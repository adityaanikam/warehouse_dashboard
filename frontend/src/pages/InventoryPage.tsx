// frontend/src/pages/InventoryPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert, Snackbar } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { createInventoryItem, getInventoryItems } from '../api/apiService';
import { IInventoryItem } from '../types';
import CreateDialog from '../components/CreateDialog';
import InventoryForm, { InventoryFormValues } from '../components/InventoryForm';

/**
 * Renders the inventory management page with a data table and create functionality.
 */
const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInventoryItems();
      setItems(data);
    } catch (error) {
      setError('Failed to fetch inventory items. Please try again.');
      console.error("Failed to fetch inventory items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async (values: InventoryFormValues) => {
    try {
      setSubmitting(true);
      setError('');
      await createInventoryItem(values as any);
      setSuccessMessage('Item created successfully!');
      handleClose();
      await fetchItems();
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || 'Failed to create item. Please try again.';
      setError(errorMessage);
      console.error('Failed to create item', e);
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
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 110 },
    { field: 'price', headerName: 'Price ($)', type: 'number', width: 110 },
    {
      field: 'supplier',
      headerName: 'Supplier',
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.row.supplier?.name || 'N/A',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button variant="contained" onClick={handleOpen}>Add New Item</Button>
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
        title="Add New Item"
        formId="inventory-form"
        submitting={submitting}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <InventoryForm id="inventory-form" onSubmit={handleSubmit} />
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

export default InventoryPage;