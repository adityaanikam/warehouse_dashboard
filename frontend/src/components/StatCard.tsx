// frontend/src/components/StatCard.tsx
import React from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { colors, fonts } from '../theme';

type StatCardProps = {
  label: string;
  value?: string;
  caption?: string;
  icon: React.ReactNode;
  /** `warning` and `error` get an orange edge, like a "check this" tag. */
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
};

/** A figure on a shipping-label style card: caption strip, big monospaced number, barcode. */
const StatCard: React.FC<StatCardProps> = ({ label, value, caption, icon, tone = 'primary', loading = false }) => {
  const flagged = tone === 'warning' || tone === 'error';

  return (
    <Paper
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderLeft: (theme) => `8px solid ${flagged ? colors.orange : theme.palette.text.primary}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          borderBottom: (theme) => `1.5px dashed ${theme.palette.divider}`,
          color: 'text.secondary',
        }}
      >
        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', '& svg': { fontSize: 18 } }}>{icon}</Box>
      </Box>

      <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
        {loading ? (
          <Skeleton variant="rectangular" width={110} height={38} />
        ) : (
          <Typography noWrap sx={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '2.1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {value ?? '-'}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 0.75, minHeight: 18 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {loading ? '' : caption}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 54,
              height: 14,
              flexShrink: 0,
              opacity: 0.55,
              backgroundImage: (theme) =>
                `repeating-linear-gradient(90deg, ${theme.palette.text.primary} 0 2px, transparent 2px 4px, ${theme.palette.text.primary} 4px 5px, transparent 5px 8px, ${theme.palette.text.primary} 8px 11px, transparent 11px 13px)`,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
