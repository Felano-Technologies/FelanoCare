// src/pages/EPharmacyPage.jsx
import React, { useEffect, useState } from "react";
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
  TextField,
  InputAdornment
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";

import { collection, getDocs } from "firebase/firestore";
import { db, functions } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { httpsCallable } from "firebase/functions";

export default function EPharmacyPage() {
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [interactionWarnings, setInteractionWarnings] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const fmtCurrency = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const prodList = snap.docs.map((doc) => ({
          drugId: doc.id,
          ...doc.data(),
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
      .catch((err) => console.error("checkInteractions error:", err))
      .finally(() => setLoadingInteractions(false));
  }, [cartItems]);

  useEffect(() => {
    const prescriptionIds = cartItems
      .filter((item) => item.category === "prescription")
      .map((item) => item.drugId);
    if (!user || prescriptionIds.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoadingRecs(true);
    const getRecommendations = httpsCallable(functions, "getRecommendations");
    getRecommendations({
      userId: user.uid,
      currentPrescriptionIds: prescriptionIds,
    })
      .then((res) => {
        setRecommendations(res.data.recommendations || []);
      })
      .catch((err) => console.error("getRecommendations error:", err))
      .finally(() => setLoadingRecs(false));
  }, [user, cartItems]);

  const filteredProducts = allProducts.filter((prod) =>
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🧴 E-Pharmacy Store
      </Typography>

      {/* Search Box */}
      <Box sx={{ my: 3, maxWidth: 500, mx: "auto" }}>
        <TextField
          fullWidth
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Box>

      {/* Products */}
      <Box mt={4}>
        {loadingProducts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Loader2 className="animate-spin" />
          </Box>
        ) : loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : filteredProducts.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No medicines found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((prod) => {
              const inCart = cartItems.some((item) => item.drugId === prod.drugId);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={prod.drugId}>
                  <Card
                    elevation={1}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    {prod.imageUrl && (
                      <Box
                        component="img"
                        src={prod.imageUrl}
                        alt={prod.name}
                        sx={{ width: "100%", height: 160, objectFit: "cover" }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" noWrap>
                        {prod.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {prod.category}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {fmtCurrency(prod.price)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {inCart ? (
                        <Button
                          color="error"
                          onClick={() => removeFromCart(prod.drugId)}
                          startIcon={<MinusCircle />}
                          fullWidth
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() =>
                            addToCart(prod.drugId, prod.price, prod.category)
                          }
                          startIcon={<PlusCircle />}
                          fullWidth
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
      </Box>

      {/* Interaction Warnings */}
      {interactionWarnings.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <AlertTriangle size={20} />
            <Typography variant="h6">Interaction Warnings</Typography>
          </Box>

          {loadingInteractions ? (
            <CircularProgress size={20} />
          ) : (
            interactionWarnings.map((w, idx) => (
              <Alert
                key={idx}
                severity={w.severity >= 4 ? "error" : "warning"}
                sx={{ mb: 2 }}
              >
                {`${w.drugA} + ${w.drugB} — ${w.message}`}
              </Alert>
            ))
          )}
        </Box>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckCircle2 size={20} />
            <Typography variant="h6">Recommended For You</Typography>
          </Box>

          <Grid container spacing={2}>
            {recommendations.map((rec) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={rec.drugId}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="h6">{rec.name}</Typography>
                    <Typography color="text.secondary">{rec.reason}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
