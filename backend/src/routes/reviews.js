const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// REVIEW & RATING ROUTE ------
// Submit review
app.post('/reviews', async (req, res) => {
  const { user_id, cafe_id, rating, comment } = req.body;

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, cafe_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, cafe_id, rating, comment]
    );
    res.status(201).json({message: 'Review submitted'});
  } catch(err) {
    res.status(500).json({error: 'Database error'});
  }
});

// Get reviews
app.get('/:cafe_id/reviews', async(req, res) => {
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

    const avgRating = await db.query(
      'SELECT AVG(rating) AS average FROM reviews WHERE cafe_id = ?'
      [cafe_id]
    );

    res.json({
      averageRating: avgRating[0].average || 0,
      reviews
    });

  } catch (err) {
    res.status(500).json({error: 'Database error'});
  }
})