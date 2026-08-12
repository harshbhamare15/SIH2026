import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { encryptApplication, computeBlindIndex, encryptNetworkVaultKey, DecryptedApplicationPayload } from '@/lib/axiom-crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenderId,
      applicant,
      bidDetails,
      metadata
    } = body;

    if (!tenderId || !applicant || !bidDetails || !bidDetails.bidAmount) {
      return NextResponse.json(
        { error: 'Missing mandatory application details (tenderId, applicant profile, bidAmount)' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    // 1. Fetch Tender to get closing date & verify existence
    const [tenders] = await db.query<RowDataPacket[]>(
      'SELECT id, title, closingDate FROM tenders WHERE id = ? LIMIT 1',
      [tenderId.trim()]
    );

    if (!tenders || tenders.length === 0) {
      return NextResponse.json(
        { error: `Tender with ID "${tenderId}" not found in database.` },
        { status: 404 }
      );
    }

    const tender = tenders[0];
    const applicationId = `APP-${tenderId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 2. Prepare Plaintext Application Payload
    const fullPayload: DecryptedApplicationPayload = {
      applicationId,
      tenderId: tender.id,
      applicant: {
        userId: applicant.userId || undefined,
        fullName: applicant.fullName || 'Authorized Bidder',
        email: applicant.email || '',
        mobile: applicant.mobile || '',
        orgName: applicant.orgName || '',
        orgType: applicant.orgType || '',
        pan: applicant.pan || '',
        gst: applicant.gst || '',
        experience: applicant.experience || '',
        address: applicant.address || '',
        city: applicant.city || '',
        state: applicant.state || '',
        walletAddress: applicant.walletAddress || '',
        deviceFingerprint: applicant.deviceFingerprint || '',
      },
      bidDetails: {
        bidAmount: bidDetails.bidAmount,
        bidAmountNumeric: bidDetails.bidAmountNumeric || undefined,
        technicalProposal: bidDetails.technicalProposal || 'Standard Technical Compliance Verification',
        documentsAttached: bidDetails.documentsAttached || ['GST_CERT', 'PAN_CARD', 'BID_SECURITY_DECLARATION'],
        submissionNonce: crypto.randomBytes(16).toString('hex'),
        submittedAt: new Date().toISOString(),
      },
      metadata: {
        tenderTitle: tender.title,
        timelockClosingDate: tender.closingDate,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1',
        ...metadata,
      }
    };

    // 3. Encrypt via Axiom Cryptographic Engine & Generate 2-of-2 Key Shares
    const encryptedPkg = encryptApplication(applicationId, tender.id, fullPayload);
    const applicantBlindIndex = computeBlindIndex(applicant.email || String(applicant.userId || ''));

    // 4. Store Ciphertext + Key Share 1 (DB Key) in tender_applications table
    // Zero-Knowledge Privacy: Store ZERO plaintext personal identifiers in MySQL before deadline
    const insertAppQuery = `
      INSERT INTO tender_applications (
        id,
        tenderId,
        userId,
        applicantName,
        applicantEmail,
        applicantBlindIndex,
        encryptedPayload,
        iv,
        authTag,
        dbKeyShare,
        bidHash,
        status,
        submittedAt
      ) VALUES (?, ?, NULL, 'AXIOM-ENCRYPTED-BIDDER', 'axiom-encrypted-vault@axiom.zk', ?, ?, ?, ?, ?, ?, 'SEALED', NOW())
    `;

    await db.query<ResultSetHeader>(insertAppQuery, [
      encryptedPkg.applicationId,
      encryptedPkg.tenderId,
      applicantBlindIndex,
      encryptedPkg.encryptedPayload,
      encryptedPkg.iv,
      encryptedPkg.authTag,
      encryptedPkg.dbKeyShare, // Key Share 1 in DB
      encryptedPkg.bidHash,
    ]);

    // 5. Store Key Share 2 (Network Key) in isolated axiom_network_vault table with Timelock
    // Zero-Knowledge Guarantee: Key 2 is sealed with Timelock Encryption so DB admin cannot view it in plaintext
    const vaultPkg = encryptNetworkVaultKey(
      encryptedPkg.networkKeyShare,
      tender.id,
      tender.closingDate || ''
    );

    const insertVaultQuery = `
      INSERT INTO axiom_network_vault (
        applicationId,
        tenderId,
        networkKeyShare,
        vaultIv,
        vaultAuthTag,
        timelockExpiry,
        vaultStatus,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'LOCKED_IN_NETWORK', NOW())
    `;

    await db.query<ResultSetHeader>(insertVaultQuery, [
      encryptedPkg.applicationId,
      encryptedPkg.tenderId,
      vaultPkg.encryptedVaultKey, // Ciphertext of Key 2
      vaultPkg.vaultIv,
      vaultPkg.vaultAuthTag,
      tender.closingDate || 'TIMELOCK_ACTIVE',
    ]);

    // 6. Return Cryptographic Receipt (Zero-Knowledge / Sealed Confirmation)
    return NextResponse.json({
      success: true,
      message: 'Application encrypted and sealed successfully with 2-of-2 dual-key escrow.',
      applicationId: encryptedPkg.applicationId,
      tenderId: encryptedPkg.tenderId,
      bidHash: encryptedPkg.bidHash,
      sealedStatus: 'SEALED_IN_AXIOM_VAULT',
      encryptionStandard: 'AES-256-GCM',
      keyEscrow: {
        dbKeyShareBound: true,
        networkKeyShareBound: true,
        timelockExpiry: tender.closingDate,
      },
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Axiom application submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to encrypt and seal application: ' + errorMessage },
      { status: 500 }
    );
  }
}
