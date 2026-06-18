// ============================================================
// 📤 SEND OTP — POST /api/auth/send-otp
// Generates a 6-digit OTP, hashes it, stores in User doc,
// and sends it to the user's email via Resend.
// ============================================================
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified.' });
    }

    // ── Rate-limit: max 1 OTP per 60s ──
    if (user.emailOtp?.expiresAt && user.emailOtp.expiresAt > new Date(Date.now() - 60_000)) {
      const waitSec = Math.ceil((user.emailOtp.expiresAt.getTime() - Date.now() - 9 * 60_000) / 1000);
      if (waitSec > 0) {
        return NextResponse.json(
          { success: false, error: `Please wait ${waitSec}s before requesting a new OTP.` },
          { status: 429 }
        );
      }
    }

    // ── Generate 6-digit OTP ──
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      emailOtp: { code: hashedOtp, expiresAt, attempts: 0 },
    });

    // ── Send OTP email ──
    await sendOTPEmail(user.email, user.name, otp);

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });

  } catch (error) {
    console.error('[Send OTP Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
