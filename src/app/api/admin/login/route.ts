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

    // Ensure database and admin table exist
    await ensureTablesExist();
    const db = getPool();

    // Retrieve admin by email from admin table
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM admin WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid admin email or password' },
        { status: 401 }
      );
    }

    const admin = rows[0];

    // Verify password with bcrypt
    let isPasswordValid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$')) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      isPasswordValid = admin.password === password;
      if (isPasswordValid) {
        const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 10;
        const newHash = await bcrypt.hash(password, saltRounds);
        await db.query('UPDATE admin SET password = ? WHERE id = ?', [newHash, admin.id]);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid admin email or password' },
        { status: 401 }
      );
    }

    const adminProfile = {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role || 'admin',
      registeredAt: admin.created_at ? new Date(admin.created_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      admin: adminProfile,
    });
  } catch (error: unknown) {
    console.error('Admin login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to process admin login: ' + errorMessage },
      { status: 500 }
    );
  }
}
