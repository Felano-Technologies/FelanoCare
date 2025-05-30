// src/components/MedicineList.jsx
import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material'
import { useCart } from '../contexts/CartContext'

export default function MedicineList() {
  const [medicines, setMedicines] = useState([])
  const { addToCart } = useCart ? useCart() : { addToCart: () => {} }

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMedicines(meds)
    })
    return () => unsub()
  }, [])

  return (
    <Grid container spacing={2} sx={{ my: 4 }}>
      {medicines.map((med) => (
        <Grid item xs={12} sm={6} md={4} key={med.id}>
          <Card elevation={1} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {med.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Dosage: {med.dosage}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Price: ${med.price}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Stock: {med.stock}
              </Typography>
              {addToCart && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => addToCart(med)}
                >
                  Add to Cart
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
