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
import AiAssistant from '../components/AiAssistant'
import MedicineSuggestion from '../components/MedicineSuggestion'

const youthTheme = createTheme({
  palette: {
    primary:   { main: '#ff6f61' },   // vibrant coral
    secondary: { main: '#ffe0e0' },   // soft pink
  },
  typography: {
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
  },
})

export default function YouthDashboard() {
  return (
    <ThemeProvider theme={youthTheme}>
      <Box
        sx={{
          backgroundColor: 'secondary.main',
          minHeight: '100vh',
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          {/* Booking Section */}
          <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
            <Typography
              variant="h3"
              color="primary"
              align="center"
              gutterBottom
            >
              🎉 Youth Consultations
            </Typography>
            <BookingForm />
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
            >
              Your Upcoming Bookings
            </Typography>
            <BookingList />
          </Paper>

          {/* E-Pharmacy AI Suggestion Section */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: 'secondary.main',
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              align="center"
              gutterBottom
            >
              🏥 AI-Powered E-Pharmacy
            </Typography>
            <MedicineSuggestion />
          </Paper>

          {/* Generic AI Assistant Section */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: 'secondary.main',
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              align="center"
              gutterBottom
            >
              🤖 Youth AI Assistant
            </Typography>
            <AiAssistant module="epharmacy" />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
