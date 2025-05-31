// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { useAuth } from './contexts/AuthContext'
import { useCart } from './contexts/CartContext'
import { getAge, getAgeCategory } from './utils/age'

// Public & Shared
import Login              from './pages/Login'                   // <-- point at Login.jsx, not './pages/'
import PatientSignup      from './components/PatientSignup'      // ensure the filename matches exactly
import ProfessionalSignup from './components/ProfessionalSignup' // ensure the filename matches exactly
import RequireAuth        from './components/RequireAuth'
import NavBar             from './components/NavBar'
import ProfileForm        from './components/ProfileForm'
import PatientDashboard    from "./pages/PatientDashboard"

// Patient‐only pages
import PatientBookingPage from './pages/PatientBookingPage'
import EPharmacyPage      from './pages/EPharmacyPage'
import DieteticsPage      from './pages/DieteticsPage'
import MentalHealthPage   from './pages/MentalHealthPage'
import HerbalPage         from './pages/HerbalPage'
import AIChatPage         from './pages/AIChatPage'

// Professional‐only pages
import ProfessionalDashboard from './pages/ProfessionalDashboard'

// MUI Icons & Components (for header/cart/logout)
import IconButton       from '@mui/material/IconButton'
import Badge            from '@mui/material/Badge'
import Button           from '@mui/material/Button'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

// Pre‐defined themes by age group
import { youthTheme, adultTheme, seniorTheme } from './themes'

export default function App() {
  const { user, userProfile, loading, logout } = useAuth()
  const { cartItems } = useCart()

  // 1) If auth is still loading, show a loading message
  if (loading) return <p>Loading…</p>

  // 2) If not logged in, show the Login page
  if (!user) return <Login />

  // 3) If a patient is missing name or birthDate, show ProfileForm
  if (
    userProfile.role === 'patient' &&
    (!userProfile?.name || !userProfile?.birthDate)
  ) {
    return <ProfileForm />
  }

  // 4) Determine theme based on patient’s age (professionals use adultTheme by default)
  let themeToUse = adultTheme
  if (userProfile.role === 'patient') {
    const age = getAge(userProfile.birthDate)
    const category = getAgeCategory(age)
    const themes = { youth: youthTheme, adult: adultTheme, senior: seniorTheme }
    themeToUse = themes[category]
  }

  return (
    <ThemeProvider theme={themeToUse}>
      {/* Top NavBar & Header */}
      <NavBar />

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          backgroundColor: themeToUse.palette.background.paper
        }}
      >
        <h1 style={{ margin: 0 }}>FelanoCare</h1>
        <div>
          {userProfile.role === 'patient' && (
            <IconButton
              onClick={() => { window.location.href = '/epharmacy' }}
              size="large"
              aria-label="show cart items"
              color="inherit"
            >
              <Badge badgeContent={cartItems.reduce((sum, i) => sum + i.quantity, 0)} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
          <Button onClick={logout} color="primary" variant="outlined" sx={{ ml: 2 }}>
            Log out
          </Button>
        </div>
      </header>

      <Routes>
        {/* ----------------------------- */}
        {/* PUBLIC / UNPROTECTED ROUTES   */}
        {/* ----------------------------- */}
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<PatientSignup />} />
        <Route path="/pro-signup" element={<ProfessionalSignup />} />

        {/* ----------------------------- */}
        {/* PATIENT‐ONLY ROUTES           */}
        {/* ----------------------------- */}
        <Route
          path="/patient-dashboard"
          element={
            <RequireAuth role="patient">
              <PatientDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/book-consultation"
          element={
            <RequireAuth role="patient">
              <PatientBookingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/epharmacy"
          element={
            <RequireAuth role="patient">
              <EPharmacyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dietetics"
          element={
            <RequireAuth role="patient">
              <DieteticsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mental-health"
          element={
            <RequireAuth role="patient">
              <MentalHealthPage />
            </RequireAuth>
          }
        />
        <Route
          path="/herbal"
          element={
            <RequireAuth role="patient">
              <HerbalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ai"
          element={
            <RequireAuth role="patient">
              <AIChatPage />
            </RequireAuth>
          }
        />

        {/* ----------------------------- */}
        {/* PROFESSIONAL‐ONLY ROUTES       */}
        {/* ----------------------------- */}
        <Route
          path="/pro-dashboard"
          element={
            <RequireAuth role="professional">
              <ProfessionalDashboard />
            </RequireAuth>
          }
        />

        {/* ----------------------------- */}
        {/* ROOT: redirect based on role */}
        {/* ----------------------------- */}
        <Route
          path="/"
          element={
            userProfile.role === 'professional'
              ? <Navigate to="/pro-dashboard" replace />
              : <Navigate to="/patient-dashboard" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
