import { createTheme } from '@mui/material/styles';

// Birdiary "nature / birdwatching" design system — a calm, all-green palette
// (leaf green + sea-green accent on soft cream). Light-only on purpose: the app has
// many surfaces with fixed light backgrounds, so an OS-driven dark mode would
// leave light text on light panels. Colors are emitted as CSS variables so
// custom stylesheets (footer, map popup, highlight panels) can reuse them via
// var(--mui-palette-*).
const FONT_STACK =
  '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: '#2E7D5B', dark: '#1F5A40', light: '#4CA57D', contrastText: '#ffffff' },
    // Secondary is a sea-green sibling of the primary — a distinct accent that
    // stays in the green family (no orange anywhere in the palette).
    secondary: { main: '#3F8F7B', dark: '#2E6B5B', light: '#6FB3A2', contrastText: '#ffffff' },
    success: { main: '#2E7D5B' },
    background: { default: '#FBF9F4', paper: '#FFFFFF' },
    text: { primary: '#1E2A24', secondary: '#55645C' },
    divider: 'rgba(30,42,36,0.12)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: FONT_STACK,
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        '#mainView': { scrollBehavior: 'smooth' },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'primary', elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 1px 2px rgba(16,24,20,0.08), 0 6px 24px -18px rgba(16,24,20,0.5)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        sizeSmall: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 14 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid var(--mui-palette-divider)',
          boxShadow: '0 1px 3px rgba(16,24,20,0.05), 0 10px 30px -18px rgba(16,24,20,0.35)',
        },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: '0.78rem' } } },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
});

export default theme;
