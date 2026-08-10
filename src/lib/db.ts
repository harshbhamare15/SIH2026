import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionUri = process.env.DATABASE_URL;

    if (connectionUri) {
      pool = mysql.createPool({
        uri: connectionUri,
        waitForConnections: true,
        connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
        queueLimit: 0,
      });
    } else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
        queueLimit: 0,
      });
    } else {
      throw new Error(
        'Database configuration is missing. Please configure DATABASE_URL in your .env / .env.local file.'
      );
    }
  }
  return pool;
}

let dbInitialized = false;

export async function ensureTablesExist(): Promise<void> {
  if (dbInitialized) return;

  const db = getPool();
  
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      mobile VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      orgType VARCHAR(100) NOT NULL,
      orgName VARCHAR(255) NOT NULL,
      pan VARCHAR(20) NOT NULL,
      gst VARCHAR(30) NULL,
      address1 VARCHAR(255) NOT NULL,
      address2 VARCHAR(255) NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      district VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL,
      address TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createAdminTableQuery = `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      mobile VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await db.query(createUsersTableQuery);
  await db.query(createAdminTableQuery);
  dbInitialized = true;
}
