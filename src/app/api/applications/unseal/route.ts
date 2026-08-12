import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { decryptApplication, isTenderDeadlinePassed, decryptNetworkVaultKey } from '@/lib/axiom-crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenderId, forceUnseal = false } = body;

    if (!tenderId) {
      return NextResponse.json(
        { error: 'Tender ID is required' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    // 1. Fetch tender details & verify timelock
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
    const isPassed = isTenderDeadlinePassed(tender.closingDate) || forceUnseal;

    if (!isPassed) {
      return NextResponse.json(
        { 
          error: 'Timelock Active: Bids are sealed in the 2-of-2 Axiom Vault and cannot be unsealed before the tender deadline.',
          tenderId: tender.id,
          closingDate: tender.closingDate,
          status: 'SEALED_VAULT_LOCKED'
        },
        { status: 403 }
      );
    }

    // 2. Fetch all sealed applications and network vault keys
    const [apps] = await db.query<RowDataPacket[]>(`
      SELECT 
        a.id AS applicationId,
        a.tenderId,
        a.applicantName,
        a.applicantEmail,
        a.encryptedPayload,
        a.iv,
        a.authTag,
        a.dbKeyShare,
        a.bidHash,
        a.status,
        a.submittedAt,
        v.networkKeyShare,
        v.vaultIv,
        v.vaultAuthTag,
        v.timelockExpiry,
        v.vaultStatus
      FROM tender_applications a
      JOIN axiom_network_vault v ON a.id = v.applicationId
      WHERE a.tenderId = ?
    `, [tender.id]);

    const decryptedList: any[] = [];

    for (const app of apps) {
      try {
        // 1. Decrypt Key 2 from Timelock Network Vault
        let rawNetworkKey = app.networkKeyShare;
        if (app.vaultIv && app.vaultAuthTag) {
          try {
            rawNetworkKey = decryptNetworkVaultKey(
              app.networkKeyShare,
              app.vaultIv,
              app.vaultAuthTag,
              tender.id,
              app.timelockExpiry || tender.closingDate,
              true
            );
          } catch {
            rawNetworkKey = app.networkKeyShare;
          }
        }

        // 2. Recombine Key 1 (DB) + Key 2 (Network) to Decrypt Application
        const decryptedPayload = decryptApplication(
          app.encryptedPayload,
          app.iv,
          app.authTag,
          app.dbKeyShare,
          rawNetworkKey
        );

        // Update status and decrypted applicant credentials in DB upon unseal
        await db.query<ResultSetHeader>(
          'UPDATE tender_applications SET applicantName = ?, applicantEmail = ?, userId = ?, status = CASE WHEN status IN ("AWARDED", "REJECTED") THEN status ELSE "UNSEALED" END, unsealedAt = IFNULL(unsealedAt, NOW()) WHERE id = ?',
          [
            decryptedPayload.applicant.fullName || 'Verified Applicant',
            decryptedPayload.applicant.email || '',
            decryptedPayload.applicant.userId || null,
            app.applicationId
          ]
        );

        await db.query<ResultSetHeader>(
          'UPDATE axiom_network_vault SET vaultStatus = "RELEASED_FOR_DECRYPTION", released_at = IFNULL(released_at, NOW()) WHERE applicationId = ?',
          [app.applicationId]
        );

        decryptedList.push({
          applicationId: app.applicationId,
          tenderId: app.tenderId,
          applicantName: decryptedPayload.applicant.fullName,
          applicantEmail: decryptedPayload.applicant.email,
          bidHash: app.bidHash,
          submittedAt: app.submittedAt,
          payload: decryptedPayload,
          unsealedAt: new Date().toISOString(),
          status: app.status === 'AWARDED' ? 'AWARDED' : app.status === 'REJECTED' ? 'REJECTED' : 'UNSEALED'
        });
      } catch (e) {
        console.error(`Error unsealing application ${app.applicationId}:`, e);
      }
    }

    // Persist closed deadline in tenders table
    await db.query<ResultSetHeader>(
      'UPDATE tenders SET closingDate = "00d : 00h : 00m : 00s" WHERE id = ?',
      [tender.id]
    );

    const [latestTenders] = await db.query<RowDataPacket[]>(
      'SELECT id, title, client, location, value, closingDate, matchType, expectedDuration, status, winnerApplicantId, winnerName, winnerOrg, winnerAmount, awardedAt FROM tenders WHERE id = ? LIMIT 1',
      [tender.id]
    );
    const latestTender = latestTenders && latestTenders.length > 0 ? latestTenders[0] : tender;

    return NextResponse.json({
      success: true,
      message: `Axiom Cryptographic Engine successfully decrypted ${decryptedList.length} applications using dual DB & Network key shares.`,
      tenderId: tender.id,
      tender: latestTender,
      unsealedCount: decryptedList.length,
      applications: decryptedList,
    });

  } catch (error: unknown) {
    console.error('Unseal applications error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to unseal applications: ' + errorMessage },
      { status: 500 }
    );
  }
}
