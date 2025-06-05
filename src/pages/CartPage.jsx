// src/pages/CartPage.jsx

import React, { useEffect, useState } from "react"
import { useCart } from "../contexts/CartContext"
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Alert
} from "@mui/material"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { Add, Remove, Delete } from "@mui/icons-material"

export default function CartPage() {
  const { cartItems, addToCart, removeFromCart } = useCart()
  const [productDetails, setProductDetails]     = useState({})
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState("")

  useEffect(() => {
    async function fetchDetails() {
      console.log("Cart items:", cartItems)

      setLoading(true)
      setError("")
      const details = {}

      try {
        for (const item of cartItems) {
          // Adjust this to match your actual key name:
          const docId = item.drugId 
            ? item.drugId 
            : item.id  // fallback if you store as `id` in CartContext

          if (!docId) {
            console.warn("Skipping cart item with no valid ID:", item)
            continue
          }

          console.log("Fetching product ID:", docId)
          const prodRef = doc(db, "products", docId)
          const snap    = await getDoc(prodRef)

          if (snap.exists()) {
            details[docId] = snap.data()
            console.log("→ Found document:", snap.data())
          } else {
            console.warn("→ No document under products/", docId)
            details[docId] = { name: "(Unknown)", price: item.price }
          }
        }

        setProductDetails(details)
      } catch (err) {
        console.error("Error fetching product details:", err)
        setError("Failed to load cart items. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (cartItems.length > 0) {
      fetchDetails()
    } else {
      setProductDetails({})
      setLoading(false)
    }
  }, [cartItems])

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    // Match the same docId logic:
    const idToUse = item.drugId ? item.drugId : item.id
    const price   = productDetails[idToUse]?.price ?? item.price
    return sum + price * item.quantity
  }, 0)

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Typography variant="body1">Your cart is empty.</Typography>
      ) : (
        <Box>
          <Grid container spacing={2}>
            {cartItems.map((item) => {
              // Same docId logic
              const idToUse = item.drugId ? item.drugId : item.id
              const details = productDetails[idToUse] || {}
              const name    = details.name || "(Unknown Product)"
              const price   = details.price != null ? details.price : item.price

              return (
                <Grid item xs={12} key={idToUse}>
                  <Card sx={{ display: "flex", alignItems: "center" }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD"
                        }).format(price)}{" "}
                        each
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(idToUse)}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{
                            width: 40,
                            mx: 1,
                            textAlign: "center"
                          }}
                          inputProps={{
                            readOnly: true,
                            style: { textAlign: "center" }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            addToCart(idToUse, price, item.category)
                          }
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => removeFromCart(idToUse)}>
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2
            }}
          >
            <Typography variant="h6">Subtotal:</Typography>
            <Typography variant="h6">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(subtotal)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ textTransform: "none" }}
            onClick={() => {
              // Placeholder: replace with real checkout flow
              alert("Proceeding to checkout...")
            }}
          >
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Container>
  )
}
