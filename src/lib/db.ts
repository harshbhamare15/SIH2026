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
      role VARCHAR(50) NOT NULL DEFAULT 'contractor',
      walletAddress VARCHAR(255) NULL,
      deviceFingerprint VARCHAR(255) NULL,
      orgType VARCHAR(100) NOT NULL,
      orgName VARCHAR(255) NOT NULL,
      pan VARCHAR(20) NOT NULL,
      gst VARCHAR(30) NULL,
      experience VARCHAR(100) NULL,
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

  const createTendersTableQuery = `
    CREATE TABLE IF NOT EXISTS tenders (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      client VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      value VARCHAR(100) NOT NULL,
      closingDate VARCHAR(100) NOT NULL,
      expectedDuration VARCHAR(100) NULL DEFAULT '6 Months',
      matchType VARCHAR(50) NOT NULL DEFAULT 'High Match',
      status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
      winnerApplicantId VARCHAR(100) NULL,
      winnerName VARCHAR(255) NULL,
      winnerOrg VARCHAR(255) NULL,
      winnerAmount VARCHAR(100) NULL,
      awardedAt TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createApplicationsTableQuery = `
    CREATE TABLE IF NOT EXISTS tender_applications (
      id VARCHAR(100) PRIMARY KEY,
      tenderId VARCHAR(100) NOT NULL,
      userId INT NULL,
      applicantName VARCHAR(255) NOT NULL,
      applicantEmail VARCHAR(255) NOT NULL,
      applicantBlindIndex VARCHAR(64) NULL,
      encryptedPayload LONGTEXT NOT NULL,
      iv VARCHAR(64) NOT NULL,
      authTag VARCHAR(64) NOT NULL,
      dbKeyShare VARCHAR(128) NOT NULL,
      bidHash VARCHAR(128) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'SEALED',
      submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unsealedAt TIMESTAMP NULL,
      INDEX idx_app_tender (tenderId),
      INDEX idx_app_status (status),
      INDEX idx_app_blind (applicantBlindIndex)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createNetworkVaultTableQuery = `
    CREATE TABLE IF NOT EXISTS axiom_network_vault (
      id INT AUTO_INCREMENT PRIMARY KEY,
      applicationId VARCHAR(100) NOT NULL UNIQUE,
      tenderId VARCHAR(100) NOT NULL,
      networkKeyShare VARCHAR(128) NOT NULL,
      vaultIv VARCHAR(64) NULL,
      vaultAuthTag VARCHAR(64) NULL,
      timelockExpiry VARCHAR(100) NOT NULL,
      vaultStatus ENUM('LOCKED_IN_NETWORK', 'RELEASED_FOR_DECRYPTION') NOT NULL DEFAULT 'LOCKED_IN_NETWORK',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      released_at TIMESTAMP NULL,
      INDEX idx_nv_app (applicationId),
      INDEX idx_nv_tender (tenderId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createAuctionsTableQuery = `
    CREATE TABLE IF NOT EXISTS auctions (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      client VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      startingValue VARCHAR(100) NOT NULL,
      lowestBid DOUBLE NOT NULL DEFAULT 0,
      duration VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Live',
      type VARCHAR(50) NOT NULL DEFAULT 'sub',
      category VARCHAR(100) NULL DEFAULT 'General',
      mode VARCHAR(50) NOT NULL DEFAULT 'Standard',
      tenderRef VARCHAR(100) NULL,
      winnerApplicantId VARCHAR(100) NULL,
      winnerName VARCHAR(255) NULL,
      winnerOrg VARCHAR(255) NULL,
      winnerAmount VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createAuctionBidsTableQuery = `
    CREATE TABLE IF NOT EXISTS auction_bids (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auctionId VARCHAR(100) NOT NULL,
      bidderId VARCHAR(100) NULL,
      bidderName VARCHAR(255) NOT NULL,
      bidderOrg VARCHAR(255) NULL,
      bidAmount DOUBLE NOT NULL,
      bidHash VARCHAR(128) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ab_auction (auctionId),
      INDEX idx_ab_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await db.query(createUsersTableQuery);
  await db.query(createAdminTableQuery);
  await db.query(createTendersTableQuery);
  await db.query(createApplicationsTableQuery);
  await db.query(createNetworkVaultTableQuery);
  await db.query(createAuctionsTableQuery);
  await db.query(createAuctionBidsTableQuery);

  // Safe migrations for tender_applications table
  try {
    await db.query('ALTER TABLE tender_applications MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT "SEALED"');
    const [blindCols] = await db.query<any[]>('SHOW COLUMNS FROM tender_applications LIKE "applicantBlindIndex"');
    if (!blindCols || blindCols.length === 0) {
      await db.query('ALTER TABLE tender_applications ADD COLUMN applicantBlindIndex VARCHAR(64) NULL, ADD INDEX idx_app_blind (applicantBlindIndex)');
    }
  } catch (e) {
    console.error('Column migration error in tender_applications:', e);
  }

  // Safe migrations for axiom_network_vault table
  try {
    const [ivCols] = await db.query<any[]>('SHOW COLUMNS FROM axiom_network_vault LIKE "vaultIv"');
    if (!ivCols || ivCols.length === 0) {
      await db.query('ALTER TABLE axiom_network_vault ADD COLUMN vaultIv VARCHAR(64) NULL, ADD COLUMN vaultAuthTag VARCHAR(64) NULL');
    }
  } catch (e) {
    console.error('Column migration error in axiom_network_vault:', e);
  }

  // Safe migrations for tenders table

  // Safe migrations for tenders table
  try {
    const [statusCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "status"');
    if (!statusCols || statusCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT "OPEN"');
    }
    const [winnerAppCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "winnerApplicantId"');
    if (!winnerAppCols || winnerAppCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN winnerApplicantId VARCHAR(100) NULL');
    }
    const [winnerNameCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "winnerName"');
    if (!winnerNameCols || winnerNameCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN winnerName VARCHAR(255) NULL');
    }
    const [winnerOrgCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "winnerOrg"');
    if (!winnerOrgCols || winnerOrgCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN winnerOrg VARCHAR(255) NULL');
    }
    const [winnerAmtCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "winnerAmount"');
    if (!winnerAmtCols || winnerAmtCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN winnerAmount VARCHAR(100) NULL');
    }
    const [awardedAtCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "awardedAt"');
    if (!awardedAtCols || awardedAtCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN awardedAt TIMESTAMP NULL');
    }
    const [durCols] = await db.query<any[]>('SHOW COLUMNS FROM tenders LIKE "expectedDuration"');
    if (!durCols || durCols.length === 0) {
      await db.query('ALTER TABLE tenders ADD COLUMN expectedDuration VARCHAR(100) NULL DEFAULT "6 Months"');
    }
  } catch (e) {
    console.error('Column migration error in tenders:', e);
  }

  // Safe migration for existing users table
  try {
    const [cols] = await db.query<any[]>('SHOW COLUMNS FROM users LIKE "role"');
    if (!cols || cols.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT "contractor"');
    }
    const [walletCols] = await db.query<any[]>('SHOW COLUMNS FROM users LIKE "walletAddress"');
    if (!walletCols || walletCols.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN walletAddress VARCHAR(255) NULL');
    }
    const [fpCols] = await db.query<any[]>('SHOW COLUMNS FROM users LIKE "deviceFingerprint"');
    if (!fpCols || fpCols.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN deviceFingerprint VARCHAR(255) NULL');
    }
    const [expCols] = await db.query<any[]>('SHOW COLUMNS FROM users LIKE "experience"');
    if (!expCols || expCols.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN experience VARCHAR(100) NULL');
    }
  } catch (e) {
    console.error('Column migration error in users:', e);
  }

  // Safe migration for auctions table (Admin Wallet, Conclusion, and 20-min Settlement)
  try {
    const [adminWalletCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "adminWalletAddress"');
    if (!adminWalletCols || adminWalletCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN adminWalletAddress VARCHAR(255) NULL');
    }
    const [winnerEthCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "winnerEthAmount"');
    if (!winnerEthCols || winnerEthCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN winnerEthAmount VARCHAR(100) NULL');
    }
    const [winnerBidderCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "winnerBidderId"');
    if (!winnerBidderCols || winnerBidderCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN winnerBidderId VARCHAR(100) NULL');
    }
    const [concludedCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "concludedAt"');
    if (!concludedCols || concludedCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN concludedAt TIMESTAMP NULL');
    }
    const [settlementExpCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "settlementExpiresAt"');
    if (!settlementExpCols || settlementExpCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN settlementExpiresAt TIMESTAMP NULL');
    }
    const [settlementTxCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "settlementTxHash"');
    if (!settlementTxCols || settlementTxCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN settlementTxHash VARCHAR(128) NULL');
    }
    const [settlementStatCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "settlementStatus"');
    if (!settlementStatCols || settlementStatCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN settlementStatus VARCHAR(50) NOT NULL DEFAULT "PENDING"');
    }
    const [endsAtCols] = await db.query<any[]>('SHOW COLUMNS FROM auctions LIKE "endsAt"');
    if (!endsAtCols || endsAtCols.length === 0) {
      await db.query('ALTER TABLE auctions ADD COLUMN endsAt TIMESTAMP NULL');
    }
  } catch (e) {
    console.error('Column migration error in auctions:', e);
  }

  dbInitialized = true;
}
