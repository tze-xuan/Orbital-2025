require("dotenv").config();
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const { Client } = require("@googlemaps/google-maps-services-js");

// Google Maps client
const mapsClient = new Client({});

// Save cafe and get coordinates
router.post("/", async (req, res) => {
  let connection;
  try {
    const { cafeName, cafeLocation } = req.body;
    connection = await pool.getConnection();

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
    await connection.execute(
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
    res.status(500).json(error);
  } finally {
    if (connection) connection.release();
  }
});

// API endpoints
// Get all
router.get("/", async (req, res) => {
  let connection;
  try {
    // Set no-cache headers
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    connection = await pool.getConnection();
    const [rows] = await pool.execute(`
      SELECT 
        id,
        cafeName,
        cafeLocation,  
        lat,
        lng 
      FROM cafes
    `);

    // Transform data to ensure correct format
    const formattedCafes = rows.map((cafe) => ({
      ...cafe,
      lat: Number(cafe.lat),
      lng: Number(cafe.lng),
    }));

    console.log("Returning cafes from DB:", formattedCafes); // Debug log
    res.json(formattedCafes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  } finally {
    if (connection) connection.release();
  }
});

// Get by ID
router.get("/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM cafes WHERE id = ?",
      [id]
    );

    const formattedCafes = rows.map((cafe) => ({
      ...cafe,
      lat: Number(cafe.lat),
      lng: Number(cafe.lng),
    }));

    res.json(formattedCafes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cafes" });
  } finally {
    if (connection) connection.release();
  }
});

// Update
router.put("/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { cafeName, cafeLocation } = req.body;
    connection = await pool.getConnection();

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

    await connection.execute(
      "UPDATE cafes SET cafeName = ?, cafeLocation = ?, lat = ?, lng = ? WHERE id = ?",
      [cafeName, cafeLocation, lat, lng, id]
    );

    // Fetch the updated record to return
    const [updatedCafe] = await connection.execute(
      "SELECT * FROM cafes WHERE id = ?",
      [id]
    );
    res.json({
      ...updatedCafe[0],
      lat: Number(updatedCafe[0].lat),
      lng: Number(updatedCafe[0].lng),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update café" });
  } finally {
    if (connection) connection.release();
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.execute("DELETE FROM cafes WHERE id = ?", [id]);
    res.json({ success: true, message: "Café deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete café" });
  } finally {
    if (connection) connection.release();
  }
});

// //CREATE
// router.post("/", async (req, res) => {
//   try {
//     const { cafeName, cafeLocation } = req.body;
//     await pool.execute(
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
//     const cafes = await pool.execute("SELECT * FROM cafes");
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
//     const cafes = await pool.execute("SELECT * FROM cafes WHERE id = ?", [id]);
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

//     await pool.execute(
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

//     await pool.execute("DELETE FROM cafes WHERE id = ?", [id]);
//     res.json("Café deleted");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
