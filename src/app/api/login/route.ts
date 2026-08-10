import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure database table exists
    await ensureTablesExist();
    const db = getPool();

    // Retrieve user by email
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify password with bcrypt
    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for plain text password comparison if any existed
      isPasswordValid = user.password === password;
      if (isPasswordValid) {
        const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 10;
        const newHash = await bcrypt.hash(password, saltRounds);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Build safe user profile payload
    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role || 'contractor',
      walletAddress: user.walletAddress || null,
      deviceFingerprint: user.deviceFingerprint || null,
      orgType: user.orgType,
      orgName: user.orgName,
      pan: user.pan,
      gst: user.gst || '',
      address1: user.address1 || '',
      address2: user.address2 || '',
      city: user.city || '',
      state: user.state || '',
      district: user.district || '',
      pincode: user.pincode || '',
      country: user.country || '',
      address: user.address || [user.address1, user.address2, user.city, user.state, user.district, user.pincode, user.country].filter(Boolean).join(', '),
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userProfile,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to process login: ' + errorMessage },
      { status: 500 }
    );
  }
}
