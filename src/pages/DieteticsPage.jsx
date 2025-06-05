// src/pages/DieteticsPage.jsx
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

export default function DieteticsPage() {
  const { userProfile } = useAuth()
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [plan, setPlan]       = useState("")

  // Determine age category (fallback to "adult")
  const birthDate = userProfile?.birthDate || null
  const ageCat    = birthDate
    ? getAgeCategory(getAge(birthDate))
    : "adult"

  const handleGenerate = async () => {
    setError("")
    setPlan("")

    if (!input.trim()) {
      setError("Please describe your dietary preferences or goals.")
      return
    }

    setLoading(true)
    try {
      // Build an age‐specific system prompt
      const systemPrefixMap = {
        youth:   "Offer simple, fun nutrition tips for young users.",
        adult:   "Provide balanced meal plans tailored for adults.",
        senior:  "Suggest gentle, senior-friendly dietary advice."
      }
      const systemPrompt = systemPrefixMap[ageCat] || systemPrefixMap.adult

      // Combine system prompt + user input
      const fullPrompt = `
${systemPrompt}

User’s request: ${input.trim()}

Please generate a 3- to 5-day meal plan outlining breakfast, lunch, dinner, and snacks for each day.
`

      // Call Gemini via Firebase AI
      const result = await generativeModel.generateContent(fullPrompt)
      const text   = result.response.text()
      setPlan(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate meal plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dietetics & Meal Planning
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Describe your dietary goals or preferences (e.g.,  
        “I want a high-protein vegetarian meal plan for this week,”  
        “Low-sugar meals suitable for a senior,” etc.).  
        The AI will generate a custom multi-day meal plan.
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
          label="Dietary Goals / Preferences"
          placeholder="e.g. Low-carb meals, high-protein vegetarian, heart-healthy, etc."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          {loading ? <CircularProgress size={20} /> : "Generate Meal Plan"}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {plan && (
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
            Your AI-Generated Meal Plan
          </Typography>
          <Typography variant="body1">
            {plan}
          </Typography>
        </Paper>
      )}
    </Container>
  )
}
