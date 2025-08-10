const passportLocal = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("./db.js");
const LocalStrategy = passportLocal.Strategy;

async function getUserByUsername(username) {
  let connection;
  const normalizedUsername = username.trim().toLowerCase();
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [normalizedUsername]
    );
    connection = await pool.getConnection();
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function getUserById(id) {
  let connection;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    connection = await pool.getConnection();
    return rows[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
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
