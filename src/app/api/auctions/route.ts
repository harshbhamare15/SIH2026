import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    await ensureTablesExist();
    const db = getPool();

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, title, client, location, startingValue, lowestBid, duration, status, type, category, mode, tenderRef, winnerApplicantId, winnerName, winnerOrg, winnerAmount, created_at, updated_at FROM auctions ORDER BY created_at DESC'
    );

    return NextResponse.json({
      success: true,
      auctions: rows,
    });
  } catch (error: unknown) {
    console.error('Fetch auctions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to fetch auctions: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      client,
      location,
      startingValue,
      duration,
      status,
      type,
      category,
      mode,
      tenderRef,
      lowestBid,
    } = body;

    if (!id || !title || !client || !location || !startingValue || !duration) {
      return NextResponse.json(
        { error: 'Missing required auction fields (id, title, client, location, startingValue, duration)' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const normalizedId = id.trim();

    // Check if auction ID already exists
    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM auctions WHERE id = ? LIMIT 1',
      [normalizedId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'An auction with ID "' + normalizedId + '" already exists.' },
        { status: 409 }
      );
    }

    // Extract numeric lowest bid
    let numericLowestBid = 0;
    if (typeof lowestBid === 'number' && !isNaN(lowestBid)) {
      numericLowestBid = lowestBid;
    } else {
      const numStr = startingValue.replace(/[^\d.]/g, '');
      numericLowestBid = parseFloat(numStr) || 0;
    }

    const auctionStatus = status ? status.trim() : 'Live';
    const auctionType = type ? type.trim() : 'sub';
    const auctionCategory = category ? category.trim() : 'Consumables & Office Supplies';
    const auctionMode = mode ? mode.trim() : 'Reverse';
    const auctionTenderRef = tenderRef ? tenderRef.trim() : null;

    const insertQuery = `
      INSERT INTO auctions (id, title, client, location, startingValue, lowestBid, duration, status, type, category, mode, tenderRef)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query<ResultSetHeader>(insertQuery, [
      normalizedId,
      title.trim(),
      client.trim(),
      location.trim(),
      startingValue.trim(),
      numericLowestBid,
      duration.trim(),
      auctionStatus,
      auctionType,
      auctionCategory,
      auctionMode,
      auctionTenderRef,
    ]);

    const newAuction = {
      id: normalizedId,
      title: title.trim(),
      client: client.trim(),
      location: location.trim(),
      startingValue: startingValue.trim(),
      lowestBid: numericLowestBid,
      duration: duration.trim(),
      status: auctionStatus,
      type: auctionType,
      category: auctionCategory,
      mode: auctionMode,
      tenderRef: auctionTenderRef,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Auction published successfully',
        auction: newAuction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Publish auction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to publish auction: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { auctionId, lowestBid, status, winnerApplicantId, winnerName, winnerOrg, winnerAmount } = body;

    if (!auctionId) {
      return NextResponse.json(
        { error: 'Auction ID is required' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    // Check if auction exists
    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT * FROM auctions WHERE id = ? LIMIT 1',
      [auctionId.trim()]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const current = existing[0];
    const newLowestBid = lowestBid !== undefined ? parseFloat(lowestBid) : current.lowestBid;
    const newStatus = status !== undefined ? status : current.status;
    const newWinnerApp = winnerApplicantId !== undefined ? winnerApplicantId : current.winnerApplicantId;
    const newWinnerName = winnerName !== undefined ? winnerName : current.winnerName;
    const newWinnerOrg = winnerOrg !== undefined ? winnerOrg : current.winnerOrg;
    const newWinnerAmount = winnerAmount !== undefined ? winnerAmount : current.winnerAmount;

    await db.query(
      `UPDATE auctions 
       SET lowestBid = ?, status = ?, winnerApplicantId = ?, winnerName = ?, winnerOrg = ?, winnerAmount = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newLowestBid, newStatus, newWinnerApp, newWinnerName, newWinnerOrg, newWinnerAmount, auctionId.trim()]
    );

    return NextResponse.json({
      success: true,
      message: `Auction ${auctionId} updated successfully`,
      auction: {
        ...current,
        lowestBid: newLowestBid,
        status: newStatus,
        winnerApplicantId: newWinnerApp,
        winnerName: newWinnerName,
        winnerOrg: newWinnerOrg,
        winnerAmount: newWinnerAmount,
      },
    });
  } catch (error: unknown) {
    console.error('Update auction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to update auction: ' + errorMessage },
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
        { error: 'Auction ID is required for deletion' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM auctions WHERE id = ?',
      [id.trim()]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Auction deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete auction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to delete auction: ' + errorMessage },
      { status: 500 }
    );
  }
}
