// src/components/BookingForm.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export default function BookingForm() {
  const { user } = useAuth()            // ← get current user
  const [doctor, setDoctor] = useState('')
  const [date, setDate]       = useState('')
  const [status, setStatus]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return setStatus('You must be signed in.')

    try {
      await addDoc(collection(db, 'bookings'), {
        userId:    user.uid,           // ← add this field
        doctor,
        date,
        createdAt: Timestamp.now()
      })
      setStatus('Booking created!')
      setDoctor('')
      setDate('')
    } catch (error) {
      console.error(error)
      setStatus('Error creating booking')
    }
  }

  return (
    <div>
      <h2>Book a Consultation</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Doctor Name'
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          required
        />
        <input
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type='submit'>Book</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}
