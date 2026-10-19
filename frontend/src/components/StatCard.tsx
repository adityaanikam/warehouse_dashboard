// frontend/src/components/StatCard.tsx
import React from 'react';
import { alpha, Box, Paper, Skeleton, Typography } from '@mui/material';

type StatCardProps = {
  label: string;
  value?: string;
  caption?: string;
  icon: React.ReactNode;
  /** Theme palette key used to tint the icon badge. */
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
};

/** A headline number with an icon badge. Shows a skeleton while the value loads. */
const StatCard: React.FC<StatCardProps> = ({ label, value, caption, icon, tone = 'primary', loading = false }) => (
  <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
    <Box
      sx={(theme) => ({
        width: 48,
        height: 48,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 2.5,
        color: theme.palette[tone].main,
        backgroundColor: alpha(theme.palette[tone].main, 0.14),
      })}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" noWrap>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={90} height={38} />
      ) : (
        <Typography variant="h5" noWrap>
          {value ?? '-'}
        </Typography>
      )}
      {caption && !loading && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {caption}
        </Typography>
      )}
    </Box>
  </Paper>
);

export default StatCard;
