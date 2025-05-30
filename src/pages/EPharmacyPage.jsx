import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import AiAssistant        from '../components/AiAssistant'
import MedicineSuggestion from '../components/MedicineSuggestion'
import MedicineList       from '../components/MedicineList'

export default function EPharmacyPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        🏥 E-Pharmacy
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Browse, order, and get AI recommendations for your medications.
      </Typography>
      <Divider sx={{ my: 3 }} />

      <AiAssistant module="epharmacy" />
      <MedicineSuggestion />
      <MedicineList />
    </Container>
  )
}
