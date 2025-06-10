// src/pages/ProfessionalDashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  keyframes
} from "@mui/material"
import {
  EventAvailable as AvailableIcon,
  EventBusy as BookedIcon,
  EventNote as AllIcon,
  CancelPresentation as CanceledIcon,
  Add as AddIcon
} from "@mui/icons-material"
import DeleteIcon from "@mui/icons-material/Delete"
import { collection, addDoc, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore"
import { db } from "../firebase"

// animated gradient keyframes
const gradientAnim = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`

export default function ProfessionalDashboard() {
  const { user, userProfile } = useAuth()

  // ─ Hooks ─────────────────────────────────────────────────────────
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState(0)

  // form
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [formError, setFormError] = useState("")

  // slots
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [errorSlots, setErrorSlots] = useState("")

  const [bookedWithNames, setBookedWithNames] = useState([])
  const [loadingBooked, setLoadingBooked] = useState(true)

  // filters
  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // ─ Effects ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user !== undefined && userProfile !== undefined) {
      setAuthLoading(false)
    }
  }, [user, userProfile])

  useEffect(() => {
    if (!user) return
    setLoadingSlots(true)
    const ref = collection(db, "users", user.uid, "availability")
    const unsub = onSnapshot(
      ref,
      snap => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        arr.sort((a, b) =>
          a.date !== b.date
            ? a.date.localeCompare(b.date)
            : a.startTime.localeCompare(b.startTime)
        )
        setSlots(arr)
        setLoadingSlots(false)
      },
      err => {
        console.error(err)
        setErrorSlots("Failed to load slots.")
        setLoadingSlots(false)
      }
    )
    return unsub
  }, [user])

  useEffect(() => {
    const booked = slots.filter(s => s.booked && !s.canceled)
    if (!booked.length) {
      setBookedWithNames([])
      setLoadingBooked(false)
      return
    }
    setLoadingBooked(true)
    Promise.all(
      booked.map(async slot => {
        try {
          const snap = await getDoc(doc(db, "users", slot.patientId))
          return { ...slot, patientName: snap.data()?.name || "Unknown" }
        } catch {
          return { ...slot, patientName: "Unknown" }
        }
      })
    ).then(res => {
      setBookedWithNames(res)
      setLoadingBooked(false)
    })
  }, [slots])

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

  // ─ Handlers ────────────────────────────────────────────────────────
  const handleAddSlot = async e => {
    e.preventDefault()
    setFormError("")
    if (!date || !startTime || !endTime) {
      setFormError("All fields are required.")
      return
    }
    if (endTime <= startTime) {
      setFormError("End must be after start.")
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
      setDate(""); setStartTime(""); setEndTime("")
    } catch (err) {
      console.error(err)
      setFormError("Failed to add slot.")
    }
  }

  const handleCancel = async id => {
    try {
      await updateDoc(doc(db, "users", user.uid, "availability", id), { canceled: true })
    } catch (err) {
      console.error(err)
    }
  }

  // ─ Filtering ────────────────────────────────────────────────────────
  const filtered = slots.filter(s => {
    if (filterDate && s.date !== filterDate) return false
    if (filterStatus === "available" && (s.booked || s.canceled)) return false
    if (filterStatus === "booked" && (!s.booked || s.canceled)) return false
    if (filterStatus === "canceled" && !s.canceled) return false
    return true
  })

  // ─ Stats ──────────────────────────────────────────────────────────
  const total = slots.length
  const available = slots.filter(s => !s.booked && !s.canceled).length
  const booked = slots.filter(s => s.booked && !s.canceled).length
  const canceled = slots.filter(s => s.canceled).length

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Animated gradient background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(45deg, #2196f3, #21cbf3, #64b5f6, #81d4fa)",
          backgroundSize: "400% 400%",
          animation: `${gradientAnim} 20s ease infinite`,
          zIndex: -2
        }}
      />

      {/* Semi-transparent overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(255,255,255,0.85)",
          zIndex: -1
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          🩺 Dr. {userProfile.name}’s Dashboard
        </Typography>

        {/* Stats */}
        <Grid container spacing={2} mb={4}>
          {[
            { label: "All Slots", value: total, icon: <AllIcon color="action" /> },
            { label: "Available", value: available, icon: <AvailableIcon color="success" /> },
            { label: "Booked", value: booked, icon: <BookedIcon color="primary" /> },
            { label: "Canceled", value: canceled, icon: <CanceledIcon color="error" /> }
          ].map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Box sx={{ fontSize: 40 }}>{stat.icon}</Box>
                  <Typography variant="h5">{stat.value}</Typography>
                  <Typography color="textSecondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
            <Tab icon={<AddIcon />} label="Add Slot" />
            <Tab icon={<AllIcon />} label="Manage Slots" />
          </Tabs>
        </Paper>

        {/* Add Slot Panel */}
        {tab === 0 && (
          <Box component="form" onSubmit={handleAddSlot} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              {formError && (
                <Grid item xs={12}>
                  <Alert severity="error">{formError}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  Add Slot
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Manage Slots Panel */}
        {tab === 1 && (
          <Box sx={{ mt: 3 }}>
            {/* Filters */}
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Filter by Date"
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={8}>
                {["all","available","booked","canceled"].map(status => (
                  <Button
                    key={status}
                    variant={filterStatus===status?"contained":"outlined"}
                    onClick={()=>setFilterStatus(status)}
                    sx={{ mr: 1 }}
                  >
                    {status.charAt(0).toUpperCase()+status.slice(1)}
                  </Button>
                ))}
              </Grid>
            </Grid>

            {/* Table */}
            {loadingSlots ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : errorSlots ? (
              <Alert severity="error">{errorSlots}</Alert>
            ) : filtered.length===0 ? (
              <Typography>No slots match filters.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(slot => {
                    const isBooked = slot.booked && !slot.canceled
                    const patient = bookedWithNames.find(s=>s.id===slot.id)?.patientName||"-"
                    return (
                      <TableRow key={slot.id}>
                        <TableCell>{slot.date}</TableCell>
                        <TableCell>
                          {slot.startTime} – {slot.endTime}
                        </TableCell>
                        <TableCell>{isBooked?patient:"—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              slot.canceled?"Canceled":
                              isBooked?"Booked":"Available"
                            }
                            color={
                              slot.canceled?"error":
                              isBooked?"primary":"success"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {!slot.canceled && (
                            <IconButton
                              color="error"
                              onClick={()=>handleCancel(slot.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}
