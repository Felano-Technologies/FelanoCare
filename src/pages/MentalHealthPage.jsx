// src/pages/MentalHealthPage.jsx

import React, { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper
} from "@mui/material"
import { generativeModel } from "../firebase"
import { getAge, getAgeCategory } from "../utils/age"

export default function MentalHealthPage() {
  const { userProfile } = useAuth()
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [advice, setAdvice]   = useState("")

  // 1) Determine age category (fallback to "adult" if missing)
  const birthDate = userProfile?.birthDate || null
  const ageCat    = birthDate
    ? getAgeCategory(getAge(birthDate))
    : "adult"

  // 2) Map age categories to brief system prompts
  const systemPrompts = {
    youth:   "You are a supportive counselor for teenage concerns.",
    adult:   "You are a professional mental health assistant for adults.",
    senior:  "You are a compassionate mental health guide for seniors."
  }
  const systemPrompt = systemPrompts[ageCat] || systemPrompts.adult

  // 3) Handler to call Gemini and get advice
  const handleGenerate = async () => {
    setError("")
    setAdvice("")

    if (!input.trim()) {
      setError("Please share what’s on your mind or your question.")
      return
    }

    setLoading(true)
    try {
      // Combine system prompt + user’s input into one message
      const fullPrompt = `
${systemPrompt}

User’s concern/question: ${input.trim()}

Please provide empathetic, actionable advice and coping strategies. Structure your response in short paragraphs or bullet points as needed.
`

      // Call the Gemini model
      const result = await generativeModel.generateContent(fullPrompt)
      const text   = result.response.text()

      setAdvice(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate mental health advice.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Psychology & Mental Health Support
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Whether you’re feeling anxious, stressed, or simply need someone to talk to, our AI counselor is here to help.  
        Describe your current feelings, challenges, or questions—our AI will provide empathetic guidance and coping strategies tailored to your age group.
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleGenerate()
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
      >
        <TextField
          label="Your concern or question"
          placeholder="e.g. I’ve been feeling anxious about starting college."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          {loading ? <CircularProgress size={20} /> : "Get Support"}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {advice && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            whiteSpace: "pre-wrap",
            backgroundColor: "background.paper",
            maxHeight: "60vh",
            overflowY: "auto"
          }}
        >
          <Typography variant="h6" gutterBottom>
            AI‐Generated Guidance
          </Typography>
          <Typography variant="body1">{advice}</Typography>
        </Paper>
      )}
    </Container>
  )
}
