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
    h4: { fontWeight: 700 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

export default function AdultDashboard() {
  return (
    <ThemeProvider theme={adultTheme}>
      <Box sx={{ bgcolor: adultTheme.palette.secondary.main, minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            👨‍💼 Welcome, Adult User!
          </Typography>

          <Grid container spacing={4}>
            {/* BOOKING FORM */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  📅 Book an Appointment
                </Typography>
                <BookingForm />
              </Paper>
            </Grid>

            {/* UPCOMING BOOKINGS */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  📋 Your Bookings
                </Typography>
                <BookingList />
              </Paper>
            </Grid>
          </Grid>

          {/* NOTE: AI chat has been removed from this dashboard. */}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
