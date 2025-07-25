// server.js - Updated with proper shutdown handling
require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const methodOverride = require("method-override");
const cors = require("cors");
const passport = require("passport");
const { pool } = require("./src/config/db"); // Import the pool for cleanup

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const initialize = require("./src/config/passport-config.js");
initialize(passport);

// Middleware must be before routes
app.use(
  cors({
    origin: [
      "https://cafechronicles.vercel.app", // Production
      "https://orbital-5c65d.web.app", // Production
      "http://localhost:3000", // Development
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

// Create session store with better connection management
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  // Reduce session store connections
  reconnect: true,
  idleTimeout: 10000,
  acquireTimeout: 10000,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      domain: isProduction ? "cafechronicles.vercel.app" : undefined,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    },
    proxy: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// Routes
app.use("/api/cafes", require("./src/routes/cafes"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/locations", require("./src/routes/map"));
app.use("/api/bookmarks", require("./src/routes/bookmarks"));
app.use("/api/reviews", require("./src/routes/reviews"));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  // Handle specific database errors
  if (error.code === "ER_USER_LIMIT_REACHED") {
    res.status(503).json({
      error:
        "Database temporarily unavailable. Please try again in a few seconds.",
    });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Database config:", {
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    db: process.env.DB_NAME,
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Stop accepting new requests
  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      // Close database connections
      await pool.end();
      console.log("Database connections closed.");

      // Close session store
      if (sessionStore && typeof sessionStore.close === "function") {
        await sessionStore.close();
        console.log("Session store closed.");
      }

      console.log("Graceful shutdown completed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
