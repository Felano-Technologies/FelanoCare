// src/pages/EPharmacyPage.jsx
import React from 'react'
import { Container, Typography, Divider } from '@mui/material'
import MedicineSuggestion from '../components/MedicineSuggestion'
import MedicineList       from '../components/MedicineList'
import Cart               from '../components/Cart'

export default function EPharmacyPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        🏥 E-Pharmacy
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        gutterBottom
      >
        Browse, order, and get recommendations for your medications.
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* Removed <AiAssistant module="epharmacy" /> */}
      <Cart />
      <MedicineSuggestion />
      <MedicineList />
    </Container>
  )
}
