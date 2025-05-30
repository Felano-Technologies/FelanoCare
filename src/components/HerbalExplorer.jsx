// src/components/HerbalExplorer.jsx
import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material'

export default function HerbalExplorer() {
  const [query, setQuery]       = useState('')
  const [herbs, setHerbs]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    // Fetch all herbs from Firestore on mount
    async function fetchHerbs() {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'herbs'))
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setHerbs(data)
        setFiltered(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load herbal data.')
      } finally {
        setLoading(false)
      }
    }
    fetchHerbs()
  }, [])

  const handleSearch = () => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setFiltered(herbs)
      return
    }
    const results = herbs.filter(h => 
      h.name.toLowerCase().includes(q) ||
      (h.description && h.description.toLowerCase().includes(q))
    )
    setFiltered(results)
  }

  return (
    <Paper elevation={2} sx={{ p:3, my:4 }}>
      <Typography variant="h6" gutterBottom>
        🌿 Herbal Explorer
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb:2 }}>
        <TextField
          label="Search herbs or symptoms"
          variant="outlined"
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Stack>

      {loading && <CircularProgress />}
      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && (
        <List>
          {filtered.map(h => (
            <ListItem key={h.id} divider>
              <ListItemText
                primary={h.name}
                secondary={h.description}
              />
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Typography>No herbs found.</Typography>
          )}
        </List>
      )}
    </Paper>
  )
}
