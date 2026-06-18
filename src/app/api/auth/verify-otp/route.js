// ============================================================
// ✅ VERIFY OTP — POST /api/auth/verify-otp
// Verifies the 6-digit OTP and marks email as verified.
// Sends welcome email on success.
// ============================================================
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and OTP are required.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified.' });
    }

    // ── Check OTP stored ──
    const otpData = user.emailOtp;
    if (!otpData?.code || !otpData?.expiresAt) {
      return NextResponse.json({ success: false, error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    // ── Check expiry ──
    if (new Date() > otpData.expiresAt) {
      return NextResponse.json({ success: false, error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // ── Brute-force protection: max 5 attempts ──
    if (otpData.attempts >= 5) {
      return NextResponse.json({ success: false, error: 'Too many failed attempts. Please request a new OTP.' }, { status: 429 });
    }

    // ── Verify OTP ──
    const isMatch = await bcrypt.compare(otp.trim(), otpData.code);

    if (!isMatch) {
      // Increment attempt counter
      await User.findByIdAndUpdate(user._id, {
        'emailOtp.attempts': (otpData.attempts || 0) + 1,
      });
      const remaining = 4 - (otpData.attempts || 0);
      return NextResponse.json(
        { success: false, error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // ── Mark verified & clear OTP ──
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailOtp: { code: '', expiresAt: null, attempts: 0 },
    });

    // ── Send welcome email (non-blocking) ──
    sendWelcomeEmail(user.email, user.name).catch(err =>
      console.error('[Verify OTP] Welcome email failed:', err.message)
    );

    // ── Create in-app notification ──
    createNotification(
      user._id.toString(),
      'otp_verified',
      '✅ Email Verified!',
      'Your email has been successfully verified. Welcome to Gradify Academy!',
      '/lms'
    );

    return NextResponse.json({ success: true, message: 'Email verified successfully!' });

  } catch (error) {
    console.error('[Verify OTP Error]', error);
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
