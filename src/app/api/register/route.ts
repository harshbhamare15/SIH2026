import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      mobile,
      password,
      role = 'contractor',
      walletAddress,
      deviceFingerprint,
      orgType,
      orgName,
      pan,
      gst,
      address1,
      address2,
      city,
      state,
      district,
      pincode,
      country,
      address,
    } = body;

    // Validate required fields
    if (!fullName || !email || !mobile || !password || !orgType || !orgName || !pan || !address1 || !city || !state || !district || !pincode || !country) {
      return NextResponse.json(
        { error: 'Missing required registration fields' },
        { status: 400 }
      );
    }

    // Normalize role to support 'contractor', 'buyer', or 'both'
    const normalizedRole = (role === 'both' || role === 'contractor,buyer' || role === 'buyer,contractor')
      ? 'both'
      : role === 'buyer'
      ? 'buyer'
      : 'contractor';

    // If registering with buyer capability, validate wallet address for Ganache transactions
    const hasBuyerCapability = normalizedRole === 'buyer' || normalizedRole === 'both';
    if (hasBuyerCapability && (!walletAddress || !walletAddress.trim().startsWith('0x'))) {
      return NextResponse.json(
        { error: 'A valid MetaMask wallet address is required when registering with Buyer capability for Ganache network escrow transactions.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure database table exists
    await ensureTablesExist();
    const db = getPool();

    // Check if user already exists
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email ID already exists. Please login instead.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const resolvedCountry = country.trim();
    const formattedAddress = address?.trim() || [address1, address2, city, state, district, pincode, resolvedCountry].filter(Boolean).join(', ');

    // Resolved device fingerprint for contractor encryption
    const hasContractorCapability = normalizedRole === 'contractor' || normalizedRole === 'both';
    const resolvedFingerprint = hasContractorCapability
      ? (deviceFingerprint ? deviceFingerprint.trim() : null)
      : (deviceFingerprint ? deviceFingerprint.trim() : null);

    // Insert user into MySQL database
    const insertQuery = `
      INSERT INTO users (
        fullName,
        email,
        mobile,
        password,
        role,
        walletAddress,
        deviceFingerprint,
        orgType,
        orgName,
        pan,
        gst,
        address1,
        address2,
        city,
        state,
        district,
        pincode,
        country,
        address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query<ResultSetHeader>(insertQuery, [
      fullName.trim(),
      normalizedEmail,
      mobile.trim(),
      hashedPassword,
      normalizedRole,
      walletAddress ? walletAddress.trim() : null,
      resolvedFingerprint,
      orgType.trim(),
      orgName.trim(),
      pan.trim().toUpperCase(),
      gst ? gst.trim().toUpperCase() : null,
      address1.trim(),
      address2 ? address2.trim() : null,
      city.trim(),
      state.trim(),
      district.trim(),
      pincode.trim(),
      resolvedCountry,
      formattedAddress,
    ]);

    const userProfile = {
      id: result.insertId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      role: normalizedRole,
      walletAddress: walletAddress ? walletAddress.trim() : null,
      deviceFingerprint: resolvedFingerprint,
      orgType: orgType.trim(),
      orgName: orgName.trim(),
      pan: pan.trim().toUpperCase(),
      gst: gst ? gst.trim().toUpperCase() : '',
      address1: address1.trim(),
      address2: address2 ? address2.trim() : '',
      city: city.trim(),
      state: state.trim(),
      district: district.trim(),
      pincode: pincode.trim(),
      country: resolvedCountry,
      address: formattedAddress,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: userProfile,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to process registration: ' + errorMessage },
      { status: 500 }
    );
  }
}
