import crypto from 'crypto';

/**
 * Axiom Sealed-Bid Cryptographic Engine
 * 
 * Provides:
 * 1. AES-256-GCM authenticated encryption for tender bid applications.
 * 2. 2-of-2 Dual-Key Splitting Protocol:
 *    - Master encryption key K is generated randomly (256-bit).
 *    - K is split into DB Key Share (Key 1) and Network Vault Key Share (Key 2) using XOR secret sharing.
 *    - Key 1 is stored in MySQL alongside ciphertext.
 *    - Key 2 is stored in the isolated Axiom Network Key Vault with timelock controls.
 * 3. Timelock decryption: Decryption requires both key shares and can only be performed
 *    when the tender deadline condition is met.
 */

export interface EncryptedApplicationPackage {
  applicationId: string;
  tenderId: string;
  encryptedPayload: string; // Base64 ciphertext
  iv: string; // Hex IV
  authTag: string; // Hex GCM auth tag
  dbKeyShare: string; // Hex Key Share 1 (stored in DB)
  networkKeyShare: string; // Hex Key Share 2 (stored in Network Vault)
  bidHash: string; // SHA-256 hash of plaintext payload
}

export interface DecryptedApplicationPayload {
  applicationId: string;
  tenderId: string;
  applicant: {
    userId?: number;
    fullName: string;
    email: string;
    mobile?: string;
    orgName: string;
    orgType?: string;
    pan?: string;
    gst?: string;
    address?: string;
    city?: string;
    state?: string;
    walletAddress?: string;
    deviceFingerprint?: string;
  };
  bidDetails: {
    bidAmount: string;
    bidAmountNumeric?: number;
    technicalProposal?: string;
    documentsAttached?: string[];
    submissionNonce: string;
    submittedAt: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Encrypts a tender application package and splits the encryption key into 2 shares.
 */
export function encryptApplication(
  applicationId: string,
  tenderId: string,
  payload: DecryptedApplicationPayload
): EncryptedApplicationPackage {
  // 1. Serialize payload to JSON
  const plaintext = JSON.stringify(payload);

  // 2. Compute SHA-256 integrity hash of original plaintext
  const bidHash = crypto.createHash('sha256').update(plaintext).digest('hex');

  // 3. Extract device fingerprint entropy (or fallback to device seed)
  const deviceFingerprint = payload.applicant?.deviceFingerprint || `fp_${applicationId}_${Date.now()}`;

  // 4. Generate 256-bit (32 bytes) master encryption key incorporating device fingerprint entropy
  const randomEntropy = crypto.randomBytes(32);
  const masterKey = crypto
    .createHmac('sha256', deviceFingerprint)
    .update(randomEntropy)
    .digest();

  // 5. Generate random 12-byte IV for AES-GCM
  const iv = crypto.randomBytes(12);

  // 6. Encrypt with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // 7. 2-of-2 Dual-Key Splitting via XOR Secret Sharing bound to Device Fingerprint
  // Key Share 1 (DB) is derived from device fingerprint + cryptographic salt
  const salt = crypto.randomBytes(32);
  const keyShare1 = crypto
    .createHmac('sha256', deviceFingerprint)
    .update(salt)
    .digest();

  // Key Share 2 (Network Vault) = masterKey XOR keyShare1
  const keyShare2 = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    keyShare2[i] = masterKey[i] ^ keyShare1[i];
  }

  return {
    applicationId,
    tenderId,
    encryptedPayload: ciphertext,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    dbKeyShare: keyShare1.toString('hex'),
    networkKeyShare: keyShare2.toString('hex'),
    bidHash,
  };
}

/**
 * Recombines DB Key Share and Network Vault Key Share to decrypt the application package.
 */
export function decryptApplication(
  encryptedPayload: string,
  ivHex: string,
  authTagHex: string,
  dbKeyShareHex: string,
  networkKeyShareHex: string
): DecryptedApplicationPayload {
  const keyShare1 = Buffer.from(dbKeyShareHex, 'hex');
  const keyShare2 = Buffer.from(networkKeyShareHex, 'hex');

  if (keyShare1.length !== 32 || keyShare2.length !== 32) {
    throw new Error('Invalid key share length. Both key shares must be 256-bit (32 bytes).');
  }

  // 1. Recombine master key: masterKey = Key_Share_1 XOR Key_Share_2
  const masterKey = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    masterKey[i] = keyShare1[i] ^ keyShare2[i];
  }

  // 2. Decrypt with AES-256-GCM
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedPayload, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  // 3. Parse JSON payload
  const parsed = JSON.parse(decrypted) as DecryptedApplicationPayload;
  return parsed;
}

/**
 * Checks if a tender closing date string has passed.
 * Supports various formats: "2026-08-15", "15 Aug 2026", "2026-08-15T18:00:00", etc.
 */
export function isTenderDeadlinePassed(closingDateStr: string): boolean {
  if (!closingDateStr) return false;
  
  const parsedDate = new Date(closingDateStr);
  if (!isNaN(parsedDate.getTime())) {
    return Date.now() >= parsedDate.getTime();
  }

  // Fallback for custom formatted strings
  const lower = closingDateStr.toLowerCase().trim();
  if (lower.includes('closed') || lower.includes('ended') || lower.includes('expired')) {
    return true;
  }

  return false;
}
