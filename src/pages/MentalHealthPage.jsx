import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import AiAssistant from '../components/AiAssistant'
import MentalJournal from '../components/MentalJournal'

export default function MentalHealthPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>🧠 Mental Health</Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Express yourself and get AI-assisted support.
      </Typography>
      <Divider sx={{ my: 3 }} />

      <AiAssistant module="mental-health" />
      <MentalJournal />
    </Container>
  )
}
