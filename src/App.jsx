import React from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { useAuth } from "./contexts/AuthContext"
import { useCart } from "./contexts/CartContext"
import { getAge, getAgeCategory } from "./utils/age"

import Login from "./pages/Login"
import PatientSignup from "./components/PatientSignUp"
import ProfessionalSignup from "./components/ProfessionalSignUp"
import RequireAuth from "./components/RequireAuth"
import ProfileForm from "./components/ProfileForm"
import NavBar from "./components/NavBar"
import { youthTheme, adultTheme, seniorTheme } from "./themes"

import IconButton from "@mui/material/IconButton"
import Badge from "@mui/material/Badge"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"

// Route Groups
import PatientRoutes from "./routes/PatientRoutes"
import ProRoutes from "./routes/ProRoutes"
export default function App() {
  const { user, userProfile, loading, logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <CircularProgress />
      </div>
    )
  }

  // Check if current route is public
  const isPublicRoute = ['/signup', '/pro-signup'].includes(location.pathname)

  // Handle public routes
  if (isPublicRoute) {
    return (
      <ThemeProvider theme={adultTheme}>
        <Routes>
          <Route path="/signup" element={<PatientSignup />} />
          <Route path="/pro-signup" element={<ProfessionalSignup />} />
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </ThemeProvider>
    )
  }

  // From this point, we're dealing with protected routes
  if (!user) {
    return <Login />
  }

  if (!userProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <CircularProgress />
      </div>
    )
  }

  // Check for missing profile fields
  const missingFields = !userProfile.name || !userProfile.birthDate
  if (missingFields) {
    return <ProfileForm />
  }

  // Determine theme based on role
  let chosenTheme = adultTheme
  if (userProfile.role === "patient") {
    const age = getAge(userProfile.birthDate)
    const category = getAgeCategory(age)
    const themesMap = { youth: youthTheme, adult: adultTheme, senior: seniorTheme }
    chosenTheme = themesMap[category]
  }

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <ThemeProvider theme={chosenTheme}>
      <NavBar />


      <Routes>
        {/* PATIENT ROUTES */}
        <Route path="/*" element={<PatientRoutes />} />

        {/* PROFESSIONAL ROUTES */}
        <Route path="/*" element={<ProRoutes />} />

        {/* ROLE-BASED ROOT REDIRECT */}
        <Route
          path="/"
          element={
            userProfile.role === "professional" ? (
              <Navigate to="/pro-dashboard" replace />
            ) : (
              <Navigate to="/patient-dashboard" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}