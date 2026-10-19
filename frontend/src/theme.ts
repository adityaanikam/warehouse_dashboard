// frontend/src/theme.ts
import { alpha, createTheme, PaletteMode } from '@mui/material/styles';

/** Colours reused by the charts so they match the UI in both modes. */
export const chartPalette = ['#4f6bed', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#06b6d4'];

export function createAppTheme(mode: PaletteMode) {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#8da2ff' : '#3f51d8' },
      secondary: { main: '#14b8a6' },
      background: {
        default: dark ? '#0f1320' : '#f4f6fb',
        paper: dark ? '#171c2e' : '#ffffff',
      },
      divider: dark ? alpha('#ffffff', 0.09) : alpha('#1b2559', 0.09),
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}`, backgroundImage: 'none' }),
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundImage: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 10,
            margin: '2px 12px',
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.14),
              color: theme.palette.primary.main,
              '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
            },
          }),
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    },
  });
}
