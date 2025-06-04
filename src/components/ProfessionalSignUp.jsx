// src/components/ProfessionalSignup.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress
} from "@mui/material"
import WorkIcon from "@mui/icons-material/Work"
import { useAuth } from "../contexts/AuthContext"

export default function ProfessionalSignup() {
  const navigate = useNavigate()
  const { signupProfessional } = useAuth()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      // Call the professional‐specific signup function:
      await signupProfessional(name.trim(), email.trim(), password)
      navigate("/pro-dashboard")
    } catch (err) {
      console.error("SignupProfessional error:", err)
      setError(err.message || "Failed to sign up.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ece9e6 20%, #ffffff 80%)",
        p: 2
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 2,
          p: 4,
          position: "relative"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "background.paper",
            borderRadius: "50%",
            p: 1,
            boxShadow: 3
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <WorkIcon fontSize="large" />
          </Avatar>
        </Box>

        <Typography variant="h5" gutterBottom align="center" sx={{ mt: 4 }}>
          Professional Sign Up
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2, textTransform: "none" }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
