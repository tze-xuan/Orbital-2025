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
  connectionLimit: 5,
  idleTimeout: 10000, // Close idle connections after 10s
  queueLimit: 0, // Unlimited queued requests
});

module.exports = pool;
