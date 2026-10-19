// frontend/src/components/StatusChip.tsx
import React from 'react';
import { Box, useTheme } from '@mui/material';
import { colors, fonts } from '../theme';

type Stamp = { fg: string; bg?: string; tilt: number };

/** Rubber-stamp look: boxed, uppercase, slightly crooked. The colour carries the meaning. */
const STAMPS = {
  light: {
    Pending: { fg: '#6b6454', tilt: -1.5 },
    'In Transit': { fg: colors.orange, tilt: 1 },
    Delivered: { fg: '#3f6b2a', tilt: -1 },
    Delayed: { fg: '#ffffff', bg: '#b3261e', tilt: 1.5 },
  },
  dark: {
    Pending: { fg: '#b8b09a', tilt: -1.5 },
    'In Transit': { fg: '#ff7a45', tilt: 1 },
    Delivered: { fg: '#9ccf74', tilt: -1 },
    Delayed: { fg: '#ffffff', bg: '#c4362d', tilt: 1.5 },
  },
} as Record<'light' | 'dark', Record<string, Stamp>>;

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const mode = useTheme().palette.mode;
  const stamp = STAMPS[mode][status] ?? { fg: mode === 'dark' ? '#b8b09a' : '#6b6454', tilt: 0 };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.1,
        border: `2px solid ${stamp.bg ?? stamp.fg}`,
        color: stamp.fg,
        backgroundColor: stamp.bg ?? 'transparent',
        fontFamily: fonts.mono,
        fontWeight: 600,
        fontSize: '0.68rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1.5,
        transform: `rotate(${stamp.tilt}deg)`,
      }}
    >
      {status}
    </Box>
  );
};

export default StatusChip;
