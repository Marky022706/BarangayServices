import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'barangay_eservices_db';

export const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+08:00', // Philippine Standard Time
  dateStrings: true
});

export default pool;
