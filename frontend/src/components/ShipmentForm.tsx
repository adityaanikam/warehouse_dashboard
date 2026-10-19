// frontend/src/components/ShipmentForm.tsx
import React, { useEffect, useState } from 'react';
import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { IInventoryItem, SHIPMENT_STATUSES } from '../types';
import { getInventoryItems } from '../api/apiService';

export type ShipmentFormValues = {
  item_id: number;
  quantity: number;
  origin: string;
  destination: string;
  status: string;
  estimated_delivery_date: string; // YYYY-MM-DD
};

type ShipmentFormProps = {
  id: string;
  initialValues?: Partial<ShipmentFormValues>;
  onSubmit: (values: ShipmentFormValues) => void;
};

type Errors = Partial<Record<keyof ShipmentFormValues, string>>;

const today = () => new Date().toISOString().slice(0, 10);

function validate(values: ShipmentFormValues): Errors {
  const errors: Errors = {};
  if (!values.item_id) errors.item_id = 'Choose an item';
  if (!Number.isInteger(values.quantity) || values.quantity < 1) errors.quantity = 'Enter a whole number, 1 or more';
  if (!values.origin.trim()) errors.origin = 'Origin is required';
  if (!values.destination.trim()) errors.destination = 'Destination is required';
  if (!values.estimated_delivery_date) errors.estimated_delivery_date = 'Pick a date';
  return errors;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<ShipmentFormValues>({
    item_id: 0,
    quantity: 1,
    origin: '',
    destination: '',
    status: 'Pending',
    estimated_delivery_date: today(),
    ...initialValues,
  });
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getInventoryItems().then(setItems).catch(() => setItems([]));
  }, []);

  const update = (next: ShipmentFormValues) => {
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const change = (field: keyof ShipmentFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const value = field === 'quantity' || field === 'item_id' ? (raw === '' ? 0 : Number(raw)) : raw;
    update({ ...values, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...values, origin: values.origin.trim(), destination: values.destination.trim() });
    }
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField select label="Item" value={values.item_id || ''} onChange={change('item_id')} required fullWidth
          error={!!errors.item_id} helperText={errors.item_id}>
          {items.map((i) => (
            <MenuItem key={i.id} value={i.id}>
              {i.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Quantity" type="number" value={values.quantity} onChange={change('quantity')} required fullWidth
          error={!!errors.quantity} helperText={errors.quantity} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="From" value={values.origin} onChange={change('origin')} required fullWidth
            error={!!errors.origin} helperText={errors.origin} />
          <TextField label="To" value={values.destination} onChange={change('destination')} required fullWidth
            error={!!errors.destination} helperText={errors.destination} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Status" value={values.status} onChange={change('status')} required fullWidth>
            {SHIPMENT_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Estimated delivery" type="date" value={values.estimated_delivery_date}
            onChange={change('estimated_delivery_date')} required fullWidth
            error={!!errors.estimated_delivery_date} helperText={errors.estimated_delivery_date}
            slotProps={{ inputLabel: { shrink: true } }} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default ShipmentForm;
