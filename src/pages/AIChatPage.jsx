// src/pages/AIChatPage.jsx
import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import AiAssistant from '../components/AiAssistant'

export default function AIChatPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>🤖 AI Assistant</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        gutterBottom
      >
        Ask any health-related questions and get AI-powered assistance.
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* This renders your AiAssistant component with a generic “module” prop. */}
      <AiAssistant module="general" />
    </Container>
  )
}
