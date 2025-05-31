// src/components/NavBar.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"    // <-- Import useAuth
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
  Box
} from "@mui/material"

import MenuIcon           from "@mui/icons-material/Menu"
import HomeIcon           from "@mui/icons-material/Home"
import EventIcon          from "@mui/icons-material/Event"
import LocalPharmacyIcon  from "@mui/icons-material/LocalPharmacy"
import RestaurantIcon     from "@mui/icons-material/Restaurant"
import PsychologyIcon     from "@mui/icons-material/Psychology"
import SpaIcon            from "@mui/icons-material/Spa"
import ChatIcon           from "@mui/icons-material/Chat"
import DashboardIcon      from "@mui/icons-material/Dashboard"  // Optional: dashboard icon

export default function NavBar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { userProfile } = useAuth()

  // If userProfile is not yet loaded, we can return null or a minimal AppBar.
  // But usually useAuth loading is handled in App.jsx, so userProfile should exist here.
  if (!userProfile) {
    return null
  }

  // Build menu items based on role
  const MENU_ITEMS = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: userProfile.role === "professional" ? "/pro-dashboard" : "/patient-dashboard"
    },
    ...(userProfile.role === "patient"
      ? [
          { text: "Book Consult",  icon: <EventIcon />,         path: "/book-consultation" },
          { text: "E-Pharmacy",    icon: <LocalPharmacyIcon />,  path: "/epharmacy" },
          { text: "Dietetics",     icon: <RestaurantIcon />,     path: "/dietetics" },
          { text: "Mental Health", icon: <PsychologyIcon />,     path: "/mental-health" },
          { text: "Herbal Medicine", icon: <SpaIcon />,          path: "/herbal" },
          { text: "AI Assistant",  icon: <ChatIcon />,           path: "/ai" }
        ]
      : [
          // If “professional”, show only professional‐related items
          { text: "Manage Availability", icon: <EventIcon />, path: "/pro-dashboard" }
        ]
    )
  ]

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FelanoCare
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpen(false)}
          onKeyDown={() => setOpen(false)}
        >
          <List>
            {MENU_ITEMS.map(({ text, icon, path }) => (
              <ListItemButton key={text} onClick={() => navigate(path)}>
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
