require("dotenv").config();
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
  next();
});

// Get all bookmarks for a specific user
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT b.*, c.cafeName, c.cafeLocation, c.lat, c.lng 
       FROM bookmarks b 
       JOIN cafes c ON b.cafe_id = c.id 
       WHERE b.user_id = ?
       ORDER BY b.bookmarked_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// Add a bookmark
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { user_id, cafe_id } = req.body;

    // Check if bookmark already exists
    const [existing] = await pool.execute(
      "SELECT * FROM bookmarks WHERE user_id = ? AND cafe_id = ?",
      [user_id, cafe_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Bookmark already exists" });
    }

    // Add bookmark
    await pool.execute(
      "INSERT INTO bookmarks (user_id, cafe_id) VALUES (?, ?)",
      [user_id, cafe_id]
    );

    res.status(201).json({ message: "Bookmark added successfully" });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

// Remove a bookmark
router.delete(
  "/user/:userId/cafe/:cafeId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { userId, cafeId } = req.params;

      const [result] = await pool.execute(
        "DELETE FROM bookmarks WHERE user_id = ? AND cafe_id = ?",
        [userId, cafeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Bookmark not found" });
      }

      res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  }
);

// Get all bookmarks (admin view)
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, c.cafeName, c.cafeLocation 
       FROM bookmarks b 
       JOIN cafes c ON b.cafe_id = c.id 
       ORDER BY b.bookmarked_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching all bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

module.exports = router;
