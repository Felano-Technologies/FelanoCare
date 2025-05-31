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
  Divider
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
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [error, setError] = useState("")

  // For booked‐slots resolution
  const [bookedWithNames, setBookedWithNames] = useState([])
  const [loadingBooked, setLoadingBooked] = useState(true)

  // 1) Listen in real‐time to ALL slots (available + booked)
  useEffect(() => {
    if (!user) return

    const slotsRef = collection(db, "users", user.uid, "availability")
    const unsubscribe = onSnapshot(slotsRef, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      // Sort by date + startTime
      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
      setSlots(arr)
      setLoadingSlots(false)
    })

    return () => unsubscribe()
  }, [user])

  // 2) Whenever slots change, fetch patient names for booked slots
  useEffect(() => {
    const bookedSlots = slots.filter((s) => s.booked && !s.canceled)
    if (bookedSlots.length === 0) {
      setBookedWithNames([])
      setLoadingBooked(false)
      return
    }

    async function fetchPatientNames() {
      setLoadingBooked(true)
      try {
        const results = await Promise.all(
          bookedSlots.map(async (slot) => {
            if (!slot.patientId) {
              return { ...slot, patientName: "Unknown" }
            }
            const patientRef = doc(db, "users", slot.patientId)
            const snap = await getDoc(patientRef)
            const patientName = snap.exists() ? snap.data().name : "Unknown"
            return { ...slot, patientName }
          })
        )
        setBookedWithNames(results)
      } catch (err) {
        console.error("Error fetching patient names:", err)
        setBookedWithNames(bookedSlots.map((s) => ({ ...s, patientName: "Error" })))
      }
      setLoadingBooked(false)
    }

    fetchPatientNames()
  }, [slots])

  // 3) Handler to add a new slot
  const handleAddSlot = async (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!date || !startTime || !endTime) {
      setError("All fields are required.")
      return
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.")
      return
    }

    try {
      await addDoc(collection(db, "users", user.uid, "availability"), {
        date,
        startTime,
        endTime,
        booked: false,
        canceled: false,
        patientId: null,
        createdAt: new Date().toISOString()
      })
      setDate("")
      setStartTime("")
      setEndTime("")
    } catch (err) {
      console.error("Error adding slot:", err)
      setError("Failed to add slot. Please try again.")
    }
  }

  // 4) Handler to “cancel” (soft‐delete) a slot
  const handleDeleteSlot = async (slotId) => {
    try {
      const slotDoc = doc(db, "users", user.uid, "availability", slotId)
      await updateDoc(slotDoc, { canceled: true })
    } catch (err) {
      console.error("Error canceling slot:", err)
    }
  }

  // Split slots into “available” vs “booked/canceled” for display
  const availableSlots = slots.filter((s) => !s.booked && !s.canceled)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* HEADER */}
      <Typography variant="h4" gutterBottom>
        🩺 Professional Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Welcome, Dr. {userProfile?.name}
      </Typography>

      {/* -------------------------------------------------------------- */}
      {/* ADD SLOT FORM */}
      {/* -------------------------------------------------------------- */}
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
                onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setStartTime(e.target.value)}
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
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Add Slot
          </Button>
        </Box>
      </Paper>

      {/* -------------------------------------------------------------- */}
      {/* AVAILABLE SLOTS TABLE */}
      {/* -------------------------------------------------------------- */}
      <Typography variant="h6" gutterBottom>
        🗓️ Your Available Slots
      </Typography>

      {loadingSlots ? (
        <Typography>Loading slots…</Typography>
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
              {availableSlots.map((slot) => (
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

      {/* -------------------------------------------------------------- */}
      {/* BOOKED APPOINTMENTS TABLE */}
      {/* -------------------------------------------------------------- */}
      <Typography variant="h6" gutterBottom>
        📌 Booked Appointments
      </Typography>

      {loadingBooked ? (
        <CircularProgress size={24} />
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
              {bookedWithNames.map((slot) => (
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
