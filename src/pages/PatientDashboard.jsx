// src/pages/PatientDashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getAge, getAgeCategory } from "../utils/age"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText
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
import { motion } from "framer-motion"
import Footer from "../components/Footer"

// Configuration per age category
const CATEGORY_CONFIG = {
  youth: {
    bannerGradient: "linear-gradient(135deg, #6A11CB 20%, #2575FC 80%)",
    accentColor: "#2575FC",
    textColor: "#FFFFFF",
    tip: "🏃‍♂️ Stay active, get enough sleep, and balance school with fun!",
    tipIcon: <FitnessCenterIcon fontSize="large" />,
  },
  adult: {
    bannerGradient: "linear-gradient(135deg, #2193b0 20%, #6dd5ed 80%)",
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

  // 1) Calculate age and category
  const age = getAge(userProfile.birthDate)
  const category = getAgeCategory(age) // "youth" | "adult" | "senior"
  const {
    bannerGradient,
    accentColor,
    textColor,
    tip,
    tipIcon
  } = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.adult

  // 2) Next Upcoming Appointment (real-time listener)
  const [nextAppointment, setNextAppointment] = useState(null)
  const [loadingAppointment, setLoadingAppointment] = useState(true)
  const [appointmentError, setAppointmentError] = useState("")

  useEffect(() => {
    if (!user) return

    setLoadingAppointment(true)
    const todayStr = format(new Date(), "yyyy-MM-dd")

    // Query for the soonest non-canceled slot where patientId == user.uid
    const nextApptQuery = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", false),
      where("date", ">=", todayStr),
      orderBy("date", "asc"),
      orderBy("startTime", "asc"),
      limit(1)
    )

    // Listen in real time
    const unsubscribe = onSnapshot(
      nextApptQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0]
          setNextAppointment({ ref: docSnap.ref, ...docSnap.data() })
        } else {
          setNextAppointment(null)
        }
        setLoadingAppointment(false)
      },
      (error) => {
        console.error("Error fetching next appointment:", error)
        setAppointmentError("Could not load upcoming appointment.")
        setLoadingAppointment(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // 3) Past Appointment History (real-time listener)
  const [appointmentHistory, setAppointmentHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    setLoadingHistory(true)
    const todayStr = format(new Date(), "yyyy-MM-dd")

    const historyQuery = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", false),
      where("date", "<", todayStr),
      orderBy("date", "desc"),
      orderBy("startTime", "desc")
    )

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const pastList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        setAppointmentHistory(pastList)
        setLoadingHistory(false)
      },
      (error) => {
        console.error("Error fetching appointment history:", error)
        setLoadingHistory(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // 4) Personal Stats (real-time listener)
  const [stats, setStats] = useState({ totalBooked: 0, totalCanceled: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!user) return

    setLoadingStats(true)

    const bookedQuery = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", false)
    )
    const canceledQuery = query(
      collectionGroup(db, "availability"),
      where("patientId", "==", user.uid),
      where("canceled", "==", true)
    )

    let bookedUnsub, canceledUnsub

    bookedUnsub = onSnapshot(
      bookedQuery,
      (snapshot) => {
        setStats((prev) => ({ ...prev, totalBooked: snapshot.size }))
      },
      (err) => {
        console.error("Error counting booked:", err)
      }
    )

    canceledUnsub = onSnapshot(
      canceledQuery,
      (snapshot) => {
        setStats((prev) => ({ ...prev, totalCanceled: snapshot.size }))
        setLoadingStats(false)
      },
      (err) => {
        console.error("Error counting canceled:", err)
        setLoadingStats(false)
      }
    )

    return () => {
      bookedUnsub()
      canceledUnsub()
    }
  }, [user])

  // Cancel the current appointment
  const handleCancelAppointment = async () => {
    if (!nextAppointment) return
    try {
      await nextAppointment.ref.update({
        booked: false,
        patientId: null
      })
      setNextAppointment(null)
      setAppointmentError("")
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setAppointmentError("Failed to cancel appointment.")
    }
  }

  // 5) Health Tip pulse toggle
  const [showTip, setShowTip] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => setShowTip((prev) => !prev), 4000)
    return () => clearInterval(interval)
  }, [])

  
  return (
    <Box>
      {/* ================================ */}
      {/* Hero Banner (Animated) */}
      {/* ================================ */}
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
            px: { xs: 2, md: 6 },
            textAlign: { xs: "center", md: "left" }
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "2rem", md: "3rem" }
            }}
          >
            Hello, {userProfile.name}!
          </Typography>

        </Box>
      </motion.div>

      <Container maxWidth="lg" sx={{ mt: -3, mb: 6 }}>
        {/* ================================ */}
        {/* Next Appointment & Health Tip */}
        {/* ================================ */}
        <Grid container spacing={4}>
          {/* Next Appointment Card */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card
                elevation={4}
                sx={{
                  borderLeft: `6px solid ${accentColor}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%"
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Upcoming Appointment
                  </Typography>
                  {loadingAppointment ? (
                    <CircularProgress size={24} />
                  ) : nextAppointment ? (
                    <Box>
                      <Typography variant="subtitle1">
                        📅{" "}
                        {format(parseISO(nextAppointment.date), "MMMM d, yyyy")}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        ⏰ {nextAppointment.startTime} –{" "}
                        {nextAppointment.endTime}
                      </Typography>

                    </Box>
                  ) : (
                    <Typography color="textSecondary">
                      You have no upcoming appointments.
                    </Typography>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Health Tip Card (Pulse Animation) */}
          <Grid item xs={12} md={5}>
            <motion.div
              animate={{
                scale: showTip ? 1.05 : 0.95
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Card
                elevation={4}
                sx={{
                  bgcolor: accentColor,
                  color: textColor,
                  display: "flex",
                  alignItems: "center",
                  p: 3,
                  height: "100%"
                }}
              >
                <Box sx={{ mr: 2 }}>{tipIcon}</Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Health Tip
                  </Typography>
                  <Typography variant="body1">{tip}</Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 6 }} />

        {/* ================================ */}
        {/* Personal Stats & Appointment History */}
        {/* ================================ */}
        <Grid container spacing={4}>
          {/* Stats Card */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Stats
                </Typography>
                {loadingStats ? (
                  <CircularProgress size={24} />
                ) : (
                  <Box>
                    <Typography variant="body1">
                      Appointments Booked:{" "}
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                      >
                        {stats.totalBooked}
                      </motion.span>
                    </Typography>
                    <Typography variant="body1">
                      Appointments Canceled:{" "}
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                      >
                        {stats.totalCanceled}
                      </motion.span>
                    </Typography>
                  </Box>
                )}
              </Card>
            </motion.div>
          </Grid>

          {/* Appointment History (Collapsible) */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card elevation={3}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography variant="h6">
                      Appointment History
                    </Typography>
                    <IconButton
                      onClick={() => setHistoryOpen((prev) => !prev)}
                      aria-label="expand history"
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform: historyOpen
                            ? "rotate(180deg)"
                            : "rotate(0)",
                          transition: "transform 0.3s"
                        }}
                      />
                    </IconButton>
                  </Box>
                  <Collapse in={historyOpen} timeout="auto" unmountOnExit>
                    {loadingHistory ? (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : appointmentHistory.length === 0 ? (
                      <Typography color="textSecondary" sx={{ mt: 2 }}>
                        No past appointments found.
                      </Typography>
                    ) : (
                      <List>
                        {appointmentHistory.map((appt) => (
                          <ListItem key={appt.id} divider>
                            <ListItemText
                              primary={`📅 ${format(
                                parseISO(appt.date),
                                "MMM d, yyyy"
                              )} ⏰ ${appt.startTime} – ${appt.endTime}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 6 }} />

      </Container>


      <Footer />
    </Box>
  )
}
