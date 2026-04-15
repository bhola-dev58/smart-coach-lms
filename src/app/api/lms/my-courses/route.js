import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import '@/models/Course';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({
      student: session.user.id,
      status: { $in: ['active', 'completed'] },
    })
      .populate('course', 'title slug thumbnail category totalHours totalLessons chapters instructor level')
      .sort({ 'progress.lastAccessedAt': -1 })
      .lean();

    // Calculate total lessons from chapters for accurate progress
    const enriched = enrollments.map((enr) => {
      const course = enr.course;
      let totalLessons = 0;
      if (course?.chapters) {
        course.chapters.forEach((ch) => {
          totalLessons += ch.lessons?.length || 0;
        });
      }
      const completedCount = enr.progress?.completedLessons?.length || 0;
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        _id: enr._id.toString(),
        courseId: course?._id?.toString(),
        title: course?.title,
        slug: course?.slug,
        thumbnail: course?.thumbnail,
        category: course?.category,
        level: course?.level,
        totalHours: course?.totalHours,
        totalLessons,
        completedLessons: completedCount,
        percentage,
        currentLesson: enr.progress?.currentLesson || '',
        lastAccessedAt: enr.progress?.lastAccessedAt,
        status: enr.status,
        enrolledAt: enr.enrolledAt,
      };
    });

    return NextResponse.json({ success: true, courses: enriched });
  } catch (error) {
    console.error('My Courses API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}
