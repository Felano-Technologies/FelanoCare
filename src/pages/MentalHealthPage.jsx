// src/pages/MentalHealthPage.jsx
import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import MentalJournal from '../components/MentalJournal'

export default function MentalHealthPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        🧠 Mental Health
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        gutterBottom
      >
        Express yourself and get support tools here.
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* Removed <AiAssistant module="mental-health" /> */}
      <MentalJournal />
    </Container>
  )
}
