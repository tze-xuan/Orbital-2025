const mysql = require("mysql2/promise");

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const db = process.env.DB_NAME;
const port = process.env.DB_PORT;

const pool = mysql.createPool({
  user: user,
  password: password,
  host: host,
  port: port,
  database: db,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
});

// Add connection pool event handlers for debugging
pool.on("connection", (connection) => {
  console.log("New connection established as id " + connection.threadId);
});

pool.on("error", (err) => {
  console.error("Database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    // Handle connection lost
    console.log("Database connection lost. Pool will reconnect.");
  }
});

// Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});

module.exports = pool;
