const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const session = require("express-session");
require("dotenv").config();

// Create router
const router = express.Router();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  next();
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({
      success: true,
      data: { username: result.username },
    });
  } catch (error) {
    const status = error.code === "ER_DUP_ENTRY" ? 409 : 400;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.json({
        success: false,
        message: "Username & password are required",
      });
    }

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (!users.length) {
      res.json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    req.session.userId = user.id;
    res.json({
      success: true,
      data: { username: user.username },
      message: "Logged in successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({
        success: false,
        message: "Logout failed",
      });
    }
    res.clearCookie("connect.sid");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

module.exports = router;
