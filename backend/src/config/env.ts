import dotenv from "dotenv";
dotenv.config();

if (!process.env.DB_PORT) {
  throw new Error("Missing environment variables");
}

export const HOST_PORT = parseInt(process.env.HOST_PORT || "5002");
export const DB_PORT = parseInt(process.env.DB_PORT);
export const PASSWORD = process.env.PASSWORD as string;
export const DB = process.env.DB as string;
