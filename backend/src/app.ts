import express from "express";
import cafeRoutes from "./routes/index"; //change
import cors from "cors";

const app = express();
app.use(express.json());
app.use("/api", cafeRoutes); //change
app.use(cors()); // Enable all CORS requests

export default app;
