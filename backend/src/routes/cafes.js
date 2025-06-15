const express = require("express");
const router = express.Router();
const pool = require("../config/db");

//CREATE
router.post("/cafes", async (req, res) => {
  try {
    const { cafeName, cafeLocation } = req.body;
    await pool.query("INSERT INTO  (cafeName, cafeLocation) VALUES (?, ?)", [
      cafeName,
      cafeLocation,
    ]);
    res.json("Café added");
  } catch (err) {
    console.error(err.message);
  }
});

//GET ALL
router.get("/cafes", async (req, res) => {
  try {
    await pool.query("SELECT * FROM cafes");
    res.json("Café(s) found");
  } catch (err) {
    console.error(err.message);
  }
});

//GET
router.get("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);
    res.json("Café found");
  } catch (err) {
    console.error(err.message);
  }
});

//UPDATE
router.put("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cafeName, cafeLocation } = req.body;

    await pool.query(
      "UPDATE cafes SET cafeName = ?, cafeLocation = ? WHERE id = ?",
      [cafeName, cafeLocation, id]
    );
    res.json("Café updated");
  } catch (err) {
    console.error(err.message);
  }
});

//DELETE
router.delete("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM cafes WHERE id = ?", [id]);
    res.json("Café deleted");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
