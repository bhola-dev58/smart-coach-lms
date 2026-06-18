import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, password, college, branch, year, role, country, state, city } = await request.json();

    // ── Basic Validation ──
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // ── Role Handling — Admin cannot be created via public API ──
    const allowedRoles = ['student', 'instructor'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    // ── Check duplicate email ──
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // ── Hash Password ──
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate OTP ──
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ── Create User (unverified) ──
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      college: college || '',
      branch: branch || 'Science',
      year: year ? parseInt(year) : 1,
      role: userRole,
      provider: 'credentials',
      isEmailVerified: false,
      hasSelectedRole: true,
      emailOtp: { code: hashedOtp, expiresAt: otpExpiresAt, attempts: 0 },
      location: {
        country: country || '',
        state: state || '',
        city: city || '',
      },
    });

    // ── Send OTP email (non-blocking on failure) ──
    sendOTPEmail(user.email, user.name, otp).catch(err =>
      console.error('[Register] OTP email failed:', err.message)
    );

    return NextResponse.json({
      success: true,
      message: 'Account created! Please verify your email with the OTP sent to your inbox.',
      requiresOtp: true,
      email: user.email,
    }, { status: 201 });

  } catch (error) {
    console.error('[Register API Error]', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
