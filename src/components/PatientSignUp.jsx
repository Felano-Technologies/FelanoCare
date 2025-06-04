// src/components/PatientSignup.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress
} from "@mui/material"
import { useAuth } from "../contexts/AuthContext"

export default function PatientSignup() {
  const navigate = useNavigate()
  const { signupPatient } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !birthDate) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      await signupPatient(name.trim(), email.trim(), password, birthDate)
      navigate("/patient-dashboard")
    } catch (err) {
      console.error("SignupPatient error:", err)

      // If the email is already registered, prompt user to login instead
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.")
      } else {
        setError(err.message || "Failed to sign up.")
      }
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
          p: 4
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Patient Sign Up
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

          <TextField
            label="Birth Date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
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
