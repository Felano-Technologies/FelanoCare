import React, { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider
} from "@mui/material"
import { BrainCircuit, Sparkles } from "lucide-react"
import { generativeModel } from "../firebase"
import { getAge, getAgeCategory } from "../utils/age"
import { marked } from "marked"


export default function MentalHealthPage() {
  const { userProfile } = useAuth()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [advice, setAdvice] = useState("")

  const birthDate = userProfile?.birthDate || null
  const ageCat = birthDate ? getAgeCategory(getAge(birthDate)) : "adult"

  const systemPrompts = {
    youth: "You are a supportive counselor for teenage concerns.",
    adult: "You are a professional mental health assistant for adults.",
    senior: "You are a compassionate mental health guide for seniors."
  }

  const systemPrompt = systemPrompts[ageCat] || systemPrompts.adult

  const handleGenerate = async () => {
    setError("")
    setAdvice("")

    if (!input.trim()) {
      setError("Please share what’s on your mind or your question.")
      return
    }

    setLoading(true)
    try {
      const fullPrompt = `
${systemPrompt}

User’s concern/question: ${input.trim()}

Please provide empathetic, actionable advice and coping strategies. Structure your response in short paragraphs or bullet points as needed.
`

      const result = await generativeModel.generateContent(fullPrompt)
      const text = result.response.text()
      setAdvice(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate mental health advice.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box textAlign="center" mb={4}>
        <BrainCircuit size={48} color="#56666B" />
        <Typography variant="h4" fontWeight="bold" mt={1}>
          Mental Health Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Receive AI-guided emotional support, tailored for you.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Feeling overwhelmed, anxious, or uncertain? Share what’s on your mind, and our AI will respond with empathetic, age-appropriate support.
          </Typography>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerate()
            }}
          >
            <TextField
              label="What’s on your mind?"
              placeholder="e.g. I’m struggling with social anxiety lately..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              required
            />

            {error && (
              <Typography variant="body2" color="error" mt={1}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                textTransform: "none",
                backgroundColor: "#56666B",
                "&:hover": {
                  backgroundColor: "#46585C"
                }
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: 8 }} />
                  Get Support
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {advice && (
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: "#fefefe",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            maxHeight: "60vh",
            animation: "fadeIn 0.4s ease-in-out"
          }}
        >
          <Typography variant="h6" gutterBottom>
            Your Personalized Guidance
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body1"
            component="div"
            dangerouslySetInnerHTML={{ __html: marked.parse(advice) }}
          />
        </Paper>
      )}
    </Container>
  )
}
