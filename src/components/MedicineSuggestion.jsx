// src/components/MedicineSuggestion.jsx
import React, { useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

export default function MedicineSuggestion() {
  const [condition, setCondition]       = useState('')
  const [suggestions, setSuggestions]   = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSuggest = async (e) => {
    e.preventDefault()
    setError('')
    setSuggestions([])
    setLoading(true)
    try {
      // 1. Fetch your medicine names from Firestore
      const snap = await getDocs(collection(db, 'medicines'))
      const meds = snap.docs.map(d => d.data().name).join(', ')

      // 2. Build a prompt
      const prompt = `
You are a medical assistant. Available medicines: ${meds}.
The patient has the following condition: "${condition}".
Suggest up to 5 appropriate medicines (with dosage guidelines) in JSON array format:
[ { "name": "", "dosage": "" } ]
      `.trim()

      // 3. Call OpenAI Chat Completion
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful medical assistant.' },
            { role: 'user',   content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 300
        })
      })

      const { choices } = await res.json()
      const text = choices?.[0]?.message?.content || ''
      const data = JSON.parse(text)    // Expecting valid JSON from the model
      setSuggestions(data)
    } catch (err) {
      console.error(err)
      setError('Failed to get suggestions. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        🤖 AI Medicine Suggestions
      </Typography>

      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSuggest}
      >
        <TextField
          label="Describe your condition"
          variant="outlined"
          fullWidth
          required
          value={condition}
          onChange={e => setCondition(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20}/> : 'Suggest Meds'}
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {suggestions.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Recommended:
          </Typography>
          <List>
            {suggestions.map((s, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={s.name}
                  secondary={s.dosage}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  )
}
