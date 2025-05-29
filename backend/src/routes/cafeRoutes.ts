import { Router, Request, Response } from "express";
import pool from "../config/db";

const router: Router = Router();

//CREATE
router.post(
  "/cafes",
  async (
    req: Request<{ cafeName: string; cafeLocation: string }>,
    res: Response
  ) => {
    try {
      const { cafeName, cafeLocation } = req.body;
      console.log(`${req.body} added`);
      if (!cafeName || !cafeLocation) {
        res.json({ error: "Name and Location are required" });
      }

      await pool.query("INSERT INTO cafes (name, Location) VALUES (?, ?)", [
        cafeName,
        cafeLocation,
      ]);

      res.json("Café added");
    } catch (err) {
      console.error(err.message);
    }
  }
);

//GET ALL
router.get("/cafes", async (req: Request, res: Response) => {
  try {
    const [cafes] = await pool.query("SELECT * FROM cafes");
    res.json(cafes[0]); //get idx 0 to not display buffering stuff
  } catch (err) {
    console.error(err.message);
  }
});

//GET ONE
router.get(
  "/cafes/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const cafes = await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);
      res.json(cafes);
    } catch (err) {
      console.error(err.message);
    }
  }
);

//UPDATE
router.put(
  "/cafes/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const { cafeName, cafeLocation } = req.body;

      await pool.query(
        "UPDATE cafes SET cafeName = ?, cafeLocation = ? WHERE id = ?",
        [cafeName, cafeLocation, id]
      );
      res.json("Café was updated");
    } catch (err) {
      console.error(err.message);
    }
  }
);

//DELETE
router.delete(
  "/cafes/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;

      await pool.query("DELETE FROM cafes WHERE id = ?", [id]);

      res.json("Café was deleted");
    } catch (err) {
      console.error(err.message);
    }
  }
);

export default router;
