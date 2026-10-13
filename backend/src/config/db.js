
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

function getSslConfig() {
  // For Render: use the Base64-encoded Aiven CA certificate.
  if (process.env.DB_SSL_CA_BASE64) {
    return {
      ca: Buffer.from(
        process.env.DB_SSL_CA_BASE64,
        'base64'
      ).toString('utf8'),
      rejectUnauthorized: true
    };
  }

  // For local testing with a CA certificate file.
  if (process.env.DB_SSL_CA) {
    const caPath = process.env.DB_SSL_CA;
    const ca = fs.existsSync(caPath)
      ? fs.readFileSync(caPath, 'utf8')
      : caPath.replace(/\\n/g, '\n');

    return {
      ca,
      rejectUnauthorized: true
    };
  }

  // Local MySQL can use the existing local configuration.
  return undefined;
}

const ssl = getSslConfig();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ...(ssl ? { ssl } : {})
});
