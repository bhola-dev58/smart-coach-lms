import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SystemSetting from '@/models/SystemSetting';

export async function GET() {
  try {
    await connectDB();
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[API Settings GET Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}
