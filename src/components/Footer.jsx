// src/components/Footer.jsx
import React from "react"
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material"

export default function Footer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
        position: isMobile ? "static" : "sticky",
        bottom: 0,
        width: "100%",
        mt: 4,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} FelanoCare. All rights reserved.
      </Typography>
    </Box>
  )
}
