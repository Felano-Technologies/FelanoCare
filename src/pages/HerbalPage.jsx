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
  Divider,
  Grid
} from "@mui/material"
import {
  Leaf,
  BookOpenCheck,
  BotMessageSquare,
  BrainCog,
  Sparkles
} from "lucide-react"
import { generativeModel } from "../firebase"
import { getAge, getAgeCategory } from "../utils/age"
import { marked } from "marked"


export default function HerbalPage() {
  const { userProfile } = useAuth()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recommendations, setRecommendations] = useState("")

  const birthDate = userProfile?.birthDate || null
  const ageCat = birthDate ? getAgeCategory(getAge(birthDate)) : "adult"

  const systemPrompts = {
    youth: "Recommend safe, mild herbal remedies for teens.",
    adult: "Provide herbal remedy suggestions with cautions for adults.",
    senior: "Advise on gentle herbal remedies suited for seniors."
  }
  const systemPrompt = systemPrompts[ageCat] || systemPrompts.adult

  const ageWarnings = {
    youth: "Note: Herbal remedies for teens should be used under adult supervision.",
    adult: "Please check for allergies and interactions before using herbal remedies.",
    senior: "Seniors should consult their doctor before trying new herbs, especially if on medication."
  }

  const handleGenerate = async () => {
    setError("")
    setRecommendations("")
    if (!input.trim()) {
      setError("Please describe your concern or the type of herbal remedy you want.")
      return
    }

    setLoading(true)
    try {
      const fullPrompt = `
${systemPrompt}

User’s request: ${input.trim()}

Please list 3–5 herbal remedies, including:
- Name of the herb
- Typical single‐dose preparation (e.g. tea, tincture)
- A brief note on dosing and key safety considerations.

Format as bullet points or short paragraphs.
`
      const result = await generativeModel.generateContent(fullPrompt)
      const text = result.response.text()
      setRecommendations(text)
    } catch (err) {
      console.error("Gemini generateContent error:", err)
      setError(err.message || "Failed to generate herbal recommendations.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Leaf size={32} color="#2e7d32" />
          <Typography variant="h4" fontWeight="bold">
            Herbal Medicine Advisor
          </Typography>
        </Box>
  
        {/* Age Warning */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "#f1f8e9",
            borderLeft: "5px solid #81c784",
            borderRadius: 2
          }}
        >
          <Typography variant="body2">{ageWarnings[ageCat]}</Typography>
        </Box>
  
        {/* Description */}
        <Typography variant="body1" sx={{ mb: 2, color: "#333" }}>
          Describe your health concern or the type of herbal remedy you’re looking for.
          The AI will offer age-appropriate herbal suggestions, preparation methods, and important safety info.
        </Typography>
  
        {/* Form */}
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
            placeholder="e.g. Trouble sleeping, stress relief, joint pain for seniors"
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
            startIcon={<BotMessageSquare />}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              bgcolor: "#2e7d32",
              "&:hover": { bgcolor: "#1b5e20" }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Get Recommendations"}
          </Button>
        </Box>
  
        {/* Error Message */}
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
  
        {/* AI Result */}
        {recommendations && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              whiteSpace: "pre-wrap",
              backgroundColor: "#fff",
              maxHeight: "50vh",
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              mb: 5
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <BrainCog size={22} color="#388e3c" />
              <Typography variant="h6" fontWeight="medium">
                AI-Generated Herbal Suggestions
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body1"
              component="div"
              dangerouslySetInnerHTML={{ __html: marked.parse(recommendations) }}
            />
          </Paper>
        )}
  
{/* Educational Resources */}
<Box mt={6}>
  <Box display="flex" alignItems="center" gap={1} mb={2}>
    <BookOpenCheck size={24} />
    <Typography variant="h6" fontWeight="bold">Explore Trusted Herbal Resources</Typography>
  </Box>

  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.02)" }
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Herbs at a Glance – NCCIH
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A U.S. government source offering concise profiles on popular herbs and their safety.
        </Typography>
        <Button
          href="https://www.nccih.nih.gov/health/herbsataglance"
          target="_blank"
          rel="noreferrer"
          size="small"
          variant="outlined"
          sx={{ mt: 1, alignSelf: "flex-start", textTransform: "none" }}
        >
          Visit Resource
        </Button>
      </Paper>
    </Grid>

    <Grid item xs={12} md={6}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.02)" }
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          WebMD Herbal & Supplement Guide
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A comprehensive index of herbs, vitamins, and supplements, with medical insights and precautions.
        </Typography>
        <Button
          href="https://www.webmd.com/vitamins/index"
          target="_blank"
          rel="noreferrer"
          size="small"
          variant="outlined"
          sx={{ mt: 1, alignSelf: "flex-start", textTransform: "none" }}
        >
          Visit Resource
        </Button>
      </Paper>
    </Grid>
  </Grid>
</Box>

{/* Safety Tips */}
<Box mt={6}>
  <Box display="flex" alignItems="center" gap={1} mb={2}>
    <Sparkles size={24} />
    <Typography variant="h6" fontWeight="bold">Smart Herbal Usage Tips</Typography>
  </Box>
  <Paper
    elevation={1}
    sx={{
      p: 2,
      backgroundColor: "#f9fbe7",
      borderLeft: "4px solid #aed581",
      borderRadius: 1
    }}
  >
    <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
      <li style={{ marginBottom: "0.5rem" }}>
        <Typography variant="body2">
          Start with small doses and monitor your body’s reaction.
        </Typography>
      </li>
      <li style={{ marginBottom: "0.5rem" }}>
        <Typography variant="body2">
          Avoid combining multiple herbs without proper guidance.
        </Typography>
      </li>
      <li>
        <Typography variant="body2">
          Consult a healthcare provider before use, especially if pregnant, elderly, or on medication.
        </Typography>
      </li>
    </ul>
  </Paper>
</Box>

      </Container>
      
    </Box>
  )
  
}
