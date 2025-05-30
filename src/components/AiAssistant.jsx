// src/components/AiAssistant.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress
} from '@mui/material'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'

const MODULE_PROMPTS = {
  booking: {
    youth:   'You are a friendly teen healthcare assistant.',
    adult:   'You are a professional medical booking assistant.',
    senior:  'You are a caring senior healthcare concierge.'
  },
  epharmacy: {
    youth:   'Suggest easy-to-take medicines for teens.',
    adult:   'Provide prescription-level medicine advice for adults.',
    senior:  'Recommend gentle medicines suited for seniors.'
  },
  dietetics: {
    youth:   'Offer simple, fun nutrition tips for young users.',
    adult:   'Provide balanced meal plans tailored for adults.',
    senior:  'Suggest gentle, senior-friendly dietary advice.'
  },
  'mental-health': {
    youth:   'You are a supportive counselor for teenage concerns.',
    adult:   'You are a professional mental health assistant for adults.',
    senior:  'You are a compassionate mental health guide for seniors.'
  },
  herbal: {
    youth:   'Recommend safe, mild herbal remedies for teens.',
    adult:   'Provide herbal remedy suggestions with cautions for adults.',
    senior:  'Advise on gentle herbal remedies suited for seniors.'
  }
}

export default function AiAssistant({ module }) {
  const { userProfile } = useAuth()
  const ageCat = userProfile?.birthDate
    ? (() => {
        const [year] = userProfile.birthDate.split('-').map(Number)
        const age = new Date().getFullYear() - year
        if (age < 17) return 'youth'
        if (age < 60) return 'adult'
        return 'senior'
      })()
    : 'adult'

  const [input, setInput]     = useState('')
  const [reply, setReply]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const functions = getFunctions(app)
  const aiAssistant = httpsCallable(functions, 'aiAssistant')
  // const { data } = await aiAssistant({ module, input, ageCat });

  const handleAsk = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReply('')

    try {
      const { data } = await aiAssistant({ module, input })
      setReply(data.reply)
    } catch (err) {
      console.error(err)
      setError('Sorry, AI service is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, my: 4 }}>
      <Typography variant="h6">
        🤖 {ageCat.charAt(0).toUpperCase() + ageCat.slice(1)} AI for {module.charAt(0).toUpperCase() + module.slice(1)}
      </Typography>

      <Stack component="form" spacing={2} onSubmit={handleAsk} sx={{ mt: 2 }}>
        <TextField
          label="Ask me anything..."
          fullWidth
          required
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button type="submit" disabled={loading} variant="contained">
          {loading ? <CircularProgress size={20} /> : 'Ask AI'}
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {reply && (
        <Typography variant="body1" sx={{ mt: 3, whiteSpace: 'pre-wrap' }}>
          {reply}
        </Typography>
      )}
    </Paper>
  )
}