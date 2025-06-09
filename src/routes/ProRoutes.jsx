import React from "react"
import { Routes, Route } from "react-router-dom"
import RequireAuth from "../components/RequireAuth"
import ProfessionalDashboard from "../pages/ProfessionalDashboard"

export default function ProRoutes() {
  return (
    <Routes>
      <Route
        path="/pro-dashboard"
        element={
          <RequireAuth role="professional">
            <ProfessionalDashboard />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
