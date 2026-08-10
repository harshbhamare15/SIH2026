import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    await ensureTablesExist();
    const db = getPool();

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, title, client, location, value, closingDate, matchType, created_at, updated_at FROM tenders ORDER BY created_at DESC'
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
    const { id, title, client, location, value, closingDate, matchType } = body;

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
      INSERT INTO tenders (id, title, client, location, value, closingDate, matchType)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const tenderMatchType = matchType ? matchType.trim() : 'High Match';

    await db.query<ResultSetHeader>(insertQuery, [
      normalizedId,
      title.trim(),
      client.trim(),
      location.trim(),
      value.trim(),
      closingDate.trim(),
      tenderMatchType,
    ]);

    const newTender = {
      id: normalizedId,
      title: title.trim(),
      client: client.trim(),
      location: location.trim(),
      value: value.trim(),
      closingDate: closingDate.trim(),
      matchType: tenderMatchType,
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
