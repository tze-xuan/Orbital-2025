const express = require("express");
const router = express.Router();
const pool = require("../config/db");

//CREATE
router.post("/", async (req, res) => {
  try {
    const { cafeName, cafeLocation } = req.body;
    await pool.query(
      "INSERT INTO cafes (cafeName, cafeLocation) VALUES (?, ?)",
      [cafeName, cafeLocation]
    );
    res.json("Café added");
  } catch (err) {
    console.error(err.message);
  }
});

//GET ALL
router.get("/", async (req, res) => {
  try {
    const cafes = await pool.query("SELECT * FROM cafes");
    res.json(cafes[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//GET
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cafes = await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);
    res.json(cafes);
  } catch (err) {
    console.error(err.message);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM cafes WHERE id = ?", [id]);
    res.json("Café deleted");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
