import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Certificate from '@/models/Certificate';
import '@/models/Course';
import '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const certificates = await Certificate.find({ student: session.user.id })
      .populate('course', 'title slug thumbnail category')
      .sort({ createdAt: -1 })
      .lean();

    const serialized = JSON.parse(JSON.stringify(certificates));

    return NextResponse.json({ success: true, certificates: serialized });
  } catch (error) {
    console.error('[GET /api/lms/certificates]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
