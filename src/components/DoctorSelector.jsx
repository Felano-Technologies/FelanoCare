// src/components/DoctorSelector.jsx
import React, { useEffect, useState } from "react"
import { db } from "../firebase"                    // import 'db' instead of 'firestore'
import { collection, query, where, getDocs } from "firebase/firestore"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography
} from "@mui/material"

export default function DoctorSelector({ onDoctorSelected }) {
  const [doctors, setDoctors] = useState([])
  const [selected, setSelected] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Query Firestore for all users with role === "professional"
    const q = query(collection(db, "users"), where("role", "==", "professional"))
    getDocs(q)
      .then((snapshot) => {
        const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setDoctors(arr)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err)
        setLoading(false)
      })
  }, [])

  const handleChange = (e) => {
    setSelected(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selected) onDoctorSelected(selected)
  }

  if (loading) return <Typography>Loading doctors…</Typography>
  if (doctors.length === 0) return <Typography>No doctors available.</Typography>

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
        <Select
          labelId="doctor-select-label"
          value={selected}
          label="Select Doctor"
          onChange={handleChange}
          required
        >
          {doctors.map((doc) => (
            <MenuItem key={doc.id} value={doc.id}>
              Dr. {doc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained">
        View Slots
      </Button>
    </Box>
  )
}
