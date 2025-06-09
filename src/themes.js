import { createTheme } from '@mui/material/styles'

export const youthTheme = createTheme({
  palette: {
    primary:   { main: '#ff6f61', contrastText: '#fff' },
    secondary: { main: '#ffe0e0' },
  },
  typography: {
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
        },
      },
    },
  },
})

export const adultTheme = createTheme({
  palette: {
    primary:   { main: '#1976d2', contrastText: '#fff' },
    secondary: { main: '#e3f2fd' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", sans-serif',
    button: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
        },
      },
    },
  },
})

export const seniorTheme = createTheme({
  palette: {
    primary:   { main: '#6a1b9a', contrastText: '#fff' },
    secondary: { main: '#f3e5f5' },
  },
  typography: {
    fontFamily: '"Georgia", serif',
    button: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
  },
})
