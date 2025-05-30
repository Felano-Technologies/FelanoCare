// src/components/MentalJournal.jsx
import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

export default function MentalJournal() {
  const { user } = useAuth()
  const [entry, setEntry]     = useState('')
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'journals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!entry.trim()) return
    await addDoc(collection(db, 'journals'), {
      userId:    user.uid,
      text:      entry,
      createdAt: Timestamp.now()
    })
    setEntry('')
  }

  return (
    <Paper elevation={2} sx={{ p:3, my:4 }}>
      <Typography variant="h6" gutterBottom>
        📝 Your Journal
      </Typography>

      <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mb:3 }}>
        <TextField
          label="How are you feeling today?"
          fullWidth
          multiline
          minRows={3}
          value={entry}
          onChange={e => setEntry(e.target.value)}
        />
        <Button type="submit" variant="contained">Save Entry</Button>
      </Stack>

      <Typography variant="subtitle1" gutterBottom>
        Past Entries
      </Typography>
      <List>
        {entries.map(({ id, text, createdAt }) => (
          <ListItem key={id} divider>
            <ListItemText
              primary={new Date(createdAt.seconds * 1000).toLocaleString()}
              secondary={text}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
