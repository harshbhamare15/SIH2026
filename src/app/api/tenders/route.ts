import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    await ensureTablesExist();
    const db = getPool();

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, title, client, location, value, closingDate, expectedDuration, matchType, status, winnerApplicantId, winnerName, winnerOrg, winnerAmount, awardedAt, created_at, updated_at FROM tenders ORDER BY created_at DESC'
    );

    return NextResponse.json({
      success: true,
      tenders: rows,
    });
  } catch (error: unknown) {
    console.error('Fetch tenders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to fetch tenders: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, client, location, value, closingDate, matchType, expectedDuration } = body;

    if (!id || !title || !client || !location || !value || !closingDate) {
      return NextResponse.json(
        { error: 'Missing required tender fields' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const normalizedId = id.trim();

    // Check if tender ID already exists
    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM tenders WHERE id = ? LIMIT 1',
      [normalizedId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'A tender with ID "' + normalizedId + '" already exists.' },
        { status: 409 }
      );
    }

    const insertQuery = `
      INSERT INTO tenders (id, title, client, location, value, closingDate, matchType, expectedDuration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const tenderMatchType = matchType ? matchType.trim() : 'High Match';
    const tenderDuration = expectedDuration ? expectedDuration.trim() : '6 Months';

    await db.query<ResultSetHeader>(insertQuery, [
      normalizedId,
      title.trim(),
      client.trim(),
      location.trim(),
      value.trim(),
      closingDate.trim(),
      tenderMatchType,
      tenderDuration,
    ]);

    const newTender = {
      id: normalizedId,
      title: title.trim(),
      client: client.trim(),
      location: location.trim(),
      value: value.trim(),
      closingDate: closingDate.trim(),
      matchType: tenderMatchType,
      expectedDuration: tenderDuration,
      status: 'OPEN',
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Tender published successfully',
        tender: newTender,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Publish tender error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to publish tender: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenderId, applicantId, winnerName, winnerOrg, winnerAmount, status } = body;

    if (!tenderId) {
      return NextResponse.json(
        { error: 'Tender ID is required' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const targetStatus = status || 'AWARDED';

    await db.query(
      `UPDATE tenders 
       SET status = ?, winnerApplicantId = ?, winnerName = ?, winnerOrg = ?, winnerAmount = ?, awardedAt = NOW() 
       WHERE id = ?`,
      [targetStatus, applicantId || null, winnerName || null, winnerOrg || null, winnerAmount || null, tenderId.trim()]
    );

    if (applicantId && targetStatus === 'AWARDED') {
      // Mark winning applicant as AWARDED
      await db.query(
        'UPDATE tender_applications SET status = "AWARDED" WHERE id = ?',
        [applicantId.trim()]
      );

      // Mark other applicants for this tender as REJECTED
      await db.query(
        'UPDATE tender_applications SET status = "REJECTED" WHERE tenderId = ? AND id != ?',
        [tenderId.trim(), applicantId.trim()]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tender ${tenderId} marked as ${targetStatus} and application statuses updated in database`,
    });
  } catch (error: unknown) {
    console.error('Update tender award error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to update tender: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tender ID is required for deletion' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM tenders WHERE id = ?',
      [id.trim()]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tender deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete tender error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to delete tender: ' + errorMessage },
      { status: 500 }
    );
  }
}
