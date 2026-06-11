import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { role, name, phone } = await request.json();

    // ── Validate role ──
    if (!['student', 'instructor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role. Must be student or instructor.' }, { status: 400 });
    }

    // ── Validate name ──
    const trimmedName = (name || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json({ success: false, error: 'Full name is required (at least 2 characters).' }, { status: 400 });
    }

    // ── Validate phone ──
    const trimmedPhone = (phone || '').trim();
    if (!trimmedPhone) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number (at least 10 digits).' }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      role,
      name: trimmedName,
      phone: trimmedPhone,
      hasSelectedRole: true,
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
