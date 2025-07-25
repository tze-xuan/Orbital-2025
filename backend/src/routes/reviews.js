const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const isAuthenticated = (req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);

  if (req.isAuthenticated()) {
    console.log("User authenticated via passport");
    return next();
  }

  if (req.session?.passport?.user) {
    console.log("User authenticated via session data");
    req.user = { id: req.session.passport.user };
    return next();
  }

  console.warn("Unauthorized access attempt");
  res.status(401).json({ error: "Unauthorized" });
};

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// REVIEW & RATING ROUTE ------
// Submit review
router.post("/submit", isAuthenticated, async (req, res) => {
  const { cafe_id, rating, avgPricePerPax } = req.body;
  const comment = req.body.comment || null;
  const user_id = req.user.id;
  let connection;

  if (!cafe_id || !rating || avgPricePerPax === undefined) {
    return res
      .status(400)
      .json({ error: "Cafe ID, rating and price are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Invalid rating" });
  }

  if (isNaN(avgPricePerPax) || avgPricePerPax < 0) {
    return res.status(400).json({ error: "Invalid price value" });
  }

  try {
    connection = await pool.getConnection();
    await connection.execute(
      "INSERT INTO reviews (user_id, cafe_id, rating, comment, avgPricePerPax) VALUES (?, ?, ?, ?, ?)",
      [user_id, cafe_id, rating, comment, avgPricePerPax]
    );
    res.status(201).json({ message: "Review submitted" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) connection.release();
  }
});

// Get reviews
router.get(["/", "/:cafe_id"], async (req, res) => {
  const cafe_id = parseInt(req.params.cafe_id || req.query.cafe_id);
  let connection;

  try {
    connection = await pool.getConnection();
    const [reviews] = await connection.execute(
      `SELECT r.*, u.username
      FROM reviews r
      JOIN users u on r.user_id = u.id
      WHERE cafe_id = ?
      ORDER BY created_at DESC`,
      [cafe_id]
    );

    const [avgResult] = await connection.execute(
      `SELECT 
         AVG(rating) AS averageRating,
         MIN(avgPricePerPax) AS minPrice,
         MAX(avgPricePerPax) AS maxPrice,
         AVG(avgPricePerPax) AS avgPrice
       FROM reviews 
       WHERE cafe_id = ?`,
      [cafe_id]
    );

    const hasReviews =
      avgResult.length > 0 && avgResult[0].averageRating !== null;

    const averageRating = hasReviews
      ? parseFloat(avgResult[0].averageRating)
      : 0;
    const minPrice = hasReviews ? parseFloat(avgResult[0].minPrice) : null;
    const maxPrice = hasReviews ? parseFloat(avgResult[0].maxPrice) : null;
    const avgPrice = hasReviews ? parseFloat(avgResult[0].avgPrice) : null;

    res.json({
      averageRating: averageRating || 0,
      priceRange:
        minPrice && maxPrice ? { min: minPrice, max: maxPrice } : null,
      avgPrice: avgPrice || null,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) connection.release();
  }
});

// Edit reviews
router.put("/:id", isAuthenticated, async (req, res) => {
  let connection;
  try {
    const { comment } = req.body;
    const reviewId = req.params.id;
    connection = await pool.getConnection();

    const [review] = await connection.execute(
      "SELECT * FROM reviews WHERE id = ?",
      [reviewId]
    );
    if (!review.length)
      return res.status(404).json({ error: "Review not found" });
    if (review[0].user_id !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await connection.execute("UPDATE reviews SET comment = ? WHERE id = ?", [
      comment,
      reviewId,
    ]);

    const [updatedReview] = await connection.execute(
      `SELECT r.*, u.username 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reviewId]
    );

    res.json(updatedReview[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) connection.release();
  }
});

// Delete reviews
router.delete("/:id", isAuthenticated, async (req, res) => {
  let connection;
  try {
    const reviewId = req.params.id;
    connection = await pool.getConnection();

    const [review] = await connection.execute(
      "SELECT * FROM reviews WHERE id = ?",
      [reviewId]
    );
    if (!review.length)
      return res.status(404).json({ error: "Review not found" });
    if (review[0].user_id !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await connection.execute("DELETE FROM reviews WHERE id = ?", [reviewId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
