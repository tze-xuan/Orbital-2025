const mysql = require("mysql2/promise");

const password = process.env.PASSWORD;
const db = process.env.DB;
const port = process.env.DB_PORT;

const pool = mysql.createPool({
  user: "root",
  password: password,
  host: "localhost",
  port: port,
  database: db,
});

module.exports = pool;
