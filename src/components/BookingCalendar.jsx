// src/components/BookingCalendar.jsx
import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Paper
} from "@mui/material"
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { format, parseISO } from "date-fns"
import { db } from "../firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore"
import { useAuth } from "../contexts/AuthContext"

/**
 * BookingCalendar
 *
 * Props:
 *  - doctorUid (string): The UID of the selected doctor.
 *
 * Renders a panel that:
 *  1. If the patient already has a booking with this doctor, shows that booking
 *     and allows cancellation.
 *  2. Otherwise, displays a StaticDatePicker with only available dates clickable,
 *     and lists available time slots for the selected date, letting the patient book.
 */
export default function BookingCalendar({ doctorUid }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingError, setBookingError] = useState("")

  // Set of “YYYY-MM-DD” strings representing dates that have at least one slot
  const [availableDates, setAvailableDates] = useState(new Set())
  const [loadingDates, setLoadingDates] = useState(false)

  // If the patient has already booked a slot with this doctor:
  const [bookedSlot, setBookedSlot] = useState(null)
  const [loadingBookedSlot, setLoadingBookedSlot] = useState(false)

  // ---------------------------------------------------
  // 1) Listen for any existing patient booking under this doctor
  // ---------------------------------------------------
  useEffect(() => {
    if (!doctorUid || !user) {
      setBookedSlot(null)
      return
    }
    setLoadingBookedSlot(true)
    const slotsRef = collection(db, "users", doctorUid, "availability")
    const q = query(
      slotsRef,
      where("booked", "==", true),
      where("patientId", "==", user.uid)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setBookedSlot(null)
        } else {
          // If multiple (shouldn’t), just take the first
          const docData = snapshot.docs[0].data()
          setBookedSlot({ id: snapshot.docs[0].id, ...docData })
        }
        setLoadingBookedSlot(false)
      },
      (error) => {
        console.error("Error fetching booked slot:", error)
        setLoadingBookedSlot(false)
      }
    )
    return () => unsubscribe()
  }, [doctorUid, user])

  // ---------------------------------------------------
  // 2) Fetch all available dates (booked=false, canceled=false)
  // ---------------------------------------------------
  useEffect(() => {
    if (!doctorUid) {
      setAvailableDates(new Set())
      return
    }
    setLoadingDates(true)
    const slotsRef = collection(db, "users", doctorUid, "availability")
    const q = query(
      slotsRef,
      where("booked", "==", false),
      where("canceled", "==", false)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dateSet = new Set()
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.date) {
            dateSet.add(data.date)
          }
        })
        setAvailableDates(dateSet)
        setLoadingDates(false)
      },
      (error) => {
        console.error("Error fetching available dates:", error)
        setLoadingDates(false)
      }
    )
    return () => unsubscribe()
  }, [doctorUid])

  // ---------------------------------------------------
  // 3) Fetch available slots for the selected date
  // ---------------------------------------------------
  useEffect(() => {
    if (!doctorUid) {
      setAvailableSlots([])
      return
    }
    // If the patient already has a booked slot, skip loading slots
    if (bookedSlot) {
      setAvailableSlots([])
      return
    }

    setLoadingSlots(true)
    setAvailableSlots([])

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const slotsRef = collection(db, "users", doctorUid, "availability")
    const q = query(
      slotsRef,
      where("date", "==", dateStr),
      where("booked", "==", false),
      where("canceled", "==", false)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const arr = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        arr.sort((a, b) => a.startTime.localeCompare(b.startTime))
        setAvailableSlots(arr)
        setLoadingSlots(false)
      },
      (error) => {
        console.error("Error fetching slots:", error)
        setLoadingSlots(false)
      }
    )
    return () => unsubscribe()
  }, [doctorUid, selectedDate, bookedSlot])

  // ---------------------------------------------------
  // 4) Handle booking a slot
  // ---------------------------------------------------
  const handleBook = async (slot) => {
    setBookingError("")
    if (!user) {
      setBookingError("You must be logged in to book.")
      return
    }
    try {
      const slotRef = doc(db, "users", doctorUid, "availability", slot.id)
      await updateDoc(slotRef, {
        booked: true,
        patientId: user.uid,
      })
      // Real‐time listeners will handle updating slots and bookedSlot
    } catch (err) {
      console.error("Booking error:", err)
      setBookingError("Failed to book. Please try again.")
    }
  }

  // ---------------------------------------------------
  // 5) Handle cancelling an existing booking
  // ---------------------------------------------------
  const handleCancel = async () => {
    if (!doctorUid || !bookedSlot) return
    try {
      const slotRef = doc(db, "users", doctorUid, "availability", bookedSlot.id)
      await updateDoc(slotRef, {
        booked: false,
        patientId: null,
      })
      // Real‐time listener will clear bookedSlot so calendar shows again
    } catch (err) {
      console.error("Cancel error:", err)
      setBookingError("Failed to cancel. Please try again.")
    }
  }

  // ---------------------------------------------------
  // 6) Helper to disable dates without availability
  // ---------------------------------------------------
  const shouldDisableDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return !availableDates.has(dateStr)
  }

  // ---------------------------------------------------
  // 7) Render logic:
  //    a) If loadingBookedSlot, show a spinner
  //    b) If bookedSlot exists, show booking info + “Cancel Booking”
  //    c) Else, show calendar and available slots
  // ---------------------------------------------------
  if (!doctorUid) {
    return (
      <Typography variant="body1" color="textSecondary">
        Select a doctor to see their availability.
      </Typography>
    )
  }

  if (loadingBookedSlot) {
    return <CircularProgress />
  }

  // --- Case: Patient has an existing booking ---
  if (bookedSlot) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            You’ve booked:
          </Typography>
          <Typography>
            📅 {format(parseISO(bookedSlot.date), "MMMM d, yyyy")} &nbsp;
            ⏰ {bookedSlot.startTime} – {bookedSlot.endTime}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, textTransform: "none" }}
            onClick={handleCancel}
          >
            Cancel Booking
          </Button>
        </Paper>

        {bookingError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {bookingError}
          </Typography>
        )}
      </Box>
    )
  }

  // --- Case: No existing booking, show calendar + slots ---
  return (
    <Box sx={{ mt: 4 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          shouldDisableDate={shouldDisableDate}
          renderInput={() => null} // hide text field
          sx={{
            "& .MuiPickersCalendarHeader-root": {
              backgroundColor: "#f5f5f5"
            },
          }}
        />
      </LocalizationProvider>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Slots on {format(selectedDate, "MMMM d, yyyy")}
        </Typography>

        {loadingSlots ? (
          <CircularProgress />
        ) : availableSlots.length === 0 ? (
          <Typography>No available slots for this date.</Typography>
        ) : (
          <Grid container spacing={2}>
            {availableSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {slot.startTime} – {slot.endTime}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1, textTransform: "none" }}
                    onClick={() => handleBook(slot)}
                  >
                    Book
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {bookingError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {bookingError}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

BookingCalendar.propTypes = {
  doctorUid: PropTypes.string.isRequired,
}
