// src/pages/ProfessionalDashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Divider,
  Alert
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { db } from "../firebase"
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDoc
} from "firebase/firestore"

export default function ProfessionalDashboard() {
  const { user, userProfile } = useAuth()

  // ─── Declare all hooks unconditionally ────────────────────────────────────
  const [authLoading, setAuthLoading] = useState(true)

  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [addError, setAddError] = useState("")

  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [errorSlots, setErrorSlots] = useState("")

  const [bookedWithNames, setBookedWithNames] = useState([])
  const [loadingBooked, setLoadingBooked] = useState(true)
  const [errorBooked, setErrorBooked] = useState("")

  // ─── Effects ───────────────────────────────────────────────────────────────

  // 0) Wait until auth & profile are ready
  useEffect(() => {
    if (user !== undefined && userProfile !== undefined) {
      setAuthLoading(false)
    }
  }, [user, userProfile])

  // 1) Listen to all availability slots
  useEffect(() => {
    if (!user) return
    setLoadingSlots(true)
    setErrorSlots("")
    const ref = collection(db, "users", user.uid, "availability")
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        arr.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.startTime.localeCompare(b.startTime)
        })
        setSlots(arr)
        setLoadingSlots(false)
      },
      (err) => {
        console.error("Slots snapshot error:", err)
        setErrorSlots("Failed to load availability slots.")
        setLoadingSlots(false)
      }
    )
    return unsub
  }, [user])

  // 2) Fetch patient names for booked slots
  useEffect(() => {
    const booked = slots.filter(s => s.booked && !s.canceled)
    if (booked.length === 0) {
      setBookedWithNames([])
      setLoadingBooked(false)
      return
    }
    setLoadingBooked(true)
    setErrorBooked("")
    Promise.all(
      booked.map(async (slot) => {
        try {
          if (!slot.patientId) throw new Error()
          const snap = await getDoc(doc(db, "users", slot.patientId))
          return { 
            ...slot, 
            patientName: snap.exists() ? snap.data().name : "Unknown" 
          }
        } catch {
          return { ...slot, patientName: "Unknown" }
        }
      })
    )
      .then(res => {
        setBookedWithNames(res)
        setLoadingBooked(false)
      })
      .catch(err => {
        console.error("Error fetching patient names:", err)
        setErrorBooked("Failed to load booked appointments.")
        setLoadingBooked(false)
      })
  }, [slots])

  // ─── Guard: show spinner until auth & profile are loaded ───────────────────
  if (authLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={48} />
      </Box>
    )
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSlot = async (e) => {
    e.preventDefault()
    setAddError("")
    if (!date || !startTime || !endTime) {
      setAddError("All fields are required.")
      return
    }
    if (endTime <= startTime) {
      setAddError("End time must be after start time.")
      return
    }
    try {
      await addDoc(
        collection(db, "users", user.uid, "availability"),
        {
          date,
          startTime,
          endTime,
          booked: false,
          canceled: false,
          patientId: null,
          createdAt: new Date().toISOString()
        }
      )
      setDate("")
      setStartTime("")
      setEndTime("")
    } catch (err) {
      console.error("Error adding slot:", err)
      setAddError("Failed to add slot.")
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      await updateDoc(
        doc(db, "users", user.uid, "availability", slotId),
        { canceled: true }
      )
    } catch (err) {
      console.error("Error canceling slot:", err)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const availableSlots = slots.filter(s => !s.booked && !s.canceled)

  return (
    <Container
      maxWidth="md"
      disableGutters
      sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 6 }}
    >
      {/* HEADER */}
      <Typography variant="h4" gutterBottom>
        🩺 Professional Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Welcome, Dr. {userProfile.name}
      </Typography>

      {/* ADD SLOT FORM */}
      <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h6" gutterBottom>
          📅 Add New Availability Slot
        </Typography>
        <Box component="form" onSubmit={handleAddSlot} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
          </Grid>
          {addError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {addError}
            </Alert>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Add Slot
          </Button>
        </Box>
      </Paper>

      {/* AVAILABLE SLOTS */}
      <Typography variant="h6" gutterBottom>
        🗓️ Available Slots
      </Typography>
      {loadingSlots ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : errorSlots ? (
        <Alert severity="error">{errorSlots}</Alert>
      ) : availableSlots.length === 0 ? (
        <Typography>No available slots to display.</Typography>
      ) : (
        <Paper elevation={1} sx={{ mb: 6 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableSlots.map(slot => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.date}</TableCell>
                  <TableCell>{slot.startTime}</TableCell>
                  <TableCell>{slot.endTime}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* BOOKED APPOINTMENTS */}
      <Typography variant="h6" gutterBottom>
        📌 Booked Appointments
      </Typography>
      {loadingBooked ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : errorBooked ? (
        <Alert severity="error">{errorBooked}</Alert>
      ) : bookedWithNames.length === 0 ? (
        <Typography>No booked appointments yet.</Typography>
      ) : (
        <Paper elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookedWithNames.map(slot => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.date}</TableCell>
                  <TableCell>{slot.startTime}</TableCell>
                  <TableCell>{slot.endTime}</TableCell>
                  <TableCell>{slot.patientName}</TableCell>
                  <TableCell>
                    {slot.canceled
                      ? "Canceled"
                      : slot.booked
                      ? "Booked"
                      : "Available"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  )
}
