// src/components/ProfileForm.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

import {
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
} from '@mui/material'

export default function ProfileForm() {
  const { user, userProfile, setUserProfile } = useAuth()
  const [name, setName]           = useState(userProfile?.name || '')
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '')
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { name, birthDate })
      setUserProfile({ ...userProfile, name, birthDate })
    } catch (e) {
      console.error(e)
      setError('Could not save profile. Please try again.')
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Complete Your Profile
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Date of Birth"
            type="date"
            variant="outlined"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <Button type="submit" variant="contained" size="large" fullWidth>
            Continue
          </Button>

          {error && (
            <Typography color="error" align="center" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
