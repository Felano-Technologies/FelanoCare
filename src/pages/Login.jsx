// src/pages/Login.jsx
import React, { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Box, Tabs, Tab, Fade, Typography, Link, useTheme, styled
} from "@mui/material"

import Auth from "../components/Auth"
import ProfessionalLogin from "../components/ProfessionalLogin"

const Logo = "/logo.png"

const Background = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(120deg, #e0f7fa 0%, #ffffff 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
}))

const GlassCard = styled(Box)(({ theme }) => ({
  maxWidth: 500,
  width: "100%",
  borderRadius: "20px",
  backdropFilter: "blur(14px)",
  background: "rgba(255, 255, 255, 0.7)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  overflow: "hidden",
}))

const LogoHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4, 2, 2),
}))

const FadeTabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Fade in timeout={500}>
        <Box sx={{ p: 4 }}>{children}</Box>
      </Fade>
    )}
  </div>
)

export default function LoginPage() {
  const [tabIndex, setTabIndex] = useState(0)
  const theme = useTheme()

  return (
    <Background>
      <GlassCard>
        <LogoHeader>
          <img src={Logo} alt="FelanoCare" style={{ width: 80 }} />
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 500, color: "#333" }}>
            Your Health, Powered by AI
          </Typography>
        </LogoHeader>

        <Tabs
          value={tabIndex}
          onChange={(e, i) => setTabIndex(i)}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 1,
            },
          }}
        >
          <Tab label="Patient" />
          <Tab label="Professional" />
        </Tabs>

        <FadeTabPanel value={tabIndex} index={0}>
          <Auth />
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don’t have an account?{" "}
            <Link component={RouterLink} to="/signup" underline="hover">
              Sign up as Patient
            </Link>
          </Typography>
        </FadeTabPanel>

        <FadeTabPanel value={tabIndex} index={1}>
          <ProfessionalLogin />
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Not registered yet?{" "}
            <Link component={RouterLink} to="/pro-signup" underline="hover">
              Sign up as Professional
            </Link>
          </Typography>
        </FadeTabPanel>
      </GlassCard>
    </Background>
  )
}
