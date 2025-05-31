// src/components/Cart.jsx
import React from 'react'
import { useCart } from '../contexts/CartContext'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Your Cart is Empty</Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
      </Typography>
      <List>
        {cartItems.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => removeFromCart(item)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${item.name} x${item.quantity}`}
              secondary={`$${item.price.toFixed(2)} each`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
