// src/pages/SeniorDashboard.jsx
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Container, Box, Typography, Paper } from '@mui/material'
import BookingForm from '../components/BookingForm'
import BookingList from '../components/BookingList'

const seniorTheme = createTheme({
  palette: {
    primary: { main: '#6a1b9a' },     // calming purple
    secondary: { main: '#f3e5f5' },   // lavender mist
  },
  typography: {
    fontFamily: '"Georgia", serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0px 3px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

export default function SeniorDashboard() {
  return (
    <ThemeProvider theme={seniorTheme}>
      <Box sx={{ bgcolor: seniorTheme.palette.secondary.main, minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            👴 Welcome, Senior User!
          </Typography>

          {/* BOOKING FORM */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              📅 Book an Appointment
            </Typography>
            <BookingForm />
          </Paper>

          {/* UPCOMING BOOKINGS */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              📋 Upcoming Appointments
            </Typography>
            <BookingList />
          </Paper>

          {/* NOTE: AI chat has been removed from this dashboard. */}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
