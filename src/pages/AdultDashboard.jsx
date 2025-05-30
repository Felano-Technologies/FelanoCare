// src/pages/AdultDashboard.jsx
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Container, Box, Typography, Grid, Paper } from '@mui/material'
import BookingForm from '../components/BookingForm'
import BookingList from '../components/BookingList'

const adultTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },   // professional blue
    secondary: { main: '#e3f2fd' }, // light sky
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

export default function AdultDashboard() {
  return (
    <ThemeProvider theme={adultTheme}>
      <Box sx={{ backgroundColor: 'secondary.main', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" color="primary" align="center" gutterBottom>
            Adult Consultation Portal
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Book a Consultation
                </Typography>
                <BookingForm />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Your Bookings
                </Typography>
                <BookingList />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
