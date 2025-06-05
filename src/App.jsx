// src/App.jsx
import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { useAuth } from "./contexts/AuthContext"
import { useCart } from "./contexts/CartContext"
import { getAge, getAgeCategory } from "./utils/age"

// Public & Shared
import Login                from "./pages/Login"
import PatientSignup        from "./components/PatientSignup"
import ProfessionalSignup   from "./components/ProfessionalSignUp"
import RequireAuth          from "./components/RequireAuth"
import ProfileForm          from "./components/ProfileForm"

// Patient‐only pages
import PatientDashboard     from "./pages/PatientDashboard"
import PatientBookingPage   from "./pages/PatientBookingPage"
import EPharmacyPage        from "./pages/EPharmacyPage"
import DieteticsPage        from "./pages/DieteticsPage"
import MentalHealthPage     from "./pages/MentalHealthPage"
import HerbalPage           from "./pages/HerbalPage"
import AIChatPage           from "./pages/AIChatPage"
import CartPage            from "./pages/CartPage"
// Professional‐only pages
import ProfessionalDashboard from "./pages/ProfessionalDashboard"

// UI (NavBar, Header) & Theming
import NavBar          from "./components/NavBar"
import IconButton      from "@mui/material/IconButton"
import Badge           from "@mui/material/Badge"
import Button          from "@mui/material/Button"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import { youthTheme, adultTheme, seniorTheme } from "./themes"
import { useNavigate } from 'react-router-dom';

export default function App() {
  const { user, userProfile, loading, logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()

  // 1) Still checking auth state?
  if (loading) {
    return <p>Loading…</p>
  }

  // 2) If not logged in, show the (un-themed) Login or Signup flow
  //    (Login.jsx contains the tabs “Patient vs Professional”)
  if (!user) {
    return <Login />
  }

  // 3) If user is signed in but we’re still fetching their Firestore profile:
  if (user && !userProfile) {
    return <p>Loading profile…</p>
  }

  // 4) If userProfile exists but (for patients) is missing required fields:
  //    e.g. no `name` or `birthDate` → show un-themed ProfileForm
  if (
    userProfile.role === "patient" &&
    (!userProfile.name || !userProfile.birthDate)
  ) {
    return <ProfileForm />
  }

  // 5) At this point, we know user is fully signed in and has a valid profile.
  //    Determine the theme based on age (only for patients). Professionals default to adultTheme.
  let chosenTheme = adultTheme
  if (userProfile.role === "patient") {
    const age       = getAge(userProfile.birthDate)
    const category  = getAgeCategory(age) // "youth" | "adult" | "senior"
    const themesMap = { youth: youthTheme, adult: adultTheme, senior: seniorTheme }
    chosenTheme     = themesMap[category]
  }

  // 6) Render the rest of the app under that chosen theme:
  return (
    <ThemeProvider theme={chosenTheme}>
      {/* Only show NavBar & header once the user is truly “in the app” */}
      <NavBar />

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          backgroundColor: chosenTheme.palette.background.paper
        }}
      >
        <h1 style={{ margin: 0 }}>FelanoCare</h1>

        <div>
          {/* If a patient, show cart icon */}
          {userProfile.role === "patient" && (
            <IconButton
              onClick={() => navigate("/cart")}    // ← changed to navigate("/cart")
              size="large"
              aria-label="show cart items"
              color="inherit"
            >
              <Badge
                badgeContent={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                color="secondary"
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}

          {/* Log out for everyone */}
          <Button onClick={logout} color="primary" variant="outlined" sx={{ ml: 2 }}>
            Log out
          </Button>
        </div>
      </header>
      <Routes>
        {/* ----------------------------- */}
        {/* PUBLIC / UNPROTECTED ROUTES   */}
        {/* ----------------------------- */}
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<PatientSignup />} />
        <Route path="/pro-signup" element={<ProfessionalSignup />} />

        {/* ----------------------------- */}
        {/* PATIENT-ONLY ROUTES           */}
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
          path="/cart"
          element={
          <RequireAuth role="patient">
            <CartPage />
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
        {/* PROFESSIONAL-ONLY ROUTES       */}
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
        {/* ROOT & CATCH-ALL REDIRECTS     */}
        {/* ----------------------------- */}
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
