require("dotenv").config();
const express = require("express");
const app = express();

// API endpoint to save locations
app.post("/api/locations", async (req, res) => {
  try {
    const { name, lat, lng, address } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO locations (name, lat, lng, address) VALUES (?, ?, ?, ?)",
      [name, lat, lng, address]
    );
    res.status(201).json({ id: result.insertId, name, lat, lng, address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save location" });
  }
});

// API endpoint to get locations
app.get("/api/locations", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM locations");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

module.exports = app;
