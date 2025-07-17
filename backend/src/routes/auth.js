const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const passport = require("passport");
const bcrypt = require("bcrypt");
const session = require("express-session");

// (2) LOGIN ROUTE ------
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.json({
        message: "Login successful",
        user: { id: user.id, username: user.username },
      });

    });
  })(req, res, next);
});

// (3) SIGNUP ROUTE ------
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Trim username
  const normalisedUsername = username.trim().toLowerCase();
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Insert new user
    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [normalisedUsername, hashedPassword]
    );

    // Retrieve newly created user ID
    const newUserId = result.insertId;

    // 4. Success
    res.json({
      message: "Signup successful",
      userId: newUserId,
    });
  } catch (err) {
    console.error(err);
    res.json({ message: "Server error during signup" });
  }
});

// routes only accessible when not logged in (login/signup)
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/"); // redirect logged in users away
  }
  next(); // User is not authenticated - proceed to login/signup page
}

// (4) CHECK-USERNAME ROUTE ------
router.get("/check-username", async (req, res) => {
  const { username } = req.query;

  // Validate input
  if (typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username format" });
  }

  // Normalize username
  const normalisedUsername = username.trim().toLowerCase();

  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [normalisedUsername]
    );

    res.json({ available: users.length === 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// (5) LOGOUT ROUTE ------
router.post("/logout", (req, res) => { 
  const handleLogout = () => {
    req.logout((err) => {
      // Proceed to session destruction even if logout fails
      destroySession(req, res);
    });
  };

  // Handle session destruction
  const destroySession = (req, res) => {
    req.session.destroy((err) => {
      clearSessionCookie(res);
      
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }

      res.status(200).json({ message: "Logged out successfully" });
    });
  };

  // Clear client-side cookie
  const clearSessionCookie = (res) => {
    res.clearCookie("connect.sid", {
      domain: process.env.NODE_ENV === 'production'
      ? 'cafechronicles.vercel.app' 
      : 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0)
    });
  };

  // Check authentication state before attempting logout
  if (req.isAuthenticated()) {
    handleLogout();
  } else {
    // If not authenticated, still clear residual session data
    destroySession(req, res);
  }
});

// // routes that require authentication (profile/homepage)
// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     // isAuthenticated == whether user logged in
//     return next(); // user authenticated, proceeds to protected route
//   }
//   // User is not authenticated - redirect to login with a flash message
//   req.flash("error", "Please log in to access this page");
//   req.session.returnTo = req.originalUrl;
//   return res.redirect("/login");
// }

// (6) USER ROUTE ------
// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//GET USER BY USERNAME
router.get("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const users = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!users.length) {
      res.json("USER NOT FOUND");
    } else {
      res.json(users[0]);
    } //get idx 0 to not display buffering stuff}
  } catch (err) {
    console.error(err.message);
  }
});

//UPDATE USER DETAILS
router.put("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const updateUsers = await pool.query(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, username]
    );
    if (!updateUsers.affectedRows) {
      res.json("USER NOT FOUND");
    }
    res.json("User was updated");
  } catch (err) {
    console.error(err.message);
  }
});

//DELETE USER ACCOUNT
router.delete("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const [deleteUsers] = await pool.query(
      "DELETE FROM users WHERE username = ?",
      [username]
    );

    if (!deleteUsers.affectedRows) {
      return res.json("USER NOT FOUND");
    }
    res.json("User was deleted");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
