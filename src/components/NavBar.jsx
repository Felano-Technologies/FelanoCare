// src/components/NavBar.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Badge
} from "@mui/material"

import MenuIcon             from "@mui/icons-material/Menu"
import HomeIcon             from "@mui/icons-material/Home"
import EventIcon            from "@mui/icons-material/Event"
import LocalPharmacyIcon    from "@mui/icons-material/LocalPharmacy"
import RestaurantIcon       from "@mui/icons-material/Restaurant"
import PsychologyIcon       from "@mui/icons-material/Psychology"
import SpaIcon              from "@mui/icons-material/Spa"
import ChatIcon             from "@mui/icons-material/Chat"
import ShoppingCartIcon     from "@mui/icons-material/ShoppingCart"

import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

export default function NavBar() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { cartItems }   = useCart()
  const [open, setOpen] = useState(false)

  // Build menu items based on role (if any)
  const MENU_ITEMS = [
    {
      text: "Dashboard",
      icon: <HomeIcon />,
      path: userProfile.role === "professional" ? "/pro-dashboard" : "/patient-dashboard"
    },
    // Only show patient‐only pages if role = "patient"
    ...(userProfile.role === "patient"
      ? [
          { text: "Booking",         icon: <EventIcon />,        path: "/booking" },
          { text: "E-Pharmacy",      icon: <LocalPharmacyIcon />, path: "/epharmacy" },
          { text: "Dietetics",       icon: <RestaurantIcon />,    path: "/dietetics" },
          { text: "Mental Health",   icon: <PsychologyIcon />,    path: "/mental-health" },
          { text: "Herbal Medicine", icon: <SpaIcon />,           path: "/herbal" },
          { text: "AI Assistant",    icon: <ChatIcon />,          path: "/ai" }
        ]
      : [])
  ]

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Hamburger menu */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Cart Icon (navigates to /cart) */}
          {userProfile.role === "patient" && (
            <IconButton
              size="large"
              color="inherit"
              aria-label="cart items"
              onClick={() => navigate("/cart")}
            >
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <List>
            {MENU_ITEMS.map(({ text, icon, path }) => (
              <ListItemButton
                key={text}
                onClick={() => navigate(path)}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
