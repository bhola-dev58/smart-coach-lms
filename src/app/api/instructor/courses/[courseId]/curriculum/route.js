import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const courseId = params.courseId;
    const course = await Course.findOne({ _id: courseId, instructor: session.user.id }).lean();
    
    if (!course && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Course not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, chapters: course?.chapters || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { chapters } = await req.json();
    await connectDB();
    
    const course = await Course.findOneAndUpdate(
      { _id: params.courseId, instructor: session.user.id },
      { $set: { chapters } },
      { new: true, runValidators: true }
    );

    if (!course && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, chapters: course.chapters });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
