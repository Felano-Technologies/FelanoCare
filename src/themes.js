// src/themes.js
import { createTheme } from '@mui/material/styles'

export const youthTheme = createTheme({
  palette: {
    primary:   { main: '#ff6f61' },
    secondary: { main: '#ffe0e0' },
  },
  typography: { fontFamily: '"Comic Sans MS", cursive, sans-serif' },
})

export const adultTheme = createTheme({
  palette: {
    primary:   { main: '#1976d2' },
    secondary: { main: '#e3f2fd' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", sans-serif' },
})

export const seniorTheme = createTheme({
  palette: {
    primary:   { main: '#6a1b9a' },
    secondary: { main: '#f3e5f5' },
  },
  typography: { fontFamily: '"Georgia", serif' },
})
