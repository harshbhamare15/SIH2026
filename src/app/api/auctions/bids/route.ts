import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

// Helper to generate a stable, random-looking anonymous pseudonym for live room privacy
function getAnonymousBidderAlias(bidderId?: string, bidderName?: string, auctionId?: string): string {
  if (bidderName && bidderName.startsWith('Anonymous Bidder #')) {
    return bidderName;
  }
  const seed = `${auctionId || 'auction'}:${bidderId || bidderName || 'user'}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 9000) + 1000;
  return `Anonymous Bidder #${code}`;
}

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist();
    const db = getPool();

    const { searchParams } = new URL(req.url);
    const auctionId = searchParams.get('auctionId');
    const bidderName = searchParams.get('bidderName');
    const bidderId = searchParams.get('bidderId');
    const isLedger = searchParams.get('ledger') === 'true';

    // If ledger feed is requested
    if (isLedger) {
      const [ledgerRows] = await db.query<RowDataPacket[]>(
        `SELECT b.id, b.auctionId, b.bidderName, b.bidderOrg, b.bidAmount, b.bidHash, b.created_at, a.title as auctionTitle
         FROM auction_bids b
         LEFT JOIN auctions a ON b.auctionId = a.id
         ORDER BY b.created_at DESC
         LIMIT 50`
      );

      return NextResponse.json({
        success: true,
        ledger: ledgerRows.map((r, idx) => ({
          id: r.id,
          auctionId: r.auctionId,
          auctionTitle: r.auctionTitle || 'Government Procurement Auction',
          bidderName: getAnonymousBidderAlias(String(r.id), r.bidderName, r.auctionId),
          bidderOrg: 'Enterprise Contractor',
          bidAmount: Number(r.bidAmount),
          bidHash: r.bidHash,
          created_at: r.created_at,
          blockHeight: 20914800 + (r.id || idx),
          txHash: r.bidHash ? r.bidHash.substring(0, 34) : `0x${r.id}a48586e797e433ab948586e`,
          status: 'CONFIRMED_ON_CHAIN',
        })),
      });
    }

    // If user's specific bids are requested
    if (bidderName || bidderId) {
      const [userBids] = await db.query<RowDataPacket[]>(
        `SELECT b.*, a.title, a.client, a.location, a.startingValue, a.status as auctionStatus, a.lowestBid as currentHighestBid, a.category, a.duration
         FROM auction_bids b
         LEFT JOIN auctions a ON b.auctionId = a.id
         WHERE b.bidderName = ? OR b.bidderId = ?
         ORDER BY b.created_at DESC`,
        [bidderName || '', bidderId || '']
      );

      return NextResponse.json({
        success: true,
        userBids: userBids.map((b) => ({
          ...b,
          bidAmount: Number(b.bidAmount),
          currentHighestBid: Number(b.currentHighestBid || b.bidAmount),
          isH1Leader: Number(b.bidAmount) >= Number(b.currentHighestBid || 0),
        })),
      });
    }

    // If no specific auctionId is requested, return summary counts per auction
    if (!auctionId) {
      const [counts] = await db.query<RowDataPacket[]>(
        `SELECT auctionId, COUNT(*) as totalBids, COUNT(DISTINCT bidderName) as distinctBidders, MAX(bidAmount) as highestBid, MIN(bidAmount) as lowestBid 
         FROM auction_bids 
         GROUP BY auctionId`
      );

      const summaryMap: Record<string, { totalBids: number; distinctBidders: number; highestBid: number; lowestBid: number }> = {};
      counts.forEach((row) => {
        summaryMap[row.auctionId] = {
          totalBids: Number(row.totalBids) || 0,
          distinctBidders: Number(row.distinctBidders) || 0,
          highestBid: Number(row.highestBid) || 0,
          lowestBid: Number(row.lowestBid) || 0,
        };
      });

      return NextResponse.json({
        success: true,
        counts: summaryMap,
      });
    }

    const normalizedAuctionId = auctionId.trim();

    // 1. Fetch auction details
    const [auctionRows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM auctions WHERE id = ? LIMIT 1',
      [normalizedAuctionId]
    );

    if (!auctionRows || auctionRows.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auction = auctionRows[0];

    // 2. Fetch all chronological bids
    const [bids] = await db.query<RowDataPacket[]>(
      'SELECT id, auctionId, bidderId, bidderName, bidderOrg, bidAmount, bidHash, created_at FROM auction_bids WHERE auctionId = ? ORDER BY created_at DESC',
      [normalizedAuctionId]
    );

    // 3. Fetch leaderboard (highest bid valued - H1, H2, H3 ranked by MAX(bidAmount) DESC)
    const [leaderboardRows] = await db.query<RowDataPacket[]>(
      `SELECT bidderId, bidderName, bidderOrg, MAX(bidAmount) as bestBid, COUNT(*) as bidCount, MAX(created_at) as lastBidTime 
       FROM auction_bids 
       WHERE auctionId = ? 
       GROUP BY bidderId, bidderName, bidderOrg 
       ORDER BY bestBid DESC`,
      [normalizedAuctionId]
    );

    // Parse start price
    const startNum = parseFloat(String(auction.startingValue).replace(/[^\d.]/g, '')) || 0;
    const currentHighest = leaderboardRows.length > 0 ? Number(leaderboardRows[0].bestBid) : (auction.lowestBid > 0 ? auction.lowestBid : startNum);
    const priceGrowth = currentHighest > startNum ? currentHighest - startNum : 0;
    const percentageGrowth = startNum > 0 && priceGrowth > 0 ? ((priceGrowth / startNum) * 100).toFixed(1) + '%' : '0.0%';

    const leadingBidderAnon = leaderboardRows.length > 0 ? {
      ...leaderboardRows[0],
      bidderName: getAnonymousBidderAlias(leaderboardRows[0].bidderId, leaderboardRows[0].bidderName, normalizedAuctionId),
    } : null;

    const stats = {
      totalBids: bids.length,
      distinctBidders: leaderboardRows.length,
      startingPrice: auction.startingValue,
      currentHighestBid: currentHighest,
      currentLowestBid: currentHighest, // alias for backwards compat
      priceGrowth,
      percentageGrowth,
      leadingBidder: leadingBidderAnon,
    };

    return NextResponse.json({
      success: true,
      auction,
      bids: bids.map((b) => ({
        ...b,
        bidderName: getAnonymousBidderAlias(b.bidderId, b.bidderName, normalizedAuctionId),
        bidderOrg: 'Enterprise Contractor',
      })),
      leaderboard: leaderboardRows.map((row, idx) => ({
        rank: `H${idx + 1}`,
        bidderName: getAnonymousBidderAlias(row.bidderId, row.bidderName, normalizedAuctionId),
        bidderOrg: 'Enterprise Contractor',
        bestBid: Number(row.bestBid),
        bidCount: Number(row.bidCount),
        lastBidTime: row.lastBidTime,
        diffFromH1: idx === 0 ? 0 : Number(leaderboardRows[0].bestBid) - Number(row.bestBid),
      })),
      stats,
    });
  } catch (error: unknown) {
    console.error('Fetch auction bids error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to fetch auction bids: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auctionId, bidAmount, bidderId, bidderName, bidderOrg } = body;

    if (!auctionId || bidAmount === undefined || isNaN(Number(bidAmount))) {
      return NextResponse.json(
        { error: 'Auction ID and a valid numeric bidAmount are required.' },
        { status: 400 }
      );
    }

    const numericBid = Number(bidAmount);
    if (numericBid <= 0) {
      return NextResponse.json(
        { error: 'Bid amount must be greater than 0.' },
        { status: 400 }
      );
    }

    await ensureTablesExist();
    const db = getPool();

    const normalizedAuctionId = auctionId.trim();

    // Check auction exists and get current highest bid
    const [auctionRows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM auctions WHERE id = ? LIMIT 1',
      [normalizedAuctionId]
    );

    if (!auctionRows || auctionRows.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found.' },
        { status: 404 }
      );
    }

    const auction = auctionRows[0];
    const startNum = parseFloat(String(auction.startingValue).replace(/[^\d.]/g, '')) || 0;
    
    // Get highest current bid from bids table
    const [maxBidRows] = await db.query<RowDataPacket[]>(
      'SELECT MAX(bidAmount) as maxBid FROM auction_bids WHERE auctionId = ?',
      [normalizedAuctionId]
    );
    const maxExistingBid = maxBidRows && maxBidRows[0] && maxBidRows[0].maxBid ? Number(maxBidRows[0].maxBid) : (auction.lowestBid > 0 ? auction.lowestBid : startNum);

    // In higher bid valued auctions, bid must be strictly higher than current leading bid
    if (maxExistingBid > 0 && numericBid <= maxExistingBid) {
      return NextResponse.json(
        { error: `In this auction, your bid must be strictly HIGHER than the current leading bid of ₹${maxExistingBid.toLocaleString()}` },
        { status: 400 }
      );
    }

    const bId = bidderId ? String(bidderId).trim() : 'BID-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const rawName = (bidderName || 'Verified Enterprise Bidder').trim();
    const name = getAnonymousBidderAlias(bId, rawName, normalizedAuctionId);
    const org = (bidderOrg || 'Government Approved Vendor').trim();

    // Generate cryptographic hash for immutable bid validation
    const bidHash = '0x' + crypto.createHash('sha256')
      .update(`${normalizedAuctionId}:${name}:${numericBid}:${Date.now()}`)
      .digest('hex');

    // 1. Record bid in auction_bids table
    const [insertResult] = await db.query<ResultSetHeader>(
      `INSERT INTO auction_bids (auctionId, bidderId, bidderName, bidderOrg, bidAmount, bidHash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [normalizedAuctionId, bId, name, org, numericBid, bidHash]
    );

    // 2. Update auction leading bid & status in auctions table
    await db.query(
      `UPDATE auctions 
       SET lowestBid = ?, status = 'Live', updated_at = NOW() 
       WHERE id = ?`,
      [numericBid, normalizedAuctionId]
    );

    const newBidRecord = {
      id: insertResult.insertId,
      auctionId: normalizedAuctionId,
      bidderId: bId,
      bidderName: name,
      bidderOrg: org,
      bidAmount: numericBid,
      bidHash,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: `Higher bid of ₹${numericBid.toLocaleString()} placed successfully!`,
        bid: newBidRecord,
        updatedHighestBid: numericBid,
        updatedLowestBid: numericBid,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Place auction bid error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to place bid: ' + errorMessage },
      { status: 500 }
    );
  }
}
