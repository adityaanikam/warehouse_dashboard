// frontend/src/components/StatusChip.tsx
import React from 'react';
import { Chip } from '@mui/material';

type ChipColor = 'default' | 'info' | 'warning' | 'success' | 'error';

const STATUS_COLORS: Record<string, ChipColor> = {
  Pending: 'default',
  'In Transit': 'info',
  Delivered: 'success',
  Delayed: 'error',
};

/** Coloured pill for a shipment status. Unknown statuses fall back to a neutral chip. */
const StatusChip: React.FC<{ status: string }> = ({ status }) => (
  <Chip size="small" label={status} color={STATUS_COLORS[status] ?? 'default'} variant="outlined" />
);

export default StatusChip;
