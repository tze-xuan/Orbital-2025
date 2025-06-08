require("dotenv").config();

// DEBUGGING
console.log({
  dbUser: process.env.DB_USERNAME,
  dbHost: process.env.DB_HOST,
  hasPassword: !!process.env.DB_PASSWORD, // Should show 'true'
});

// MAIN APP IMPORTS
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://your-frontend.vercel.app",
  })
);
const pool = require("./src/config/db");

// MIDDLEWARE
app.use(cors());
app.use(express.json()); //req.body

//connect to frontend
app.get("/getData", (req, res) => {
  res.send("");
});

//ROUTES//

// CAFE ROUTES ---------
//CREATE
app.post("/cafes", async (req, res) => {
  try {
    const { cafeName, cafeLocation } = req.body;
    console.log(req.body);
    const newCafe = await pool.query(
      "INSERT INTO  (cafeName, cafeLocation) VALUES (?, ?)",
      [cafeName, cafeLocation]
    );
    res.json("Café added");
  } catch (err) {
    console.error(err.message);
  }
});

//GET ALL
app.get("/cafes", async (req, res) => {
  try {
    const cafes = await pool.query("SELECT * FROM cafes");
    res.json(cafes[0]); //get idx 0 to not display buffering stuff
  } catch (err) {
    console.error(err.message);
  }
});

//GET
app.get("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cafes = await pool.query("SELECT * FROM cafes WHERE id = ?", [id]);
    res.json(cafes[0]); //get idx 0 to not display buffering stuff
  } catch (err) {
    console.error(err.message);
  }
});

//UPDATE
app.put("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cafeName, cafeLocation } = req.body;

    const updateCafe = await pool.query(
      "UPDATE cafes SET cafeName = ?, cafeLocation = ? WHERE id = ?",
      [cafeName, cafeLocation, id]
    );
    res.json("Café was updated");
  } catch (err) {
    console.error(err.message);
  }
});

//DELETE
app.delete("/cafes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteCafe = await pool.query("DELETE FROM cafes WHERE id = ?", [id]);
    res.json("Café was deleted");
  } catch (err) {
    console.error(err.message);
  }
});

// LOGIN ROUTE
// ---------
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // won't resave session variable if nothing is changed
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport(
  passport,
  async (username) => await getUserByUsername(username)
);

// Routes
app.post("/login", passport.authenticate("local"), async (req, res) => {
  try {
    res.json({
      message: "Logged in successfully",
      user: {
        username: req.body.username,
        password: req.body.password,
      },
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.json("All fields are required");
    }

    // Check if user exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.json("Username already exists");
    }

    // Create new user
    const userId = await createUser(username, password);

    // Auto-login after registration
    req.login({ id: userId }, (err) => {
      if (err) {
        return res.json(err);
      }
      res.json({
        message: "Registration and login successful",
      });
    });
  } catch (error) {
    res.json(error);
  }
});

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.json({
        success: false,
        message: "Logout failed",
      });
    }

    // Destroy session if using sessions
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Could not destroy session",
        });
      }
    });
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

// //GET USER BY USERNAME
// app.get("/login/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const users = await pool.query("SELECT * FROM users WHERE username = ?", [
//       username,
//     ]);
//     if (users[0].length == 0) {
//       res.json("USER NOT FOUND");
//     } else {
//       res.json(users[0]);
//     } //get idx 0 to not display buffering stuff}
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// // CHANGE PASSWORD
// app.put("/login/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { email, password } = req.body;

//     const updateUsers = await pool.query(
//       "UPDATE users SET password = ? WHERE username = ?",
//       [email, password, username]
//     );
//     if (!updateUsers.affectedRows) {
//       res.json("USER NOT FOUND");
//     }
//     res.json("User was updated");
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// //DELETE USER ACCOUNT
// app.delete("/login/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const deleteUsers = await pool.query(
//       "DELETE FROM users WHERE username = ?",
//       [username]
//     );

//     if (!deleteUsers.affectedRows) {
//       res.json("USER NOT FOUND");
//     }
//     res.json("User was deleted");
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// HELPER FUNCTIONS
//GET ALL (DEBUGGING)
app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users[0]); //get idx 0 to not display buffering stuff
  } catch (err) {
    console.error(err.message);
  }
});

async function getUserByUsername(username) {
  const normalizedUsername = username.toLowerCase().trim();
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      normalizedUsername,
    ]);
    return rows[0] || null;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createUser(username, password) {
  // const hashedPassword = await hashedPassword(password);
  const [result] = await pool.query(
    "INSERT INTO users (username, password) VALUES (?,?)",
    [username, password]
  );
  return result;
}

function initializePassport(passport, getUserByUsername) {
  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.username)); // Store only username in session

  // Deserialize user from session
  passport.deserializeUser(async (username, done) => {
    try {
      const user = await getUserByUsername(username);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Local authentication strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          // Input validation
          if (!username || !password) {
            return done(null, false, {
              message: "Username and password are required",
            });
          }

          // Get user by username
          const user = await getUserByUsername(username);

          // Check if user exists
          if (!user) {
            return done(null, false, {
              message: "No user found with that username",
            });
          }

          // Compare passwords
          if (await bcrypt.compare(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password Incorrect" });
          }
        } catch (err) {
          console.log(err);
          return done(err);
        }
      }
    )
  );
}

app.listen(5002, () => {
  console.log("Server is running on port 5002");
});
