require("dotenv").config();
const express = require("express");
const app = express();
const pool = require("../config/db");

const { Client } = require("@googlemaps/google-maps-services-js");

// Google Maps client
const mapsClient = new Client({});

// Save cafe and get coordinates
app.post("/", async (req, res) => {
  try {
    const { cafeName, cafeLocation } = req.body;

    // First geocode the location
    const geocodeResponse = await mapsClient.geocode({
      params: {
        address: cafeLocation,
        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      },
    });

    if (geocodeResponse.data.results.length === 0) {
      console.error("Address not found");
      return res.status(404).json({ error: "Address not found" });
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    if (!lat || !lng) {
      return res.status(404).json({ error: "Coordinates has issue" });
    }

    // Save to database
    const [result] = await pool.execute(
      "INSERT INTO cafes (cafeName, cafeLocation, lat, lng) VALUES (?, ?, ?, ?)",
      [cafeName, cafeLocation, lat, lng]
    );

    res.json({
      cafeName,
      cafeLocation,
      lat,
      lng,
    });
  } catch (error) {
    console.error("Error:", error);
    res.json(error);
  }
});

// API endpoint to get locations
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM cafes");

    // Transform data to ensure correct format
    const formattedCafes = rows.map((cafe) => ({
      ...cafe,
      lat: Number(cafe.lat),
      lng: Number(cafe.lng),
    }));

    res.json(formattedCafes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cafes" });
  }
});

module.exports = app;
