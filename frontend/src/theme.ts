// frontend/src/theme.ts
import { alpha, createTheme, PaletteMode } from '@mui/material/styles';

/**
 * Visual identity: a packing slip. Kraft paper and ink, safety orange, square corners,
 * condensed stencil-style headings and monospaced figures. "Day shift" is the light
 * theme, "night shift" the dark one.
 */
export const fonts = {
  body: '"Barlow", "Segoe UI", Roboto, Arial, sans-serif',
  display: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
  mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace',
};

export const colors = {
  ink: '#1d1b16',
  orange: '#e4531c',
  yellow: '#f2c230',
  kraft: '#e9e1cd',
  label: '#f7f2e6',
  nightPaper: '#1e1c16',
  nightBg: '#15140f',
  nightText: '#efe8d6',
  amber: '#f2a93b',
};

/** Diagonal black and yellow warning tape, used as a divider. */
export const hazardStripes = (size = 10) =>
  `repeating-linear-gradient(-45deg, ${colors.yellow} 0 ${size}px, ${colors.ink} ${size}px ${size * 2}px)`;

export function createAppTheme(mode: PaletteMode) {
  const dark = mode === 'dark';
  const ink = dark ? colors.nightText : colors.ink;
  const line = dark ? '#3b372c' : colors.ink;

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? colors.amber : colors.ink, contrastText: dark ? colors.ink : colors.label },
      secondary: { main: colors.orange },
      warning: { main: colors.orange },
      error: { main: '#b3261e' },
      success: { main: dark ? '#8fbf6a' : '#3f6b2a' },
      info: { main: dark ? '#7fb3d5' : '#2a5d7c' },
      text: { primary: ink, secondary: dark ? '#a39c88' : '#6b6454' },
      background: { default: dark ? colors.nightBg : colors.kraft, paper: dark ? colors.nightPaper : colors.label },
      divider: alpha(line, dark ? 1 : 0.22),
    },
    shape: { borderRadius: 2 },
    typography: {
      fontFamily: fonts.body,
      h4: { fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.05 },
      h5: { fontFamily: fonts.mono, fontWeight: 600, letterSpacing: '-0.02em' },
      h6: { fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
      subtitle1: { fontFamily: fonts.display, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' },
      button: { fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.95rem' },
      caption: { fontFamily: fonts.mono, letterSpacing: '0.02em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '::selection': { background: colors.orange, color: colors.label },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0, square: true },
        styleOverrides: {
          root: { border: `1.5px solid ${line}`, backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1.5px solid ${line}`,
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: false },
        styleOverrides: {
          root: { borderRadius: 2, paddingInline: 18 },
          contained: {
            boxShadow: `3px 3px 0 ${colors.orange}`,
            transition: 'transform .08s, box-shadow .08s',
            '&:hover': { boxShadow: `1px 1px 0 ${colors.orange}`, transform: 'translate(2px, 2px)' },
          },
          outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 2, fontFamily: fonts.mono, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 2, border: `2px solid ${line}`, boxShadow: `6px 6px 0 ${colors.orange}` } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 2, border: `1.5px solid ${line}`, fontFamily: fonts.body } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 2 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 2, fontFamily: fonts.mono, fontSize: '0.72rem' } } },
    },
  });
}
