import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, ensureTablesExist } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, mobile, password } = body;

    if (!fullName || !email || !mobile || !password) {
      return NextResponse.json(
        { error: 'All administrative registration fields are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure database and admin table exist
    await ensureTablesExist();
    const db = getPool();

    // Check if admin already exists in admin table
    const [existingAdmins] = await db.query<RowDataPacket[]>(
      'SELECT id FROM admin WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'An administrator with this email ID is already registered. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert admin record into admin table
    const insertAdminQuery = `
      INSERT INTO admin (fullName, email, mobile, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query<ResultSetHeader>(insertAdminQuery, [
      fullName.trim(),
      normalizedEmail,
      mobile.trim(),
      hashedPassword,
      'admin',
    ]);

    const adminProfile = {
      id: result.insertId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      role: 'admin',
      registeredAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Admin registered successfully',
        admin: adminProfile,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Admin registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to process admin registration: ' + errorMessage },
      { status: 500 }
    );
  }
}
