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

type Errors = Partial<Record<keyof SupplierFormValues, string>>;

const defaultValues: SupplierFormValues = { name: '', contact_person: '', email: '', phone: '' };

// Same rule as the backend: something@something.tld, no spaces.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validate(values: SupplierFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ id, initialValues, onSubmit }) => {
  const [values, setValues] = useState<SupplierFormValues>({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  const change = (field: keyof SupplierFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        // Empty optional fields are left out of the request (stored as null), not sent as "".
        contact_person: values.contact_person?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      });
    }
  };

  return (
    <Box component="form" id={id} onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} mt={1}>
        <TextField label="Company name" value={values.name} onChange={change('name')} required fullWidth autoFocus
          error={!!errors.name} helperText={errors.name} />
        <TextField label="Contact person" value={values.contact_person} onChange={change('contact_person')} fullWidth />
        <TextField label="Email" type="email" value={values.email} onChange={change('email')} required fullWidth
          error={!!errors.email} helperText={errors.email} />
        <TextField label="Phone" value={values.phone} onChange={change('phone')} fullWidth />
      </Stack>
    </Box>
  );
};

export default SupplierForm;
