import { createTheme } from '@mui/material/styles';

export const executiveTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    primary: { main: '#315A7D' },
    secondary: { main: '#2F6F6D' },
    text: {
      primary: '#17212B',
      secondary: '#5B6673',
    },
    divider: '#D9E1EA',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 650 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(23, 33, 43, 0.035)',
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, minHeight: 40 } },
    },
  },
});
