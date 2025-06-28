const passportLocal = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("./db.js");
const LocalStrategy = passportLocal.Strategy;

async function getUserByUsername(username) {
  const normalizedUsername = username.toLowerCase().trim();
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      normalizedUsername,
    ]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

function initialize(passport) {
  const authenticateUsers = async (username, password, done) => {
    // get users by username
    try {
      const user = await getUserByUsername(username);

      if (!user) {
        return done(null, false, {
          message: "No user found with that username",
        });
      }

      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      }
      return done(null, false, { message: "Password Incorrect" });
    } catch (e) {
      console.log(e);
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUsers)
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
