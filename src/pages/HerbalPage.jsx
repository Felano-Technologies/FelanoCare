// src/pages/HerbalPage.jsx

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

export default function HerbalPage() {
  const { userProfile } = useAuth()
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [recommendations, setRecommendations] = useState("")

  // 1) Determine age category (fallback to "adult")
  const birthDate = userProfile?.birthDate || null
  const ageCat    = birthDate
    ? getAgeCategory(getAge(birthDate))
    : "adult"

  // 2) Map age categories to brief system prompts
  const systemPrompts = {
    youth:   "Recommend safe, mild herbal remedies for teens.",
    adult:   "Provide herbal remedy suggestions with cautions for adults.",
    senior:  "Advise on gentle herbal remedies suited for seniors."
  }
  const systemPrompt = systemPrompts[ageCat] || systemPrompts.adult

  // 3) Handler to call Gemini and get herbal recommendations
  const handleGenerate = async () => {
    setError("")
    setRecommendations("")

    if (!input.trim()) {
      setError("Please describe your concern or the type of herbal remedy you want.")
      return
    }

    setLoading(true)
    try {
      // Build the full prompt
      const fullPrompt = `
${systemPrompt}

User’s request: ${input.trim()}

Please list 3–5 herbal remedies, including:
- Name of the herb
- Typical single‐dose preparation (e.g. tea, tincture)
- A brief note on dosing and key safety considerations.

Format as bullet points or short paragraphs.
`

      // Call the Gemini model via Firebase AI
      const result = await generativeModel.generateContent(fullPrompt)
      const text   = result.response.text()
      setRecommendations(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate herbal recommendations.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Herbal Medicine Recommendations
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Tell us your specific concern or what type of herbal remedy you’re looking for (e.g.,  
        “I have trouble sleeping,” “I need mild immune support,” “Joint pain relief for a senior,” etc.).  
        The AI will suggest age‐appropriate herbs, preparation methods, and safety notes.
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
          label="Your concern or desired herbal remedy"
          placeholder="e.g. Trouble sleeping; mild immune support; joint pain relief for seniors"
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
          {loading ? <CircularProgress size={20} /> : "Get Recommendations"}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {recommendations && (
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
            AI‐Generated Herbal Suggestions
          </Typography>
          <Typography variant="body1">
            {recommendations}
          </Typography>
        </Paper>
      )}
    </Container>
  )
}
