// src/components/AvailableSlots.jsx
import React, { useEffect, useState } from "react"
import { db } from "../firebase"                    // import 'db' instead of 'firestore'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore"
import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from "@mui/material"
import { useAuth } from "../contexts/AuthContext"

export default function AvailableSlots({ doctorUid }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!doctorUid) return

    // Listen in real-time for availability where booked == false and canceled == false
    const slotsRef = collection(db, "users", doctorUid, "availability")
    const q = query(
      slotsRef,
      where("booked", "==", false),
      where("canceled", "==", false)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
      setSlots(arr)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [doctorUid])

  const handleBook = async (slot) => {
    if (!user) {
      alert("Please log in first.")
      return
    }
    const slotRef = doc(db, "users", doctorUid, "availability", slot.id)
    try {
      await updateDoc(slotRef, {
        booked: true,
        patientId: user.uid,
      })
      alert(`You booked ${slot.date} at ${slot.startTime}.`)
    } catch (err) {
      console.error("Booking error:", err)
      alert("Failed to book. Try again.")
    }
  }

  if (!doctorUid) {
    return <Typography>Select a doctor to see available slots.</Typography>
  }
  if (loading) {
    return <CircularProgress />
  }
  if (slots.length === 0) {
    return <Typography>No available slots for this doctor.</Typography>
  }

  return (
    <Grid container spacing={2}>
      {slots.map((slot) => (
        <Grid item xs={12} sm={6} md={4} key={slot.id}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">{slot.date}</Typography>
              <Typography variant="body2" color="textSecondary">
                {slot.startTime} – {slot.endTime}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleBook(slot)}
              >
                Book
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
