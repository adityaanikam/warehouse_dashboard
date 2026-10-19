// frontend/src/pages/ShipmentsPage.tsx
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { createShipment, deleteShipment, getShipments, updateShipment } from '../api/apiService';
import { IShipment } from '../types';
import { formatNumber } from '../utils/format';
import ResourcePage from '../components/ResourcePage';
import ShipmentForm, { ShipmentFormValues } from '../components/ShipmentForm';
import StatusChip from '../components/StatusChip';

const columns: GridColDef<IShipment>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  {
    field: 'item',
    headerName: 'Product',
    flex: 1,
    minWidth: 170,
    valueGetter: (_value, row) => row.item?.name ?? 'Unknown item',
  },
  {
    field: 'quantity',
    headerName: 'Units',
    type: 'number',
    width: 100,
    valueFormatter: (value: number) => formatNumber(value),
  },
  { field: 'origin', headerName: 'From', flex: 1, minWidth: 140 },
  { field: 'destination', headerName: 'To', flex: 1, minWidth: 140 },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    renderCell: ({ row }) => <StatusChip status={row.status} />,
  },
  {
    field: 'estimated_delivery_date',
    headerName: 'Est. delivery',
    type: 'date',
    width: 140,
    // "YYYY-MM-DD" parsed by hand so the date never shifts with the timezone.
    valueGetter: (_value, row) => {
      if (!row.estimated_delivery_date) return null;
      const [y, m, d] = row.estimated_delivery_date.split('-').map(Number);
      return new Date(y, m - 1, d);
    },
  },
];

const ShipmentsPage: React.FC = () => (
  <ResourcePage<IShipment, ShipmentFormValues>
    title="Shipments"
    subtitle="Track what is moving between warehouses and when it should arrive."
    singular="shipment"
    plural="shipments"
    columns={columns}
    fetchRows={getShipments}
    createRow={createShipment}
    updateRow={updateShipment}
    deleteRow={deleteShipment}
    describeRow={(row) => `Shipment #${row.id} (${row.item?.name ?? 'item'})`}
    toFormValues={(row) => ({
      item_id: row.item_id,
      quantity: row.quantity,
      origin: row.origin ?? '',
      destination: row.destination ?? '',
      status: row.status,
      estimated_delivery_date: row.estimated_delivery_date ?? '',
    })}
    renderForm={(props) => <ShipmentForm {...props} />}
  />
);

export default ShipmentsPage;
