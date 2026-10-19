// frontend/src/pages/SuppliersPage.tsx
import React from 'react';
import { Link } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '../api/apiService';
import { ISupplier } from '../types';
import ResourcePage from '../components/ResourcePage';
import SupplierForm, { SupplierFormValues } from '../components/SupplierForm';

const columns: GridColDef<ISupplier>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Supplier', flex: 1, minWidth: 180 },
  { field: 'contact_person', headerName: 'Contact', flex: 1, minWidth: 150 },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 220,
    renderCell: ({ row }) => (
      <Link href={`mailto:${row.email}`} underline="hover">
        {row.email}
      </Link>
    ),
  },
  { field: 'phone', headerName: 'Phone', width: 170 },
];

const SuppliersPage: React.FC = () => (
  <ResourcePage<ISupplier, SupplierFormValues>
    title="Suppliers"
    subtitle="The companies you buy stock from."
    singular="supplier"
    plural="suppliers"
    columns={columns}
    fetchRows={getSuppliers}
    createRow={createSupplier}
    updateRow={updateSupplier}
    deleteRow={deleteSupplier}
    describeRow={(row) => row.name}
    toFormValues={(row) => ({
      name: row.name,
      contact_person: row.contact_person ?? '',
      email: row.email,
      phone: row.phone ?? '',
    })}
    renderForm={(props) => <SupplierForm {...props} />}
  />
);

export default SuppliersPage;
