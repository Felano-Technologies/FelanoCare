// src/components/GeminiDemo.jsx
import React, { useState } from "react";
import { Button, TextField, Box, Typography, CircularProgress, Paper } from "@mui/material";
import { generativeModel } from "../firebase";

export default function GeminiDemo() {
  const [prompt, setPrompt]   = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply]     = useState("");
  const [error, setError]     = useState("");

  const handleGenerate = async () => {
    setError("");
    setReply("");

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      // Call the Gemini model directly.  
      // generateContent returns a result with a `response` containing `text()` method.
      const result = await generativeModel.generateContent(prompt.trim());

      // Extract the text from the response
      const text = result.response.text();
      setReply(text);
    } catch (err) {
      console.error("Gemini generateContent error:", err);
      setError(err.message || "Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gemini AI Demo
      </Typography>

      <TextField
        label="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        multiline
        minRows={2}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={loading}
        sx={{ textTransform: "none" }}
      >
        {loading ? <CircularProgress size={20} /> : "Generate"}
      </Button>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {reply && (
        <Paper 
          elevation={2} 
          sx={{ mt: 3, p: 2, whiteSpace: "pre-wrap" }}
        >
          <Typography variant="subtitle1" gutterBottom>
            AI’s Reply:
          </Typography>
          <Typography variant="body1">{reply}</Typography>
        </Paper>
      )}
    </Box>
  );
}
