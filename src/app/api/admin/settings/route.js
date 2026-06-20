import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import SystemSetting from '@/models/SystemSetting';

// ── GET settings (Admin only) ──
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[API Admin Settings GET Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// ── POST/UPDATE settings (Admin only) ──
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { maintenanceMode, allowRegistrations, supportEmail } = await req.json();

    await connectDB();
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting();
    }

    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowRegistrations !== undefined) settings.allowRegistrations = allowRegistrations;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail.trim();

    await settings.save();

    return NextResponse.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('[API Admin Settings POST Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
