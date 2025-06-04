// src/components/DrugSearch.jsx
import React, { useState, useEffect } from "react"
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { db } from "../firebase"
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore"

// Parse the OpenFDA record into our shape
function parseFDARecord(record) {
  const openfda = record.openfda || {}
  return {
    genericName: openfda.generic_name?.[0] || "Unknown",
    brandNames: openfda.brand_name || [],
    manufacturer: openfda.manufacturer_name?.[0] || "Unknown",
    purpose: Array.isArray(record.purpose) ? record.purpose[0] : "N/A",
    dosage: Array.isArray(record.dosage_and_administration)
      ? record.dosage_and_administration[0]
      : "N/A",
    rxcui: openfda.rxcui?.[0] || null
  }
}

export default function DrugSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState("")
  const [existingIds, setExistingIds] = useState(new Set())

  // On mount, load all existing product IDs from Firestore
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const snap = await getDocs(collection(db, "products"))
        const ids = new Set(snap.docs.map(d => d.id))
        setExistingIds(ids)
      } catch (err) {
        console.error("Error loading existing product IDs:", err)
      }
    }
    fetchExisting()
  }, [])

  // Fetch from OpenFDA, parse & filter out existing items
  const handleSearch = async () => {
    setError("")
    setResults([])

    if (!query.trim()) {
      setError("Please enter a drug name to search.")
      return
    }
    setLoading(true)

    try {
      const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(
        query
      )}&limit=10`

      const response = await fetch(url)
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.error?.message || "API error")
      }

      const data = await response.json()
      if (!data.results || data.results.length === 0) {
        setError("No results found.")
        setLoading(false)
        return
      }

      const parsed = data.results.map(r => parseFDARecord(r))

      // Filter out any whose computed docId already exists
      const filtered = parsed.filter(drug => {
        const docId = drug.rxcui
          ? drug.rxcui
          : drug.genericName.replace(/\s+/g, "_").toLowerCase()
        return !existingIds.has(docId)
      })

      if (filtered.length === 0) {
        setError("All matching drugs are already in your E-Pharmacy.")
      }
      setResults(filtered)
    } catch (err) {
      console.error("OpenFDA fetch error:", err)
      setError(err.message || "Failed to fetch drug data.")
    } finally {
      setLoading(false)
    }
  }

  // Add a drug to Firestore “products” collection
  const handleAddProduct = async drug => {
    const docId = drug.rxcui
      ? drug.rxcui
      : drug.genericName.replace(/\s+/g, "_").toLowerCase()
    const prodRef = doc(db, "products", docId)

    try {
      const existing = await getDoc(prodRef)
      if (existing.exists()) {
        alert(`${drug.genericName} is already in products.`)
        return
      }
      await setDoc(prodRef, {
        name:         drug.genericName,
        brandNames:   drug.brandNames,
        manufacturer: drug.manufacturer,
        category:     "prescription",
        purpose:      drug.purpose,
        dosage:       drug.dosage,
        price:        0.0,
        metadata:     { rxcui: drug.rxcui }
      })
      alert(`Added ${drug.genericName} to products.`)

      // Update local existingIds and remove from displayed results
      setExistingIds(prev => {
        const nxt = new Set(prev)
        nxt.add(docId)
        return nxt
      })
      setResults(prev =>
        prev.filter(d => {
          const id = d.rxcui
            ? d.rxcui
            : d.genericName.replace(/\s+/g, "_").toLowerCase()
          return id !== docId
        })
      )
    } catch (err) {
      console.error("Error adding to Firestore:", err)
      alert(`Failed to add ${drug.genericName}: ${err.message}`)
    }
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Search for Drugs (OpenFDA)
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Drug name (e.g. acetaminophen)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? <CircularProgress size={20} /> : "Search"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Accordion list of results */}
      <Grid container direction="column" spacing={1}>
        {results.map((drug, idx) => (
          <Grid item key={idx}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${idx}-content`}
                id={`panel-${idx}-header`}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {drug.genericName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Brand Name:</strong>{" "}
                  {drug.brandNames.length > 0
                    ? drug.brandNames.join(", ")
                    : "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Manufacturer:</strong> {drug.manufacturer}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Purpose:</strong> {drug.purpose}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Dosage:</strong> {drug.dosage}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none" }}
                  onClick={() => handleAddProduct(drug)}
                >
                  Add to Products
                </Button>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
