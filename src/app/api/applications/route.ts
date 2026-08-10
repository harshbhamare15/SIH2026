import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { decryptApplication, isTenderDeadlinePassed, DecryptedApplicationPayload } from '@/lib/axiom-crypto';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get('tenderId');
    const forceUnseal = searchParams.get('forceUnseal') === 'true'; // For admin evaluation/testing
    const userEmail = searchParams.get('userEmail');
    const userId = searchParams.get('userId');

    await ensureTablesExist();
    const db = getPool();

    // Case 0: Fetch specific contractor user's submitted applications
    if (userEmail || userId) {
      const [userApps] = await db.query<RowDataPacket[]>(`
        SELECT 
          a.id AS applicationId,
          a.tenderId,
          a.status,
          a.submittedAt,
          a.bidHash,
          t.title AS tenderTitle,
          t.client AS department,
          t.location,
          t.value,
          t.closingDate
        FROM tender_applications a
        JOIN tenders t ON a.tenderId = t.id
        WHERE a.applicantEmail = ? OR (a.userId IS NOT NULL AND a.userId = ?)
        ORDER BY a.submittedAt DESC
      `, [userEmail || '', userId ? Number(userId) : 0]);

      return NextResponse.json({
        success: true,
        applications: userApps
      });
    }

    // Case 1: Fetch overview summary of all tender application counts for dashboard
    if (!tenderId) {
      const [counts] = await db.query<RowDataPacket[]>(`
        SELECT 
          t.id AS tenderId,
          t.title AS tenderTitle,
          t.closingDate AS closingDate,
          COUNT(a.id) AS totalApplications,
          SUM(CASE WHEN a.status = 'SEALED' THEN 1 ELSE 0 END) AS sealedCount,
          SUM(CASE WHEN a.status = 'UNSEALED' THEN 1 ELSE 0 END) AS unsealedCount
        FROM tenders t
        LEFT JOIN tender_applications a ON t.id = a.tenderId
        GROUP BY t.id, t.title, t.closingDate
      `);

      const summaryMap: Record<string, any> = {};
      counts.forEach((row) => {
        const isPassed = isTenderDeadlinePassed(row.closingDate);
        summaryMap[row.tenderId] = {
          tenderId: row.tenderId,
          tenderTitle: row.tenderTitle,
          closingDate: row.closingDate,
          totalApplications: Number(row.totalApplications || 0),
          sealedCount: Number(row.sealedCount || 0),
          unsealedCount: Number(row.unsealedCount || 0),
          isDeadlinePassed: isPassed,
          vaultStatus: isPassed ? 'READY_FOR_UNSEALING' : 'SEALED_IN_VAULT'
        };
      });

      return NextResponse.json({
        success: true,
        summary: summaryMap,
        raw: counts,
      });
    }

    // Case 2: Specific Tender Details & Sealed / Unsealed Resolution
    const [tenders] = await db.query<RowDataPacket[]>(
      'SELECT id, title, client, location, value, closingDate, matchType, status, winnerApplicantId, winnerName, winnerOrg, winnerAmount, awardedAt FROM tenders WHERE id = ? LIMIT 1',
      [tenderId.trim()]
    );

    if (!tenders || tenders.length === 0) {
      return NextResponse.json(
        { error: `Tender with ID "${tenderId}" not found in database.` },
        { status: 404 }
      );
    }

    const tender = tenders[0];
    const isDeadlinePassed = isTenderDeadlinePassed(tender.closingDate) || forceUnseal || tender.status === 'AWARDED';

    // Fetch applications count
    const [countRows] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as totalCount FROM tender_applications WHERE tenderId = ?',
      [tender.id]
    );
    const totalCount = Number(countRows[0]?.totalCount || 0);

    // If deadline has NOT passed: Strict Sealed-Bid Confidentiality (Count Only)
    if (!isDeadlinePassed) {
      return NextResponse.json({
        success: true,
        tenderId: tender.id,
        tenderTitle: tender.title,
        closingDate: tender.closingDate,
        isDeadlinePassed: false,
        totalApplications: totalCount,
        applications: [], // Strictly hidden & sealed before deadline
        status: 'SEALED_VAULT_ACTIVE',
        tender: tender,
        message: `Tender window is active. All ${totalCount} application details are cryptographically sealed in the 2-of-2 Axiom Vault. Decryption unlocks automatically upon deadline expiry.`
      });
    }

    // If deadline HAS passed: Axiom Cryptographic Engine unseals applications
    // Retrieve Key Share 1 (from DB) + Key Share 2 (from Network Vault)
    const [appRows] = await db.query<RowDataPacket[]>(`
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
        v.timelockExpiry,
        v.vaultStatus
      FROM tender_applications a
      JOIN axiom_network_vault v ON a.id = v.applicationId
      WHERE a.tenderId = ?
      ORDER BY a.submittedAt ASC
    `, [tender.id]);

    const unsealedApplications: Array<{
      applicationId: string;
      tenderId: string;
      applicantName: string;
      applicantEmail: string;
      bidHash: string;
      submittedAt: string;
      payload: DecryptedApplicationPayload;
      status: string;
    }> = [];

    for (const row of appRows) {
      try {
        const decryptedPayload = decryptApplication(
          row.encryptedPayload,
          row.iv,
          row.authTag,
          row.dbKeyShare,
          row.networkKeyShare
        );

        unsealedApplications.push({
          applicationId: row.applicationId,
          tenderId: row.tenderId,
          applicantName: row.applicantName,
          applicantEmail: row.applicantEmail,
          bidHash: row.bidHash,
          submittedAt: row.submittedAt,
          payload: decryptedPayload,
          status: row.status || 'UNSEALED'
        });
      } catch (decErr) {
        console.error(`Failed to decrypt application ${row.applicationId}:`, decErr);
      }
    }

    return NextResponse.json({
      success: true,
      tenderId: tender.id,
      tenderTitle: tender.title,
      closingDate: tender.closingDate,
      isDeadlinePassed: true,
      totalApplications: totalCount,
      unsealedCount: unsealedApplications.length,
      status: 'UNSEALED_DECRYPTED',
      tender: tender,
      applications: unsealedApplications,
      message: `Tender deadline reached. Axiom Engine has combined the DB and Network key shares and unsealed ${unsealedApplications.length} applications.`
    });

  } catch (error: unknown) {
    console.error('Fetch applications error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to fetch application data: ' + errorMessage },
      { status: 500 }
    );
  }
}
