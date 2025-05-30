import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useAuth } from './contexts/AuthContext'
import { getAge, getAgeCategory } from './utils/age'

import Auth            from './components/Auth'
import ProfileForm     from './components/ProfileForm'
import MainDashboard   from './components/MainDashboard'
import BookingPage     from './pages/BookingPage'
import EPharmacyPage   from './pages/EPharmacyPage'
import DieteticsPage   from './pages/DieteticsPage'
import MentalHealthPage from './pages/MentalHealthPage'
import HerbalPage      from './pages/HerbalPage'

export default function App() {
  const { user, userProfile, loading, logout } = useAuth()
  if (loading) return <p>Loading…</p>
  if (!user)    return <Auth />

  // ask for name + DOB if missing
  if (!userProfile?.name || !userProfile?.birthDate) {
    return <ProfileForm />
  }

  // pick MUI theme by age
  const age       = getAge(userProfile.birthDate)
  const category  = getAgeCategory(age)
  const themes = {
    youth: createTheme({ YouthDashboard: { /* same as youthTheme */ } }),
    adult: createTheme({ AdultDashboard: { /* same as adultTheme */ } }),
    senior: createTheme({ SeniorDashboard: { /* same as seniorTheme */ } }),
  }
  const theme = themes[category]

  return (
    <ThemeProvider theme={theme}>
      <header style={{ padding: '1rem', textAlign: 'right' }}>
        <button onClick={logout}>Log out</button>
      </header>

      <Routes>
        <Route path="/" element={<MainDashboard ageCategory={category} />} />
        <Route path="/booking"       element={<BookingPage />} />
        <Route path="/epharmacy"     element={<EPharmacyPage />} />
        <Route path="/dietetics"     element={<DieteticsPage />} />
        <Route path="/mental-health" element={<MentalHealthPage />} />
        <Route path="/herbal"        element={<HerbalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
