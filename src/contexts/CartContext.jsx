// src/contexts/CartContext.jsx
import React, { createContext, useContext, useReducer } from 'react'

const CartContext = createContext()

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already in cart
      const exists = state.find((i) => i.id === action.payload.id)
      if (exists) {
        // Increment quantity
        return state.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      // Add new item
      return [...state, { ...action.payload, quantity: 1 }]
    }
    case 'REMOVE_ITEM': {
      return state.filter((i) => i.id !== action.payload.id)
    }
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cartItems, dispatch] = useReducer(cartReducer, [])

  const addToCart = (item) => dispatch({ type: 'ADD_ITEM', payload: item })
  const removeFromCart = (item) => dispatch({ type: 'REMOVE_ITEM', payload: item })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
