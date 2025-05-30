// src/components/DieteticsChat.jsx
import React, { useState } from 'react'
import { Paper, Typography, Stack, TextField, Button, CircularProgress } from '@mui/material'

export default function DieteticsChat() {
  const [input, setInput]       = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a certified dietitian.' },
            { role: 'user',   content: input }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })
      const data = await res.json()
      const msg = data.choices?.[0]?.message?.content.trim()
      setResponse(msg)
    } catch (err) {
      console.error(err)
      setResponse('Error generating diet advice.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, my: 4 }}>
      <Typography variant="h6" gutterBottom>
        🍎 Dietetics Chat
      </Typography>
      <Stack component="form" spacing={2} onSubmit={handleSend}>
        <TextField
          label="Ask about your diet..."
          fullWidth
          required
          multiline
          minRows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Get Advice'}
        </Button>
      </Stack>
      {response && (
        <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
          {response}
        </Typography>
      )}
    </Paper>
  )
}
