const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const isAuthenticated = (req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  
  if (req.isAuthenticated()) {
    console.log('User authenticated via passport');
    return next();
  }
  
  if (req.session?.passport?.user) {
    console.log('User authenticated via session data');
    req.user = { id: req.session.passport.user };
    return next();
  }
  
  console.warn('Unauthorized access attempt');
  res.status(401).json({ error: 'Unauthorized' });
};

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// REVIEW & RATING ROUTE ------
// Submit review
router.post('/submit', isAuthenticated, async (req, res) => {
  const { cafe_id, rating, avgPricePerPax } = req.body; 
  const comment = req.body.comment || null;
  const user_id = req.user.id;

  // Validate required fields
  if (!cafe_id || !rating || avgPricePerPax === undefined) {
    return res.status(400).json({ error: 'Cafe ID, rating and price are required' });
  }

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  // Validate price
  if (isNaN(avgPricePerPax) || avgPricePerPax < 0) {
    return res.status(400).json({ error: 'Invalid price value' });
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
router.get('/:cafe_id', async(req, res) => {
  const cafe_id = req.params.cafe_id;

  if (!cafe_id || isNaN(cafe_id)) {
    return res.status(400).json({ error: 'Invalid cafe ID' });
  }
  
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

module.exports = router;