// src/pages/YouthDashboard.jsx
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  Container,
  Box,
  Typography,
  Paper
} from '@mui/material'
import BookingForm from '../components/BookingForm'
import BookingList from '../components/BookingList'
import MedicineSuggestion from '../components/MedicineSuggestion'

const youthTheme = createTheme({
  palette: {
    primary: { main: '#4caf50' },    // energetic green
    secondary: { main: '#e8f5e9' },  // mint whisper
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", sans-serif',
    h4: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 3px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

export default function YouthDashboard() {
  return (
    <ThemeProvider theme={youthTheme}>
      <Box sx={{ bgcolor: youthTheme.palette.secondary.main, minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            👋 Welcome, Youth User!
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
        </Container>
      </Box>
    </ThemeProvider>
  )
}
