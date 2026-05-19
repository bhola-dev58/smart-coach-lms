import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, password, college, branch, year } = await request.json();

    // ── Validation ──
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // ── Check duplicate email ──
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // ── Hash Password ──
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create User ──
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      college: college || '',
      branch: branch || 'CSE',
      year: year ? parseInt(year) : 1,
      role: 'student',
      provider: 'credentials',
      isEmailVerified: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please log in.',
      userId: user._id.toString(),
    }, { status: 201 });

  } catch (error) {
    console.error('[Register API Error]', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
