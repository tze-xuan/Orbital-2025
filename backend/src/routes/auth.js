const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const passport = require("passport");
const bcrypt = require("bcrypt");

// (2) LOGIN ROUTE ------
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      req.session.save((err) => {
        if (err) return next(err);

        res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username },
        });
      });
    });
  })(req, res, next);
});

// (3) SIGNUP ROUTE ------
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const normalisedUsername = username.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [normalisedUsername, hashedPassword]
    );

    const newUserId = result.insertId;
    res.json({
      message: "Signup successful",
      userId: newUserId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  } finally {
    if (connection) connection.release();
  }
});

// (4) CHECK-USERNAME ROUTE ------
router.get("/check-username", async (req, res) => {
  const { username } = req.query;

  if (typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username format" });
  }

  const normalisedUsername = username.trim().toLowerCase();
  let connection;

  try {
    connection = await pool.getConnection();
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [normalisedUsername]
    );

    res.json({ available: users.length === 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

// (5) LOGOUT ROUTE ------
router.post("/logout", (req, res) => {
  console.log("Logging out user:", req.user?.username || "unknown");

  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Session cleanup failed" });
      }

      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ message: "Logout successful" });
    });
  });
});

// (6) USER ROUTE ------
// GET ALL USERS
router.get("/users", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute("SELECT * FROM users");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (connection) connection.release();
  }
});

//GET USER BY USERNAME
router.get("/users/:username", async (req, res) => {
  let connection;
  try {
    const { username } = req.params;
    connection = await pool.getConnection();
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (!users.length) {
      res.status(404).json("USER NOT FOUND");
    } else {
      res.json(users[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

//UPDATE USER DETAILS
router.put("/users/:username", async (req, res) => {
  let connection;
  try {
    const { username } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection = await pool.getConnection();
    const [updateUsers] = await connection.execute(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, username]
    );
    if (!updateUsers.affectedRows) {
      res.status(404).json("USER NOT FOUND");
    } else {
      res.json("User was updated");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

//DELETE USER ACCOUNT
router.delete("/users/:username", async (req, res) => {
  let connection;
  try {
    const { username } = req.params;
    connection = await pool.getConnection();
    const [deleteUsers] = await connection.execute(
      "DELETE FROM users WHERE username = ?",
      [username]
    );

    if (!deleteUsers.affectedRows) {
      return res.status(404).json("USER NOT FOUND");
    }
    res.json("User was deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Getting user ID
router.get("/me", (req, res) => {
  console.log("Getting current user from session");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Is authenticated:", req.isAuthenticated());

  if (req.isAuthenticated() && req.user) {
    console.log("Returning authenticated user:", req.user);
    res.json({ id: req.user.id, ...req.user });
  } else if (req.session?.passport?.user) {
    console.log("Returning user from session:", req.session.passport.user);
    res.json({ id: req.session.passport.user });
  } else {
    console.log("No authenticated user found");
    res.status(401).json({ error: "Not authenticated" });
  }
});

module.exports = router;
