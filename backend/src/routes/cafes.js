require("dotenv").config();
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const { Client } = require("@googlemaps/google-maps-services-js");

// Google Maps client
const mapsClient = new Client({});

// Save cafe and get coordinates
router.post("/", async (req, res) => {
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

    res.status(201).json({
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

// API endpoints
// Get all
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cafes");

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

// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);

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

// Update
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cafeName, cafeLocation } = req.body;
    await pool.query(
      "UPDATE cafes SET cafeName = ?, cafeLocation = ? WHERE id = ?",
      [cafeName, cafeLocation, id]
    );

    // Fetch the updated record to return
    const [updatedCafe] = await pool.query("SELECT * FROM cafes WHERE id = ?", [
      id,
    ]);
    res.json({
      ...updatedCafe[0],
      lat: Number(updatedCafe[0].lat),
      lng: Number(updatedCafe[0].lng),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update café" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM cafes WHERE id = ?", [id]);
    res.json({ success: true, message: "Café deleted" }); // Simplified response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete café" });
  }
});

// //CREATE
// router.post("/", async (req, res) => {
//   try {
//     const { cafeName, cafeLocation } = req.body;
//     await pool.query(
//       "INSERT INTO cafes (cafeName, cafeLocation) VALUES (?, ?)",
//       [cafeName, cafeLocation]
//     );
//     res.json("Café added");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// //GET ALL
// router.get("/", async (req, res) => {
//   try {
//     const cafes = await pool.query("SELECT * FROM cafes");
//     res.json(cafes[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// //GET
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cafes = await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);
//     res.json(cafes);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// //UPDATE
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { cafeName, cafeLocation } = req.body;

//     await pool.query(
//       "UPDATE cafes SET cafeName = ?, cafeLocation = ? WHERE id = ?",
//       [cafeName, cafeLocation, id]
//     );
//     res.json("Café updated");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// //DELETE
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     await pool.query("DELETE FROM cafes WHERE id = ?", [id]);
//     res.json("Café deleted");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
