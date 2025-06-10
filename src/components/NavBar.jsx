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
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material"

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Restaurant as RestaurantIcon,
  Psychology as PsychologyIcon,
  Spa as SpaIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon
} from "@mui/icons-material"

import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

export default function NavBar() {
  const navigate = useNavigate()
  const { userProfile, logout } = useAuth()
  const { cartItems } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const openMenu = Boolean(anchorEl)

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
    
  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: userProfile.role === "professional" ? "/pro/pro-dashboard" : "/patient/dashboard" },
    ...(userProfile.role === "patient" ? [
      { text: "Booking",         icon: <EventIcon />,        path: "/patient/book-consultation" },
      { text: "E-Pharmacy",      icon: <LocalPharmacyIcon />, path: "/patient/epharmacy" },
      { text: "Dietetics",       icon: <RestaurantIcon />,    path: "/patient/dietetics" },
      { text: "Mental Health",   icon: <PsychologyIcon />,    path: "/patient/mental-health" },
      { text: "Herbal Medicine", icon: <SpaIcon />,           path: "/patient/herbal" },
      { text: "AI Assistant",    icon: <ChatIcon />,          path: "/patient/ai" },
    ] : [])
  ]

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.75)",
          color: "#333",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.4rem",
                cursor: "pointer",
                background: "linear-gradient(to right, #4b6cb7, #182848)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
              onClick={() => navigate("/")}
            >
              FelanoCare
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {userProfile.role === "patient" && (
              <IconButton onClick={() => navigate("/cart")} sx={{ position: "relative" }}>
                <Badge badgeContent={totalItems} color="primary" showZero>
                  <ShoppingCartIcon sx={{ color: "#444" }} />
                </Badge>
              </IconButton>
            )}

            <IconButton onClick={handleMenuClick}>
              <Avatar
                src={userProfile.profileImage}
                alt={userProfile.name}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid #ddd",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.05)", borderColor: theme.palette.primary.main }
                }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 160,
                  padding: 1
                }
              }}
            >
              <MenuItem onClick={() => { navigate("/profile"); handleMenuClose() }}>
                Profile
              </MenuItem>
              <MenuItem onClick={logout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {userProfile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userProfile.role}
            </Typography>
          </Box>
          <List>
            {menuItems.map(({ text, icon, path }) => (
              <ListItemButton key={text} onClick={() => { navigate(path); setDrawerOpen(false) }}>
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ color: "error" }} />
          </ListItemButton>
        </Box>
      </Drawer>
    </>
  )
}
