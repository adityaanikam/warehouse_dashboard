// frontend/src/components/SupplierForm.tsx
import React, { useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';

export type SupplierFormValues = {
  name: string;
  contact_person?: string;
  email: string;
  phone?: string;
};

type SupplierFormProps = {
  id: string;
  initialValues?: Partial<SupplierFormValues>;
  onSubmit: (values: SupplierFormValues) => void;
};

const defaultValues: SupplierFormValues = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
};

const SupplierForm: React.FC<SupplierFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<SupplierFormValues>({ ...defaultValues, ...initialValues });

  const handleChange = (field: keyof SupplierFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField label="Name" value={values.name} onChange={handleChange('name')} required fullWidth />
        <TextField label="Contact Person" value={values.contact_person} onChange={handleChange('contact_person')} fullWidth />
        <TextField label="Email" type="email" value={values.email} onChange={handleChange('email')} required fullWidth />
        <TextField label="Phone" value={values.phone} onChange={handleChange('phone')} fullWidth />
      </Stack>
    </Box>
  );
};

export default SupplierForm;