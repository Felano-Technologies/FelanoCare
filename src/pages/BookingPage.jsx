// src/pages/BookingPage.jsx
import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import BookingForm from '../components/BookingForm'
import BookingList from '../components/BookingList'

export default function BookingPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        📅 Consultation Booking
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        gutterBottom
      >
        Schedule and manage your appointments.
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* Removed <AiAssistant module="booking" /> */}
      <BookingForm />
      <BookingList />
    </Container>
  )
}
