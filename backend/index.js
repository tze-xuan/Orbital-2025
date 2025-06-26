require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const cors = require("cors");
const passport = require("passport");
const app = express();
import pool from "./src/config/db.js";

const initialize = require("./src/config/passport-config.js");
initialize(passport);

// Middleware must be before routes
app.use(
  cors({
    origin: [
      "https://orbital-5c65d.web.app", // Production
      "http://localhost:3000", // Development
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // won't resave session variable if nothing is changed
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

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

// REVIEW & RATING ROUTE ------
app.post('/reviews', async (req, res) => {
  const { user_id, item_id, rating, comment } = req.body;

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  try {
    const result = await db.query(
      'INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, cafe_id, rating, comment]
    );
    res.status(201).json({message: 'Review submitted'});
  } catch(err) {
    res.status(500).json({error: 'Database error'});
  }
});