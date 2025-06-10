// src/pages/PatientDashboard.jsx
import React, { useEffect, useState, useMemo } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getAge, getAgeCategory } from "../utils/age"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Divider,
  Collapse,
  IconButton
} from "@mui/material"
import {
  Event as EventIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Restaurant as RestaurantIcon,
  Psychology as PsychologyIcon,
  Spa as SpaIcon,
  Chat as ChatIcon,
  Cancel as CancelIcon,
  Medication as MedicationIcon,
  FitnessCenter as FitnessCenterIcon,
  SelfImprovement as SelfImprovementIcon,
  ExpandMore as ExpandMoreIcon
} from "@mui/icons-material"
import { motion } from "framer-motion"
import Footer from "../components/Footer"
import { format, parseISO } from "date-fns"
import { db } from "../firebase"
import {
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore"
import {
  Calendar as CalendarIcon,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  BarChart2 as BarChartIcon,
  PieChart as PieChartIcon,
  Sliders as SlidersIcon
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  Cell
} from "recharts"

// **Your original colors & tips**
const CATEGORY_CONFIG = {
  youth: {
    bannerGradient: "linear-gradient(135deg, #6A11CB 20%, #2575FC 80%)",
    accentColor: "#2575FC",
    textColor: "#FFFFFF",
    tip: "🏃‍♂️ Stay active, get enough sleep, and balance school with fun!",
    tipIcon: <FitnessCenterIcon fontSize="large" />,
  },
  adult: {
    bannerGradient: "linear-gradient(135deg,rgb(0, 60, 255) 20%,rgb(0, 172, 225) 80%)",
    accentColor: "#2193b0",
    textColor: "#FFFFFF",
    tip: "🧘‍♀️ Remember to take breaks, manage stress, and stay hydrated.",
    tipIcon: <SelfImprovementIcon fontSize="large" />,
  },
  senior: {
    bannerGradient: "linear-gradient(135deg, #f7971e 20%, #ffd200 80%)",
    accentColor: "#f7971e",
    textColor: "#FFFFFF",
    tip: "💊 Keep track of your medications and enjoy gentle daily walks.",
    tipIcon: <MedicationIcon fontSize="large" />,
  }
}

export default function PatientDashboard() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()

  // Age & category
  const age = getAge(userProfile.birthDate)
  const category = getAgeCategory(age)
  const {
    bannerGradient,
    accentColor,
    textColor,
    tip,
    tipIcon
  } = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.adult

  // Upcoming appointment
  const [nextAppointment, setNextAppointment] = useState(null)
  const [loadingAppointment, setLoadingAppointment] = useState(true)

  // History & stats
  const [appointmentHistory, setAppointmentHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [stats, setStats] = useState({ booked: 0, canceled: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Fetch upcoming
  useEffect(() => {
    if (!user) return
    setLoadingAppointment(true)
    const today = format(new Date(), "yyyy-MM-dd")
    const q = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", false),
      where("date", ">=", today),
      orderBy("date", "asc"),
      orderBy("startTime", "asc"),
      limit(1)
    )
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) setNextAppointment(null)
      else setNextAppointment({ id: snap.docs[0].id, ...snap.docs[0].data() })
      setLoadingAppointment(false)
    })
    return unsub
  }, [user])

  // Fetch history & stats
  useEffect(() => {
    if (!user) return
    setLoadingHistory(true)
    setLoadingStats(true)
    const today = format(new Date(), "yyyy-MM-dd")

    // history
    const histQ = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("date", "<", today),
      orderBy("date", "desc"),
      orderBy("startTime", "desc")
    )
    const histUnsub = onSnapshot(histQ, snap => {
      setAppointmentHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoadingHistory(false)
    })

    // stats
    const bookedQ = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", false)
    )
    const canceledQ = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", true)
    )
    const bookedUnsub = onSnapshot(bookedQ, s =>
      setStats(st => ({ ...st, booked: s.size }))
    )
    const canceledUnsub = onSnapshot(canceledQ, s => {
      setStats(st => ({ ...st, canceled: s.size }))
      setLoadingStats(false)
    })

    return () => {
      histUnsub()
      bookedUnsub()
      canceledUnsub()
    }
  }, [user])

  // Analytics data
  const analyticsMonthly = useMemo(() => {
    const counts = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      counts[format(d, "MMM yyyy")] = 0
    }
    appointmentHistory.forEach(appt => {
      const m = format(parseISO(appt.date), "MMM yyyy")
      if (counts[m] !== undefined) counts[m] += 1
    })
    return Object.entries(counts).map(([month, count]) => ({ month, count }))
  }, [appointmentHistory])

  const analyticsPie = useMemo(() => {
    const total = stats.booked + stats.canceled
    if (total === 0) return []
    return [
      { name: "Booked", value: stats.booked },
      { name: "Canceled", value: stats.canceled }
    ]
  }, [stats])

  return (
    <Box>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            background: bannerGradient,
            color: textColor,
            py: { xs: 4, md: 8 },
            px: { xs: 2, md: 6 }
          }}
        >
          <Typography variant="h3" fontWeight={700}>
            Hello, {userProfile.name}!
          </Typography>
          <Typography variant="h6" mt={1}>
            Age: {age} —{" "}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Typography>
        </Box>
      </motion.div>

      {/* Full-width container with responsive side padding */}
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          mt: -3,
          mb: 6
        }}
      >
        {/* Top Cards */}
        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Upcoming Appointment */}
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Card
              elevation={4}
              sx={{
                borderLeft: `6px solid ${accentColor}`,
                width: "100%"
              }}
            >
              <CardHeader
                avatar={<CalendarIcon color={accentColor} />}
                title="Your Upcoming Appointment"
              />
              <CardContent>
                {loadingAppointment ? (
                  <CircularProgress />
                ) : nextAppointment ? (
                  <>
                    <Typography>
                      📅{" "}
                      {format(parseISO(nextAppointment.date), "MMMM d, yyyy")}
                    </Typography>
                    <Typography>
                      ⏰ {nextAppointment.startTime} –{" "}
                      {nextAppointment.endTime}
                    </Typography>
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <CalendarIcon size={40} opacity={0.3} />
                    <Typography mt={1} color="text.secondary">
                      No upcoming appointments.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Health Tip */}
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Card
              elevation={4}
              sx={{
                bgcolor: accentColor,
                color: textColor,
                display: "flex",
                alignItems: "center",
                p: 3,
                width: "100%"
              }}
            >
              <Box sx={{ mr: 2 }}>{tipIcon}</Box>
              <Box>
                <Typography variant="h6">Health Tip</Typography>
                <Typography>{tip}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6 }} />

        {/* Stats & History */}
        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Personal Stats */}
          <Grid item xs={12} md={4} sx={{ width: "100%" }}>
            <Card elevation={3} sx={{ p: 3, width: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Personal Stats
              </Typography>
              {loadingStats ? (
                <CircularProgress />
              ) : (
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <UserCheckIcon color="green" />
                    <Typography ml={1}>
                      Appointments Booked: {stats.booked}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <UserXIcon color="red" />
                    <Typography ml={1}>
                      Appointments Canceled: {stats.canceled}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Appointment History */}
          <Grid item xs={12} md={8} sx={{ width: "100%" }}>
            <Card elevation={3} sx={{ width: "100%" }}>
              <CardActions>
                <Button
                  endIcon={<ExpandMoreIcon />}
                  onClick={() => setHistoryOpen(prev => !prev)}
                >
                  {historyOpen ? "Hide" : "Show"} Past Appointments
                </Button>
              </CardActions>
              <Collapse in={historyOpen}>
                <CardContent>
                  {loadingHistory ? (
                    <CircularProgress />
                  ) : appointmentHistory.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <EventIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography mt={1} color="text.secondary">
                        No past appointments found.
                      </Typography>
                    </Box>
                  ) : (
                    appointmentHistory.map(appt => (
                      <Box
                        key={appt.id}
                        display="flex"
                        justifyContent="space-between"
                        py={1}
                        borderBottom="1px solid #eee"
                      >
                        <Typography>
                          {format(parseISO(appt.date), "MMM d, yyyy")}
                        </Typography>
                        <Typography>
                          {appt.startTime} – {appt.endTime}
                        </Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6 }} />

        {/* Analytics */}
        <Typography
          variant="h5"
          mb={2}
          display="flex"
          alignItems="center"
        >
          <BarChartIcon /> <Box ml={1}>Analytics</Box>
        </Typography>
        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Line Chart */}
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Card elevation={3} sx={{ width: "100%" }}>
              <CardHeader title="Last 6 Months" />
              <CardContent sx={{ height: 250 }}>
                {analyticsMonthly.every(d => d.count === 0) ? (
                  <Box textAlign="center" py={6}>
                    <BarChartIcon size={48} opacity={0.3} />
                    <Typography mt={1} color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsMonthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={accentColor}
                        strokeWidth={3}
                        dot={{ r: 4, fill: accentColor }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Card elevation={3} sx={{ width: "100%" }}>
              <CardHeader title="Booked vs. Canceled" />
              <CardContent sx={{ height: 250 }}>
                {analyticsPie.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <PieChartIcon size={48} opacity={0.3} />
                    <Typography mt={1} color="text.secondary">
                      No stats yet
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        <Cell key="booked" fill={accentColor} />
                        <Cell key="canceled" fill="#8884d8" />
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  )
}
