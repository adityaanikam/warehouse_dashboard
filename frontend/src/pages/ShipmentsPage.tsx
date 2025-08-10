// frontend/src/pages/ShipmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert, Snackbar } from '@mui/material';
// FIX: Import GridRenderCellParams for consistency
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { createShipment, getShipments } from '../api/apiService';
import { IShipment } from '../types';
import CreateDialog from '../components/CreateDialog';
import ShipmentForm, { ShipmentFormValues } from '../components/ShipmentForm';

/**
 * Renders the shipments management page with a data table and create functionality.
 */
const ShipmentsPage: React.FC = () => {
  const [items, setItems] = useState<IShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getShipments();
      setItems(data);
    } catch (error) {
      setError('Failed to fetch shipments. Please try again.');
      console.error("Failed to fetch shipments:", error);
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

  const handleSubmit = async (values: ShipmentFormValues) => {
    try {
      setSubmitting(true);
      setError('');
      await createShipment(values as any);
      setSuccessMessage('Shipment created successfully!');
      handleClose();
      await fetchItems();
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || 'Failed to create shipment. Please try again.';
      setError(errorMessage);
      console.error('Failed to create shipment', e);
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
    {
      field: 'item',
      headerName: 'Product Name',
      width: 200,
      renderCell: (params: GridRenderCellParams) => params.row.item?.name || 'N/A',
    },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 110 },
    { field: 'origin', headerName: 'Origin', width: 150 },
    { field: 'destination', headerName: 'Destination', width: 150 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'estimated_delivery_date',
      headerName: 'Est. Delivery',
      width: 150,
      type: 'date',
      valueGetter: (value, row) => {
        const iso = (row as any)?.estimated_delivery_date as string | undefined;
        return iso ? new Date(iso) : null;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Shipment Tracking</Typography>
        <Button variant="contained" onClick={handleOpen}>Add New Shipment</Button>
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
        title="Add New Shipment"
        formId="shipment-form"
        submitting={submitting}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <ShipmentForm id="shipment-form" onSubmit={handleSubmit} />
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

export default ShipmentsPage;