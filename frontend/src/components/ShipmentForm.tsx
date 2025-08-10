// frontend/src/components/ShipmentForm.tsx
import React, { useEffect, useState } from 'react';
import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { IInventoryItem } from '../types';
import { getInventoryItems } from '../api/apiService';

export type ShipmentFormValues = {
  item_id: number;
  quantity: number;
  origin: string;
  destination: string;
  status: string;
  estimated_delivery_date: string; // ISO string
};

type ShipmentFormProps = {
  id: string;
  initialValues?: Partial<ShipmentFormValues>;
  onSubmit: (values: ShipmentFormValues) => void;
};

const defaultValues: ShipmentFormValues = {
  item_id: 0,
  quantity: 0,
  origin: '',
  destination: '',
  status: 'Pending',
  estimated_delivery_date: new Date().toISOString().slice(0, 10),
};

const ShipmentForm: React.FC<ShipmentFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<ShipmentFormValues>({ ...defaultValues, ...initialValues });
  const [items, setItems] = useState<IInventoryItem[]>([]);

  useEffect(() => {
    getInventoryItems().then(setItems).catch(() => setItems([]));
  }, []);

  const handleChange = (field: keyof ShipmentFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === 'quantity' || field === 'item_id') value = Number(value);
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField select label="Item" value={values.item_id} onChange={handleChange('item_id')} required fullWidth>
          {items.map((i) => (
            <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
          ))}
        </TextField>
        <TextField label="Quantity" type="number" value={values.quantity} onChange={handleChange('quantity')} required fullWidth />
        <TextField label="Origin" value={values.origin} onChange={handleChange('origin')} required fullWidth />
        <TextField label="Destination" value={values.destination} onChange={handleChange('destination')} required fullWidth />
        <TextField select label="Status" value={values.status} onChange={handleChange('status')} required fullWidth>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Transit">In Transit</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </TextField>
        <TextField
          label="Estimated Delivery Date"
          type="date"
          value={values.estimated_delivery_date}
          onChange={handleChange('estimated_delivery_date')}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    </Box>
  );
};

export default ShipmentForm;