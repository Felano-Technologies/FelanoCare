// src/pages/PatientBookingPage.jsx
import React, { useState } from "react"
import { Container, Typography, Divider } from "@mui/material"
import DoctorSelector from "../components/DoctorSelector"
import BookingCalendar from "../components/BookingCalendar"

export default function PatientBookingPage() {
  const [doctorUid, setDoctorUid] = useState("")

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        📅 Book a Consultation
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Select a doctor and pick a date to view available slots.
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* Step 1: Choose a doctor */}
      <DoctorSelector onDoctorSelected={setDoctorUid} />

      {/* Step 2: Show calendar & slots if doctor is chosen */}
      {doctorUid && <BookingCalendar doctorUid={doctorUid} />}
    </Container>
  )
}
