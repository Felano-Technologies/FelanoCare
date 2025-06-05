// src/contexts/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // You can initialize from localStorage, if desired
    // const saved = localStorage.getItem("cartItems")
    // return saved ? JSON.parse(saved) : []
    return []
  })

  // Persist to localStorage whenever cartItems changes (optional):
  useEffect(() => {
    // localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  /**
   * Adds one unit of the given product.
   * If it already exists, increment quantity; otherwise create a new entry.
   *
   * @param {string} drugId
   * @param {number} price
   * @param {string} category
   */
  function addToCart(drugId, price, category) {
    setCartItems((prev) => {
      // Look for an existing entry with this drugId
      const existing = prev.find((item) => item.drugId === drugId)
      if (existing) {
        // Increment its quantity
        return prev.map((item) =>
          item.drugId === drugId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Push a brand‐new object
        return [
          ...prev,
          { drugId, price, category, quantity: 1 }
        ]
      }
    })
  }

  /**
   * Removes one unit of the given product.
   * If quantity > 1, just decrement; otherwise remove the entry entirely.
   *
   * @param {string} drugId
   */
  function removeFromCart(drugId) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.drugId === drugId)
      if (!existing) return prev

      if (existing.quantity > 1) {
        // Decrement quantity
        return prev.map((item) =>
          item.drugId === drugId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        // Remove the entry entirely
        return prev.filter((item) => item.drugId !== drugId)
      }
    })
  }

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
