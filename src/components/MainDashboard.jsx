import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent
} from '@mui/material'

const MODULES = [
  {
    key: 'booking',
    title: 'Consultation Booking',
    desc:  'Schedule and manage your doctor appointments.',
    path:  '/booking'
  },
  {
    key: 'epharmacy',
    title: 'E-Pharmacy',
    desc:  'Order and track your medications online.',
    path:  '/epharmacy'
  },
  {
    key: 'dietetics',
    title: 'Dietetics',
    desc:  'Get personalized meal plans and nutrition advice.',
    path:  '/dietetics'
  },
  {
    key: 'mental-health',
    title: 'Mental Health',
    desc:  'Express yourself and get AI-assisted support.',
    path:  '/mental-health'
  },
  {
    key: 'herbal',
    title: 'Herbal Medicine',
    desc:  'Explore traditional remedies and cautions.',
    path:  '/herbal'
  }
]

export default function MainDashboard({ ageCategory }) {
  const navigate = useNavigate()

  // Title per age group
  const titles = {
    youth:  'Youth Dashboard',
    adult:  'Adult Dashboard',
    senior: 'Senior Dashboard'
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {titles[ageCategory]}
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Choose a service to continue
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {MODULES.map((mod) => (
          <Grid item xs={12} sm={6} md={4} key={mod.key}>
            <Card>
              <CardActionArea onClick={() => navigate(mod.path)}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {mod.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {mod.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
