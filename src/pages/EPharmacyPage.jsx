// src/pages/EPharmacyPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Paper
} from "@mui/material";
import { functions, db, generativeModel } from "../firebase"; // added generativeModel
import { httpsCallable } from "firebase/functions";
import { collection, getDocs } from "firebase/firestore";
import DrugSearch from "../components/DrugSearch";
import { getAge, getAgeCategory } from "../utils/age"; // added for AI prompt

export default function EPharmacyPage() {
  const { user, userProfile } = useAuth(); // added userProfile
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [interactionWarnings, setInteractionWarnings] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // AI assistant state:
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Determine age category for AI prompt:
  const birthDate = userProfile?.birthDate || null;
  const ageCat = birthDate
    ? getAgeCategory(getAge(birthDate))
    : "adult";

  const systemPrompts = {
    youth:  "Suggest easy-to-take medicines for teens.",
    adult:  "Provide prescription-level medicine advice for adults.",
    senior: "Recommend gentle medicines suited for seniors."
  };
  const systemPrompt = systemPrompts[ageCat] || systemPrompts.adult;

  //  AI assistant handler:
  const handleGenerateAI = async () => {
    setAiError("");
    setAiResponse("");

    if (!aiInput.trim()) {
      setAiError("Please enter a question or concern for medicine advice.");
      return;
    }

    setAiLoading(true);
    try {
      const fullPrompt = `
${systemPrompt}

User’s query: ${aiInput.trim()}

Please provide clear, age-appropriate guidance on medicines, including typical dosage forms, key safety tips, and any common cautions.
`;
      const result = await generativeModel.generateContent(fullPrompt);
      const text = result.response.text();
      setAiResponse(text);
    } catch (err) {
      console.error("Gemini generateContent error:", err);
      setAiError(err.message || "Failed to get AI advice.");
    } finally {
      setAiLoading(false);
    }
  };

  // 1) Fetch all products from Firestore on mount
  useEffect(() => {
    setLoadingProducts(true);
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const prodList = snap.docs.map((doc) => ({
          drugId: doc.id,
          ...doc.data()
        }));
        setAllProducts(prodList);
      } catch (err) {
        console.error("Error loading products:", err);
        setLoadError("Could not load products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // 2) Interaction Checker (unchanged)
  useEffect(() => {
    const prescriptionIds = cartItems
      .filter((item) => item.category === "prescription")
      .map((item) => item.drugId);
    if (prescriptionIds.length < 2) {
      setInteractionWarnings([]);
      return;
    }
    setLoadingInteractions(true);
    const checkInteractions = httpsCallable(functions, "checkInteractions");
    checkInteractions({ prescriptionIds })
      .then((res) => {
        setInteractionWarnings(res.data.warnings || []);
      })
      .catch((err) => {
        console.error("checkInteractions error:", err);
      })
      .finally(() => {
        setLoadingInteractions(false);
      });
  }, [cartItems]);

  // 3) Recommendations (unchanged)
  useEffect(() => {
    const prescriptionIds = cartItems
      .filter((item) => item.category === "prescription")
      .map((item) => item.drugId);
    if (!user || prescriptionIds.length === 0) {
      setRecommendations([]);
      return;
    }
    setLoadingRecs(true);
    const getRecommendations = httpsCallable(
      functions,
      "getRecommendations"
    );
    getRecommendations({
      userId: user.uid,
      currentPrescriptionIds: prescriptionIds
    })
      .then((res) => {
        setRecommendations(res.data.recommendations || []);
      })
      .catch((err) => {
        console.error("getRecommendations error:", err);
      })
      .finally(() => {
        setLoadingRecs(false);
      });
  }, [user, cartItems]);

  const fmtCurrency = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(n);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        E-Pharmacy
      </Typography>

      {/* ==== AI Medicine Advisor ==== */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          AI Medicine Advisor
        </Typography>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateAI();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}
        >
          <TextField
            label="Ask about medicines"
            placeholder="e.g. What’s a suitable pain reliever for a senior?"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            required
          />

          <Button
            type="submit"
            variant="contained"
            disabled={aiLoading}
            sx={{ alignSelf: "flex-start", textTransform: "none" }}
          >
            {aiLoading ? <CircularProgress size={20} /> : "Get Advice"}
          </Button>
        </Box>

        {aiError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {aiError}
          </Typography>
        )}

        {aiResponse && (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              whiteSpace: "pre-wrap",
              backgroundColor: "background.paper",
              maxHeight: "40vh",
              overflowY: "auto"
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              AI Response:
            </Typography>
            <Typography variant="body1">{aiResponse}</Typography>
          </Paper>
        )}
      </Paper>

      {/* ==== HERE’S THE DRUG SEARCH ==== */}
      <DrugSearch />

      {/* ==== THEN YOUR EXISTING PRODUCTS GRID ==== */}
      {loadingProducts ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error">{loadError}</Alert>
      ) : allProducts.length === 0 ? (
        <Typography color="textSecondary">
          (No products in Firestore “products” collection.)
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {allProducts.map((prod) => {
            const inCart = cartItems.some(
              (item) => item.drugId === prod.drugId
            );
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={prod.drugId}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6">{prod.name}</Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      {prod.category.charAt(0).toUpperCase() +
                        prod.category.slice(1)}
                    </Typography>
                    <Typography variant="subtitle1">
                      {fmtCurrency(prod.price)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {inCart ? (
                      <Button
                        color="error"
                        onClick={() => removeFromCart(prod.drugId)}
                        sx={{ textTransform: "none" }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() =>
                          addToCart(prod.drugId, prod.price, prod.category)
                        }
                        sx={{ textTransform: "none" }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ==== INTERACTION WARNINGS ==== */}
      {(loadingInteractions || interactionWarnings.length > 0) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Interaction Checker
          </Typography>
          {loadingInteractions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : interactionWarnings.length === 0 ? (
            <Alert severity="success">No known interactions detected.</Alert>
          ) : (
            interactionWarnings.map((w, idx) => (
              <Alert
                key={`${w.drugA}_${w.drugB}_${idx}`}
                severity={w.severity >= 4 ? "error" : "warning"}
                sx={{ mb: 2 }}
              >
                <AlertTitle>
                  {w.severity >= 4 ? "High-Risk Interaction" : "Interaction"}
                </AlertTitle>
                {`“${w.drugA}” interacts with “${w.drugB}”: ${w.message}`}
              </Alert>
            ))
          )}
        </Box>
      )}

      {/* ==== RECOMMENDATIONS ==== */}
      {(loadingRecs || recommendations.length > 0) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            You Might Also Need
          </Typography>
          {loadingRecs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : recommendations.length === 0 ? (
            <Typography color="textSecondary">
              No recommendations at this time.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {recommendations.map((rec) => (
                <Grid item xs={12} sm={6} md={4} key={rec.drugId}>
                  <Card elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{rec.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {rec.reason}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 1, textTransform: "none" }}
                      onClick={() =>
                        addToCart(rec.drugId, rec.price || 0, rec.category || "otc")
                      }
                    >
                      Add to Cart
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
}
