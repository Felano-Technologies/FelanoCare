// src/components/ProfessionalLogin.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Box, TextField, Button, Typography } from "@mui/material"

export default function ProfessionalLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      // After login, we need to check if the logged‐in user is actually a professional.
      // Because useAuth() sets userProfile.role, we wait briefly and then read it.
      setTimeout(() => {
        const { userProfile } = useAuth()
        if (userProfile?.role === "professional") {
          navigate("/pro-dashboard")
        } else {
          // If they’re not a professional, show an error and log them out
          setError("This is not a professional account.")
        }
      }, 500)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

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
      <Button type="submit" variant="contained">
        Log In
      </Button>
    </Box>
  )
}
