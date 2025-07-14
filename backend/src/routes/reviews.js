const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const cors = require('cors');
app.use(cors());

const authenticate = (req, res, next) => {
  if (!req.user) { // Assuming you have authentication setup
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// REVIEW & RATING ROUTE ------
// Submit review
app.post('/reviews', async (req, res) => {
  const { username, cafeName, rating, comment } = req.body;

  // Validate input
  if (!cafeName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (username, cafeName, rating, comment) VALUES (?, ?, ?, ?)',
      [username, cafeName, rating, comment]
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