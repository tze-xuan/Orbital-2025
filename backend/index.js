require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const cors = require("cors");
const passport = require("passport");
const app = express();

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
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    name: 'cafeuser-session',
    secret: process.env.SESSION_SECRET,
    resave: false, // won't resave session variable if nothing is changed
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax"
    }
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
