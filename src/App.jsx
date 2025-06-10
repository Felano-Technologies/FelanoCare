// src/App.jsx
import React from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { useAuth } from "./contexts/AuthContext"
import { useCart } from "./contexts/CartContext"
import { getAge, getAgeCategory } from "./utils/age"

import Login from "./pages/Login"
import PatientSignup from "./components/PatientSignUp"
import ProfessionalSignup from "./components/ProfessionalSignUp"
import ProfileForm from "./components/ProfileForm"
import NavBar from "./components/NavBar"
import { youthTheme, adultTheme, seniorTheme } from "./themes"

import CircularProgress from "@mui/material/CircularProgress"

// Route Groups
import PatientRoutes from "./routes/PatientRoutes"
import ProRoutes from "./routes/ProRoutes"

export default function App() {
  const { user, userProfile, loading } = useAuth()
  const { cartItems } = useCart()
  const location = useLocation()

  // 1) Show global loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <CircularProgress />
      </div>
    )
  }

  // 2) Public signup routes
  const isPublicRoute = ['/signup', '/pro-signup'].includes(location.pathname)
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

  // 3) Not logged in → show login
  if (!user) {
    return <Login />
  }

  // 4) Profile loading
  if (!userProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <CircularProgress />
      </div>
    )
  }

  // 5) Incomplete profile → show form
  if (!userProfile.name || !userProfile.birthDate) {
    return <ProfileForm />
  }

  // 6) Choose MUI theme
  let chosenTheme = adultTheme
  if (userProfile.role === "patient") {
    const age = getAge(userProfile.birthDate)
    const category = getAgeCategory(age)
    const themesMap = { youth: youthTheme, adult: adultTheme, senior: seniorTheme }
    chosenTheme = themesMap[category]
  }

  return (
    <ThemeProvider theme={chosenTheme}>
      <NavBar totalItems={cartItems.reduce((sum, i) => sum + i.quantity, 0)} />

      <Routes>
        {/* Patient routes under /patient/* */}
        <Route path="/patient/*" element={<PatientRoutes />} />

        {/* Pro routes under /pro/* */}
        <Route path="/pro/*" element={<ProRoutes />} />

        {/* Root redirect based on role */}
        <Route
          path="/"
          element={
            userProfile.role === "professional" ? (
              <Navigate to="/pro/pro-dashboard" replace />
            ) : (
              <Navigate to="/patient/patient-dashboard" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
