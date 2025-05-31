// src/components/ProfessionalSignup.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Container, Box, TextField, Button, Typography } from '@mui/material'

export default function ProfessionalSignup() {
  const { signupProfessional, userProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signupProfessional(name, email, password)
      navigate('/pro-dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  // If already logged in as professional, redirect:
  useEffect(() => {
    if (userProfile?.role === 'professional') {
      navigate('/pro-dashboard')
    }
  }, [userProfile, navigate])

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Sign Up as Health Professional</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">Sign Up</Button>
      </Box>
    </Container>
  )
}
