require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware must be before routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Health check route - must come BEFORE mounting the auth router
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// Routes
app.use("/api/cafes", require("./src/routes/cafes"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/locations", require("./src/routes/map"));

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Database config:", {
    dbUser: process.env.DB_USERNAME,
    dbHost: process.env.DB_HOST,
    db: process.env.DB_NAME,
  });
});
