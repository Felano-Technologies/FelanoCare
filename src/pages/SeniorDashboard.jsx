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
  },
})

export default function SeniorDashboard() {
  return (
    <ThemeProvider theme={seniorTheme}>
      <Box sx={{ backgroundColor: 'secondary.main', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="sm">
          <Typography variant="h4" color="primary" align="center" gutterBottom>
            Welcome, Valued Senior
          </Typography>
          <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Book Your Consultation
            </Typography>
            <BookingForm />
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <BookingList />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
