require('dotenv').config();
const express = require('express');
const pool = require("../config/db");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}

// API Endpoints

// Get all cafes from database
app.get('/cafes', async (req, res) => {
  try {
    const [cafes] = await pool.query('SELECT * FROM cafes');
    res.json(cafes);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    res.status(500).json({ message: 'Error fetching cafes' });
  }
});

// Get nearby cafes (within 500 meters)
app.post('/cafes/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Get all cafes
    const [cafes] = await pool.query('SELECT * FROM cafes');
    
    // Calculate distance for each cafe
    const nearbyCafes = cafes.map(cafe => {
      const distance = calculateDistance(
        lat, lng,
        cafe.latitude, cafe.longitude
      );
      return { ...cafe, distance };
    })
    .filter(cafe => cafe.distance < 500) // Within 500 meters
    .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyCafes);
  } catch (error) {
    console.error('Error fetching nearby cafes:', error);
    res.status(500).json({ message: 'Error fetching nearby cafes' });
  }
});

// Claim a stamp
app.post('/stamps/claim', async (req, res) => {
  try {
    const { userId, cafeId, lat, lng } = req.body;
    
    // Get cafe location
    const [cafes] = await pool.query(
      'SELECT latitude, longitude FROM cafes WHERE id = ?',
      [cafeId]
    );
    
    if (cafes.length === 0) {
      return res.status(404).json({ message: 'Cafe not found' });
    }
    
    const cafe = cafes[0];
    
    // Verify user location
    const distance = calculateDistance(
      lat, lng,
      cafe.latitude, cafe.longitude
    );
    
    if (distance > 100) { // 100 meter threshold
      return res.status(400).json({ message: 'Too far from cafe location' });
    }
    
    // Check if user already has stamp today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [existing] = await pool.query(
      `SELECT id FROM stamps 
       WHERE user_id = ? AND cafe_id = ? AND created_at >= ?`,
      [userId, cafeId, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already claimed stamp today' });
    }
    
    // Create new stamp
    await pool.query(
      'INSERT INTO stamps (user_id, cafe_id) VALUES (?, ?)',
      [userId, cafeId]
    );
    
    // Get updated stamp count
    const [stamps] = await pool.query(
      'SELECT COUNT(*) AS count FROM stamps WHERE user_id = ?',
      [userId]
    );
    
    res.json({ 
      success: true, 
      stampCount: stamps[0].count 
    });
  } catch (error) {
    console.error('Error claiming stamp:', error);
    res.status(500).json({ message: 'Error claiming stamp' });
  }
});

// Get user stamps
app.get('/users/:userId/stamps', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [stamps] = await pool.query(
      `SELECT s.id, s.created_at, c.name AS cafe_name, c.address 
       FROM stamps s
       JOIN cafes c ON s.cafe_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    
    res.json(stamps);
  } catch (error) {
    console.error('Error fetching user stamps:', error);
    res.status(500).json({ message: 'Error fetching stamps' });
  }
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
