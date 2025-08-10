require("dotenv").config();
const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
}

// Calculate distance using Google Maps Distance Matrix API
async function calculateDistanceWithGoogleMaps(origins, destinations) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origins,
          destinations: destinations,
          units: "metric",
          mode: "walking", // or 'driving', 'transit', 'bicycling'
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (
      response.data.status === "OK" &&
      response.data.rows[0].elements[0].status === "OK"
    ) {
      return {
        distance: response.data.rows[0].elements[0].distance.value, // in meters
        duration: response.data.rows[0].elements[0].duration.value, // in seconds
        distanceText: response.data.rows[0].elements[0].distance.text,
        durationText: response.data.rows[0].elements[0].duration.text,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Maps API error:", error);
    return null;
  }
}

// Batch calculate distances for multiple cafes using Google Maps
async function batchCalculateDistances(userLat, userLng, cafes) {
  try {
    const origins = `${userLat},${userLng}`;
    const destinations = cafes
      .map((cafe) => `${cafe.lat},${cafe.lng}`)
      .join("|");

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origins,
          destinations: destinations,
          units: "metric",
          mode: "walking",
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === "OK") {
      return response.data.rows[0].elements.map((element, index) => ({
        ...cafes[index],
        distance: element.status === "OK" ? element.distance.value : null,
        duration: element.status === "OK" ? element.duration.value : null,
        distanceText: element.status === "OK" ? element.distance.text : null,
        durationText: element.status === "OK" ? element.duration.text : null,
        fallbackDistance: calculateDistance(
          userLat,
          userLng,
          cafes[index].lat,
          cafes[index].lng
        ),
      }));
    }

    // Fallback to Haversine if Google Maps fails
    return cafes.map((cafe) => ({
      ...cafe,
      distance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
      fallbackDistance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
    }));
  } catch (error) {
    console.error("Batch distance calculation error:", error);
    // Fallback to Haversine formula
    return cafes.map((cafe) => ({
      ...cafe,
      distance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
      fallbackDistance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
    }));
  }
}
// Calculate distance using Google Maps Distance Matrix API
async function calculateDistanceWithGoogleMaps(origins, destinations) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origins,
          destinations: destinations,
          units: "metric",
          mode: "walking", // or 'driving', 'transit', 'bicycling'
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (
      response.data.status === "OK" &&
      response.data.rows[0].elements[0].status === "OK"
    ) {
      return {
        distance: response.data.rows[0].elements[0].distance.value, // in meters
        duration: response.data.rows[0].elements[0].duration.value, // in seconds
        distanceText: response.data.rows[0].elements[0].distance.text,
        durationText: response.data.rows[0].elements[0].duration.text,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Maps API error:", error);
    return null;
  }
}

// Batch calculate distances for multiple cafes using Google Maps
async function batchCalculateDistances(userLat, userLng, cafes) {
  try {
    const origins = `${userLat},${userLng}`;
    const destinations = cafes
      .map((cafe) => `${cafe.lat},${cafe.lng}`)
      .join("|");

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origins,
          destinations: destinations,
          units: "metric",
          mode: "walking",
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === "OK") {
      return response.data.rows[0].elements.map((element, index) => ({
        ...cafes[index],
        distance: element.status === "OK" ? element.distance.value : null,
        duration: element.status === "OK" ? element.duration.value : null,
        distanceText: element.status === "OK" ? element.distance.text : null,
        durationText: element.status === "OK" ? element.duration.text : null,
        fallbackDistance: calculateDistance(
          userLat,
          userLng,
          cafes[index].latitude,
          cafes[index].longitude
        ),
      }));
    }

    // Fallback to Haversine if Google Maps fails
    return cafes.map((cafe) => ({
      ...cafe,
      distance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
      fallbackDistance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
    }));
  } catch (error) {
    console.error("Batch distance calculation error:", error);
    // Fallback to Haversine formula
    return cafes.map((cafe) => ({
      ...cafe,
      distance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
      fallbackDistance: calculateDistance(userLat, userLng, cafe.lat, cafe.lng),
    }));
  }
}

// Get all cafes from database
router.get("/cafes", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [cafes] = await connection.execute("SELECT * FROM cafes");
    res.json(cafes);
  } catch (error) {
    console.error("Error fetching cafes:", error);
    res.status(500).json({ message: "Error fetching cafes" });
  } finally {
    if (connection) connection.release();
  }
});

// Get nearby cafes (within 500 meters)
router.post("/cafes/nearby", async (req, res) => {
  let connection;
  try {
    const { lat, lng, radius = 500, useGoogleMaps = false } = req.body;
    connection = await pool.getConnection();

    // Get all cafes
    const [cafes] = await connection.execute("SELECT * FROM cafes");

    let nearbyCafes;

    // Calculate distance for each cafe
    if (useGoogleMaps && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      // Use Google Maps for more accurate distances
      const cafesWithDistance = await batchCalculateDistances(lat, lng, cafes);
      nearbyCafes = cafesWithDistance
        .filter((cafe) => cafe.distance && cafe.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    } else {
      // Use Haversine formula (faster, no API calls)
      nearbyCafes = cafes
        .map((cafe) => {
          const distance = calculateDistance(lat, lng, cafe.lat, cafe.lng);
          return { ...cafe, distance, fallbackDistance: distance };
        })
        .filter((cafe) => cafe.distance < radius) // Within 500 meters
        .sort((a, b) => a.distance - b.distance);
    }
    if (useGoogleMaps && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      // Use Google Maps for more accurate distances
      const cafesWithDistance = await batchCalculateDistances(lat, lng, cafes);
      nearbyCafes = cafesWithDistance
        .filter((cafe) => cafe.distance && cafe.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    } else {
      // Use Haversine formula (faster, no API calls)
      nearbyCafes = cafes
        .map((cafe) => {
          const distance = calculateDistance(lat, lng, cafe.lat, cafe.lng);
          return { ...cafe, distance, fallbackDistance: distance };
        })
        .filter((cafe) => cafe.distance < radius) // Within 500 meters
        .sort((a, b) => a.distance - b.distance);
    }
    res.json(nearbyCafes);
  } catch (error) {
    console.error("Error fetching nearby cafes:", error);
    res.status(500).json({ message: "Error fetching nearby cafes" });
  } finally {
    if (connection) connection.release();
  }
});

// Claim a stamp
router.post("/stamps/claim", async (req, res) => {
  let connection;
  try {
    const { userId, cafeId, lat, lng, useGoogleMaps = false } = req.body;
    connection = await pool.getConnection();

    // Get cafe location
    const [cafes] = await connection.execute(
      "SELECT lat, lng, name FROM cafes WHERE id = ?",
      [cafeId]
    );

    if (cafes.length === 0) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const cafe = cafes[0];
    let distance;
    let verificationMethod = "haversine";

    // Verify user location
    if (useGoogleMaps && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      const googleDistance = await calculateDistanceWithGoogleMaps(
        `${lat},${lng}`,
        `${cafe.lat},${cafe.lng}`
      );

      if (googleDistance) {
        distance = googleDistance.distance;
        verificationMethod = "google_maps";
      } else {
        // Fallback to Haversine
        distance = calculateDistance(lat, lng, cafe.lat, cafe.lng);
      }
    } else {
      distance = calculateDistance(lat, lng, cafe.lat, cafe.lng);
    }

    const threshold = 100; // 100 meter threshold
    if (distance > threshold) {
      return res.status(400).json({
        message: `Too far from cafe location. Distance: ${Math.round(
          distance
        )}m (max: ${threshold}m)`,
        distance: Math.round(distance),
        threshold: threshold,
        verificationMethod: verificationMethod,
      });
    }

    const [existing] = await connection.execute(
      `SELECT id FROM stamps 
       WHERE user_id = ? AND cafe_id = ?`,
      [userId, cafeId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "You've already collected a stamp from this cafe",
        code: "ALREADY_CLAIMED_FROM_CAFE",
        firstClaimed: existing[0].created_at,
      });
    }

    // Create new stamp
    await connection.beginTransaction();
    try {
      await connection.execute("INSERT INTO stamps (user_id, cafe_id) VALUES (?, ?)", [
        userId,
        cafeId,
      ]);
      await connection.commit();
    } catch (error) {
        await connection.rollback();
          throw error;
    }

    // Get updated stamp count
    const [stamps] = await connection.execute(
      "SELECT COUNT(*) AS count FROM stamps WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      stampCount: stamps[0].count,
      distance: Math.round(distance),
      cafeName: cafe.name,
      verificationMethod: verificationMethod,
    });
  } catch (error) {
    console.error("Error claiming stamp:", error);
    res.status(500).json({ message: "Error claiming stamp" });
  } finally {
    if (connection) connection.release();
  }
});

// Get user stamps
router.get("/users/:userId/stamps", async (req, res) => {
  let connection;
  try {
    const userId = req.params.userId;
    connection = await pool.getConnection();

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid user ID provided",
      });
    }

    const [stamps] = await connection.execute(
      `SELECT s.*, c.name AS cafe_name, c.address 
       FROM stamps s
       JOIN cafes c ON s.cafe_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [parseInt(userId)]
    );

    // Handle empty results
    if (stamps.length === 0) {
      return res.status(404).json({ message: "No stamps found" });
    }

    res.json(stamps);

  } catch (error) {
    console.error("Error fetching user stamps:", error);
    res.status(500).json({ message: "Error fetching stamps" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
