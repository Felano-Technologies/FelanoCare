import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import AiAssistant from '../components/AiAssistant'
import HerbalExplorer from '../components/HerbalExplorer'

export default function HerbalPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>🌿 Herbal Medicine</Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Explore traditional remedies and cautions.
      </Typography>
      <Divider sx={{ my: 3 }} />

      <AiAssistant module="herbal" />
      <HerbalExplorer />
    </Container>
  )
}
