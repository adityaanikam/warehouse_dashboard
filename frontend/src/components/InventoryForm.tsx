// frontend/src/components/InventoryForm.tsx
import React, { useEffect, useState } from 'react';
import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { ISupplier } from '../types';
import { getSuppliers } from '../api/apiService';

export type InventoryFormValues = {
  name: string;
  quantity: number;
  category: string;
  price: number;
  supplier_id?: number;
};

type InventoryFormProps = {
  id: string;
  initialValues?: Partial<InventoryFormValues>;
  onSubmit: (values: InventoryFormValues) => void;
};

type Errors = Partial<Record<keyof InventoryFormValues, string>>;

const defaultValues: InventoryFormValues = { name: '', quantity: 0, category: '', price: 0, supplier_id: undefined };

function validate(values: InventoryFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.category.trim()) errors.category = 'Category is required';
  if (!Number.isInteger(values.quantity) || values.quantity < 0) errors.quantity = 'Enter a whole number, 0 or more';
  if (!(values.price >= 0)) errors.price = 'Price cannot be negative';
  return errors;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<InventoryFormValues>({ ...defaultValues, ...initialValues });
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  const update = (next: InventoryFormValues) => {
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const text = (field: 'name' | 'category') => (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ ...values, [field]: e.target.value });

  const number = (field: 'quantity' | 'price') => (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ ...values, [field]: e.target.value === '' ? NaN : Number(e.target.value) });

  const supplier = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ ...values, supplier_id: e.target.value === '' ? undefined : Number(e.target.value) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit({ ...values, name: values.name.trim(), category: values.category.trim() });
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField label="Name" value={values.name} onChange={text('name')} required fullWidth autoFocus
          error={!!errors.name} helperText={errors.name} />
        <TextField label="Category" value={values.category} onChange={text('category')} required fullWidth
          error={!!errors.category} helperText={errors.category} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Quantity" type="number" value={Number.isNaN(values.quantity) ? '' : values.quantity}
            onChange={number('quantity')} required fullWidth error={!!errors.quantity} helperText={errors.quantity}
            slotProps={{ htmlInput: { min: 0, step: 1 } }} />
          <TextField label="Price ($)" type="number" value={Number.isNaN(values.price) ? '' : values.price}
            onChange={number('price')} required fullWidth error={!!errors.price} helperText={errors.price}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
        </Stack>
        <TextField select label="Supplier" value={values.supplier_id ?? ''} onChange={supplier} fullWidth>
          <MenuItem value="">No supplier</MenuItem>
          {suppliers.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default InventoryForm;
