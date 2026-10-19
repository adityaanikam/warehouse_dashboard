// frontend/src/pages/InventoryPage.tsx
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from '../api/apiService';
import { IInventoryItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
import InventoryForm, { InventoryFormValues } from '../components/InventoryForm';
import ResourcePage from '../components/ResourcePage';

const LOW_STOCK = 10;

const columns: GridColDef<IInventoryItem>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Product', flex: 1, minWidth: 180 },
  { field: 'category', headerName: 'Category', width: 160 },
  {
    field: 'quantity',
    headerName: 'In stock',
    type: 'number',
    width: 150,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, width: '100%', height: '100%' }}>
        {row.quantity < LOW_STOCK && <Chip size="small" color="warning" label="Low" />}
        <Typography variant="body2">{formatNumber(row.quantity)}</Typography>
      </Box>
    ),
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    width: 120,
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'supplier',
    headerName: 'Supplier',
    flex: 1,
    minWidth: 160,
    valueGetter: (_value, row) => row.supplier?.name ?? 'No supplier',
  },
];

const toApiPayload = (values: InventoryFormValues) => ({ ...values, supplier_id: values.supplier_id ?? null });

const InventoryPage: React.FC = () => (
  <ResourcePage<IInventoryItem, InventoryFormValues>
    title="Inventory"
    subtitle="Everything in stock. Items under 10 units are flagged as low."
    singular="item"
    plural="items"
    columns={columns}
    fetchRows={getInventoryItems}
    createRow={(values) => createInventoryItem(toApiPayload(values))}
    updateRow={(id, values) => updateInventoryItem(id, toApiPayload(values))}
    deleteRow={deleteInventoryItem}
    describeRow={(row) => row.name}
    toFormValues={(row) => ({
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      price: row.price,
      supplier_id: row.supplier_id ?? undefined,
    })}
    renderForm={(props) => <InventoryForm {...props} />}
  />
);

export default InventoryPage;
