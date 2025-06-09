import React from "react"
import { Routes, Route } from "react-router-dom"
import RequireAuth from "../components/RequireAuth"

import PatientDashboard from "../pages/PatientDashboard"
import PatientBookingPage from "../pages/PatientBookingPage"
import EPharmacyPage from "../pages/EPharmacyPage"
import DieteticsPage from "../pages/DieteticsPage"
import MentalHealthPage from "../pages/MentalHealthPage"
import HerbalPage from "../pages/HerbalPage"
import AIChatPage from "../pages/AIChatPage"
import CartPage from "../pages/CartPage"

export default function PatientRoutes() {
  return (
    <Routes>
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
      <Route
        path="/cart"
        element={
          <RequireAuth role="patient">
            <CartPage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
