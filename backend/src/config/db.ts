import { createPool } from "mysql2/promise";
import { DB_PORT, DB, PASSWORD } from "./env";

const pool = createPool({
  user: "root",
  password: PASSWORD,
  host: "localhost",
  port: DB_PORT,
  database: DB,
});

export default pool;
