// src/components/RequireAuth.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children, role }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <p>Loading…</p>
  if (!user)   return <Navigate to="/login" replace />
  if (role && userProfile?.role !== role) {
    // If the user’s role doesn’t match, redirect to root or “access denied”
    return <Navigate to="/" replace />
  }
  return children
}
