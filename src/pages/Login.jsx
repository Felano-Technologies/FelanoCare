// src/pages/Login.jsx
import React, { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Link,
  useTheme,
  Fade,
  TextField,
  Button,
  styled
} from "@mui/material"

// Corrected imports: one level up from pages → contexts
import { useAuth } from "../contexts/AuthContext"

// Import your two login forms (adjust paths accordingly)
import Auth from "../components/Auth"
import ProfessionalLogin from "../components/ProfessionalLogin"
import ProfessionalSignup from "../components/ProfessionalSignUp"


// Import your logo (ensure it’s at src/assets/logo.png)
const Logo = "/logo.png"  // no import-statement needed—just a URL string
// Styled container with a soft gradient background
const Background = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 20%, ${theme.palette.secondary.light} 80%)`,
  padding: theme.spacing(2),
}))

// Styled Paper (the card) with hover lift effect
const CardContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  boxShadow: theme.shadows[10],
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[15],
  },
}))

// TabPanel with fade animation
function FadeTabPanel({ children, value, index, ...props }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...props}
    >
      {value === index && (
        <Fade in timeout={500}>
          <Box sx={{ pt: 2 }}>{children}</Box>
        </Fade>
      )}
    </div>
  )
}

export default function LoginPage() {
  const theme = useTheme()
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex)
  }

  return (
    <Background>
      <CardContainer elevation={8}>
        {/* Logo Section */}
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            py: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="FelanoCare Logo"
            sx={{
              width: 100,
              height: "auto",
              filter:
                theme.palette.mode === "dark"
                  ? "brightness(0) invert(1)"
                  : "none",
              dropShadow: `0 4px 8px rgba(0,0,0,0.2)`,
            }}
          />
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="Patient vs Professional Login"
          sx={{
            backgroundColor: theme.palette.background.default,
            "& .MuiTab-root": {
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: "none",
            },
            "& .Mui-selected": {
              color: theme.palette.primary.main,
            },
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="Patient" id="login-tab-0" aria-controls="login-tabpanel-0" />
          <Tab
            label="Professional"
            id="login-tab-1"
            aria-controls="login-tabpanel-1"
          />
        </Tabs>

        {/* Patient Login Panel */}
        <FadeTabPanel
          value={tabIndex}
          index={0}
          sx={{
            px: 4,
            py: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              mt: 2,
              "& .MuiTextField-root": {
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  transition: "box-shadow 0.3s",
                  "&:hover fieldset": {
                    boxShadow: `0 0 8px ${theme.palette.primary.main}`,
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
              "& .MuiButton-root": {
                mt: 2,
                textTransform: "none",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            }}
          >
            <Auth />

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                Don’t have an account?{" "}
                  <Link component={RouterLink} to="/signup" underline="hover">
                    Sign up as Patient
                  </Link>

              </Typography>
            </Box>
          </Box>
        </FadeTabPanel>

        {/* Professional Login Panel */}
        <FadeTabPanel
          value={tabIndex}
          index={1}
          sx={{
            px: 4,
            py: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              mt: 2,
              "& .MuiTextField-root": {
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  transition: "box-shadow 0.3s",
                  "&:hover fieldset": {
                    boxShadow: `0 0 8px ${theme.palette.primary.main}`,
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
              "& .MuiButton-root": {
                mt: 2,
                textTransform: "none",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            }}
          >
            <ProfessionalLogin />

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                Don’t have a Professional account?{" "}
                <Link component={RouterLink} to="/pro-signup" underline="hover">
                  Sign up as Professional
                </Link>

              </Typography>
            </Box>
          </Box>
        </FadeTabPanel>
      </CardContainer>
    </Background>
  )
}
