import React from "react"
import { Routes, Route, Outlet } from "react-router-dom"
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
    <RequireAuth role="patient">
      <Routes>
        {/* This route will render the layout + nested routes */}
        <Route
          path="/"
          element={
            <div>
              {/* Shared layout components like NavBar can go here */}
              <Outlet />
            </div>
          }
        >
          {/* Dashboard as the default landing page */}
          <Route index element={<PatientDashboard />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-consultation" element={<PatientBookingPage />} />
          <Route path="epharmacy" element={<EPharmacyPage />} />
          <Route path="dietetics" element={<DieteticsPage />} />
          <Route path="mental-health" element={<MentalHealthPage />} />
          <Route path="herbal" element={<HerbalPage />} />
          <Route path="ai" element={<AIChatPage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
      </Routes>
    </RequireAuth>
  )
}
