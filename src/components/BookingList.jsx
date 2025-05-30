// src/components/BookingList.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

export default function BookingList() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user) {
      setBookings([])
      return
    }

    // build a query that only returns this user's bookings
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = []
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
      })
      setBookings(items)
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0
        ? <p>You have no bookings yet.</p>
        : <ul>
            {bookings.map((b) => (
              <li key={b.id}>
                {b.doctor} on {b.date}
              </li>
            ))}
          </ul>
      }
    </div>
  )
}
