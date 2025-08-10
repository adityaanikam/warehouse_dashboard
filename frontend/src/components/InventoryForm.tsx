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

const defaultValues: InventoryFormValues = {
  name: '',
  quantity: 0,
  category: '',
  price: 0,
  supplier_id: undefined,
};

const InventoryForm: React.FC<InventoryFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<InventoryFormValues>({ ...defaultValues, ...initialValues });
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormValues, string>>>({});

  useEffect(() => {
    getSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  const validateField = (field: keyof InventoryFormValues, value: any): string => {
    switch (field) {
      case 'name':
        return value.trim() === '' ? 'Name is required' : '';
      case 'category':
        return value.trim() === '' ? 'Category is required' : '';
      case 'quantity':
        return value < 0 ? 'Quantity must be non-negative' : '';
      case 'price':
        return value < 0 ? 'Price must be non-negative' : '';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof InventoryFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === 'quantity' || field === 'price') value = Number(value);
    if (field === 'supplier_id') value = value === '' ? undefined : Number(value);
    
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Partial<Record<keyof InventoryFormValues, string>> = {};
    let hasErrors = false;
    
    Object.keys(values).forEach((key) => {
      const field = key as keyof InventoryFormValues;
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (!hasErrors) {
      onSubmit(values);
    }
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField 
          label="Name" 
          value={values.name} 
          onChange={handleChange('name')} 
          required 
          fullWidth 
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField 
          label="Category" 
          value={values.category} 
          onChange={handleChange('category')} 
          required 
          fullWidth 
          error={!!errors.category}
          helperText={errors.category}
        />
        <TextField 
          label="Quantity" 
          type="number" 
          value={values.quantity} 
          onChange={handleChange('quantity')} 
          required 
          fullWidth 
          error={!!errors.quantity}
          helperText={errors.quantity}
          inputProps={{ min: 0 }}
        />
        <TextField 
          label="Price" 
          type="number" 
          value={values.price} 
          onChange={handleChange('price')} 
          required 
          fullWidth 
          error={!!errors.price}
          helperText={errors.price}
          inputProps={{ min: 0, step: 0.01 }}
        />
        <TextField 
          select 
          label="Supplier" 
          value={values.supplier_id ?? ''} 
          onChange={handleChange('supplier_id')} 
          fullWidth
        >
          <MenuItem value="">None</MenuItem>
          {suppliers.map((s) => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default InventoryForm;