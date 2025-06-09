import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Medication,
  Event,
  TipsAndUpdates,
  Healing,
  Favorite,
} from "@mui/icons-material";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [tips, setTips] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!currentUser?.uid) return;

    const apptQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", currentUser.uid)
    );
    const unsubscribeAppt = onSnapshot(apptQuery, (snapshot) => {
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const medQuery = query(
      collection(db, "medications"),
      where("userId", "==", currentUser.uid)
    );
    const unsubscribeMed = onSnapshot(medQuery, (snapshot) => {
      setMedications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const tipsQuery = collection(db, "doctorTips");
    const unsubscribeTips = onSnapshot(tipsQuery, (snapshot) => {
      setTips(snapshot.docs.map((doc) => doc.data()));
    });

    return () => {
      unsubscribeAppt();
      unsubscribeMed();
      unsubscribeTips();
    };
  }, [currentUser]);

  const appointmentStats = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const formatted = day.toLocaleDateString("en-US", { weekday: "short" });
    const count = appointments.filter((appt) =>
      new Date(appt.date).toDateString() === day.toDateString()
    ).length;
    return { day: formatted, count };
  }).reverse();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Welcome, {currentUser?.displayName || "Patient"}
      </Typography>

      <Grid container spacing={3}>
        {/* Appointments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              {appointments.length > 0 ? (
                <List dense>
                  {appointments.slice(0, 5).map((appt) => (
                    <React.Fragment key={appt.id}>
                      <ListItem>
                        <Avatar sx={{ bgcolor: "#56666B", mr: 2 }}>
                          <Event />
                        </Avatar>
                        <ListItemText
                          primary={appt.doctorName}
                          secondary={new Date(appt.date).toLocaleString()}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>No upcoming appointments.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Medications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medication Reminders
              </Typography>
              {medications.length > 0 ? (
                <List dense>
                  {medications.slice(0, 5).map((med) => (
                    <React.Fragment key={med.id}>
                      <ListItem>
                        <Avatar sx={{ bgcolor: "#D97706", mr: 2 }}>
                          <Medication />
                        </Avatar>
                        <ListItemText
                          primary={med.name}
                          secondary={`Dosage: ${med.dosage}, Time: ${med.time}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>No current medications.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Visualization */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Appointment Stats
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={appointmentStats}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#56666B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Doctor's Tips */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Doctor's Tips
              </Typography>
              <List dense>
                {tips.length > 0 ? (
                  tips.slice(0, 5).map((tip, idx) => (
                    <ListItem key={idx}>
                      <Avatar sx={{ bgcolor: "#10B981", mr: 2 }}>
                        <TipsAndUpdates />
                      </Avatar>
                      <ListItemText primary={tip.title} secondary={tip.description} />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No tips available.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDashboard;
