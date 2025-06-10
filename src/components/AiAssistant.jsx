// src/components/AiAssistant.jsx

import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress
} from "@mui/material"
import { getFunctions, httpsCallable } from "firebase/functions"
import { app } from "../firebase"
import { Send, Bot, User } from "lucide-react"

export default function AiAssistant({ module }) {
  const { userProfile } = useAuth()
  const functions = getFunctions(app)
  const aiAssistant = httpsCallable(functions, "aiAssistant")
  const messagesEndRef = useRef(null)

  // Determine age category
  const ageCat = userProfile?.birthDate
    ? (() => {
        const year = new Date(userProfile.birthDate).getFullYear()
        const age = new Date().getFullYear() - year
        if (age < 17) return "youth"
        if (age < 60) return "adult"
        return "senior"
      })()
    : "adult"

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hi there! 👋 I'm your AI assistant for ${module} support. Ask me anything health-related!`
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setError("")
    setLoading(true)

    try {
      const { data } = await aiAssistant({ module, input })
      const cleanReply = data.reply.replace(/\*\*(.*?)\*\*/g, "$1")
      const aiReply = { sender: "ai", text: cleanReply }
      setMessages(prev => [...prev, aiReply])
    } catch (err) {
      console.error(err)
      setError("Sorry, AI service is unavailable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#fafafa"
      }}
    >
      {/* === Chat Header === */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <Bot size={20} />
        <Typography variant="h6" fontWeight="medium">
          {module.charAt(0).toUpperCase() + module.slice(1)} AI Chat ({ageCat})
        </Typography>
      </Box>

      {/* === Chat Messages Area === */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent:
                msg.sender === "user" ? "flex-end" : "flex-start",
              gap: 1
            }}
          >
            {msg.sender === "ai" && <Bot size={20} />}
            {msg.sender === "user" && <User size={20} />}
            <Box
              sx={{
                backgroundColor:
                  msg.sender === "user" ? "#d0f0ff" : "#f0f0f0",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                maxWidth: "75%",
                whiteSpace: "pre-wrap"
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Bot size={20} />
            <Box
              sx={{
                backgroundColor: "#f0f0f0",
                px: 2,
                py: 1.5,
                borderRadius: 2
              }}
            >
              <CircularProgress size={18} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* === Input Field === */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          px: 2,
          py: 1,
          borderTop: "1px solid #ddd",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <IconButton type="submit" disabled={loading || !input.trim()}>
          <Send size={20} />
        </IconButton>
      </Box>

      {/* === Error Message === */}
      {error && (
        <Typography
          color="error"
          variant="body2"
          sx={{ px: 2, pb: 1, bgcolor: "#fff" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  )
}
