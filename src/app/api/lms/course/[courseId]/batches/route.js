import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Batch from '@/models/Batch';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const unwrappedParams = await params;
    await connectDB();
    const { courseId } = unwrappedParams;

    const batches = await Batch.find({
      course: courseId,
      isActive: true
    }).select('name _id').sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, batches });
  } catch (err) {
    console.error('Error fetching course batches:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
