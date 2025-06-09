// src/components/Auth.jsx
import React, { useState } from "react"
import { TextField, Button, Typography, Stack, Divider } from "@mui/material"
import { useAuth } from "../contexts/AuthContext"

export default function Auth() {
  const { login, signup, googleSignIn } = useAuth()
  const [isNew, setIsNew] = useState(false)
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [err, setErr] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    try {
      isNew ? await signup(email, pw) : await login(email, pw)
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <Button type="submit" variant="contained" size="large" fullWidth>
          {isNew ? "Create Account" : "Login"}
        </Button>

        <Divider>or</Divider>

        <Button
          onClick={googleSignIn}
          variant="outlined"
          fullWidth
          startIcon={
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: 20, height: 20 }}
            />
          }
          sx={{
            textTransform: "none",
            borderColor: "#ccc",
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Sign in with Google
        </Button>

        {err && (
          <Typography color="error" align="center" mt={1}>
            {err}
          </Typography>
        )}

        <Typography
          variant="body2"
          align="center"
          sx={{ cursor: "pointer", mt: 1 }}
          onClick={() => setIsNew(!isNew)}
        >
          {isNew ? "Already have an account? Login" : "New here? Create account"}
        </Typography>
      </Stack>
    </form>
  )
}
