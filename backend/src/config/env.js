import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const PORT = Number(process.env.PORT) || 5000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = Number(process.env.DB_PORT) || 3306;
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "medilink";
export const JWT_SECRET = process.env.JWT_SECRET || "medilink_secret_jwt_key_2026";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
