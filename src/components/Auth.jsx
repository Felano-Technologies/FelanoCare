// src/components/Auth.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

import {
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Grid
} from '@mui/material'

export default function Auth() {
  const { login, signup, googleSignIn } = useAuth()
  const [isNew, setIsNew] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [err, setErr]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      if (isNew) await signup(email, pw)
      else       await login(email, pw)
    } catch (e) {
      setErr(e.message)
    }
  }

  const handleGoogle = async () => {
    setErr('')
    try {
      await googleSignIn()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isNew ? 'Create Your Account' : 'Welcome Back'}
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={pw}
            onChange={e => setPw(e.target.value)}
          />

          <Button type="submit" variant="contained" fullWidth>
            {isNew ? 'Sign Up' : 'Log In'}
          </Button>

          <Divider>OR</Divider>

          <Button
            onClick={handleGoogle}
            fullWidth
            startIcon={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                style={{ width: 20, height: 20 }}
              />
            }
            sx={{
              backgroundColor: '#fff',
              color: 'rgba(0, 0, 0, 0.54)',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              border: '1px solid #dadce0',
              '&:hover': {
                backgroundColor: '#f7f8f8',
                boxShadow: 'none',
              },
            }}
          >
            Sign in with Google
          </Button>

          {err && (
            <Typography color="error" align="center">
              {err}
            </Typography>
          )}

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                size="small"
                onClick={() => setIsNew(prev => !prev)}
              >
                {isNew
                  ? 'Already have an account? Log in'
                  : 'New here? Create account'
                }
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Container>
  )
}
