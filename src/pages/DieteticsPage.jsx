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
import { ChefHat, Sparkles } from "lucide-react"
import { generativeModel } from "../firebase"
import { getAge, getAgeCategory } from "../utils/age"
import { marked } from "marked"


export default function DieteticsPage() {
  const { userProfile } = useAuth()
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [plan, setPlan]       = useState("")

  const birthDate = userProfile?.birthDate || null
  const ageCat = birthDate ? getAgeCategory(getAge(birthDate)) : "adult"

  const handleGenerate = async () => {
    setError("")
    setPlan("")

    if (!input.trim()) {
      setError("Please describe your dietary preferences or goals.")
      return
    }

    setLoading(true)
    try {
      const systemPrefixMap = {
        youth: "Offer simple, fun nutrition tips for young users.",
        adult: "Provide balanced meal plans tailored for adults.",
        senior: "Suggest gentle, senior-friendly dietary advice.",
      }

      const systemPrompt = systemPrefixMap[ageCat] || systemPrefixMap.adult

      const fullPrompt = `
${systemPrompt}

User’s request: ${input.trim()}

Please generate a 3- to 5-day meal plan outlining breakfast, lunch, dinner, and snacks for each day.
`

      const result = await generativeModel.generateContent(fullPrompt)
      const text = result.response.text()
      setPlan(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate meal plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box textAlign="center" mb={4}>
        <ChefHat size={48} color="#56666B" />
        <Typography variant="h4" fontWeight="bold" mt={1}>
          AI-Powered Dietetics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Get a personalized meal plan in seconds
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerate()
            }}
          >
            <TextField
              label="Describe your dietary goals"
              placeholder="e.g. high-protein vegetarian, low-sugar for seniors..."
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
                  backgroundColor: "#46585C",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: 8 }} />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {plan && (
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
            animation: "fadeIn 0.4s ease-in-out",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Your Personalized Plan
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body1"
            component="div"
            dangerouslySetInnerHTML={{ __html: marked.parse(plan) }}
          />
        </Paper>
      )}
    </Container>
  )
}
