const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};


// REVIEW & RATING ROUTE ------
// Submit review
app.post('/submit', isAuthenticated, async (req, res) => {
  const { cafe_id, rating, comment, avgPricePerPax } = req.body; 
  const user_id = req.user.id;

  // Validate all fields exist
  if (![cafe_id, rating, comment, avgPricePerPax].every(Boolean)) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  try {
    await pool.query(
      'INSERT INTO reviews (user_id, cafe_id, rating, comment, avgPricePerPax) VALUES (?, ?, ?, ?, ?)',
      [user_id, cafe_id, rating, comment, avgPricePerPax]
    );
    res.status(201).json({message: 'Review submitted'});
  } catch(err) {
    res.status(500).json({error: 'Database error'});
  }
});

// Get reviews
app.get('/:cafe_id', async(req, res) => {
  const cafe_id = req.params.cafe_id;

  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.username
      FROM reviews r
      JOIN users u on r.user_id = u.id
      WHERE cafe_id = ?
      ORDER BY created_at DESC`,
      [cafe_id]
    );

    const [avgResult] = await pool.query(
      `SELECT 
         AVG(rating) AS averageRating,
         MIN(avgPricePerPax) AS minPrice,
         MAX(avgPricePerPax) AS maxPrice,
         AVG(avgPricePerPax) AS avgPrice
       FROM reviews 
       WHERE cafe_id = ?`,
      [cafe_id]
    );
    
    const { averageRating, minPrice, maxPrice, avgPrice } = avgResult[0];
    
    res.json({
      averageRating: averageRating || 0,
      priceRange: minPrice && maxPrice ? 
        { min: minPrice, max: maxPrice } : null,
      avgPrice: avgPrice || null,
      reviews
    });

  } catch (err) {
    res.status(500).json({error: 'Database error'});
  }
})