import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import Enrollment from '@/models/Enrollment';
import Review from '@/models/Review';
import LiveSession from '@/models/LiveSession';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user?.role;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const isAdmin = role === 'admin';
    
    // Find all courses for this instructor/admin
    const courseFilter = isAdmin ? {} : { instructor: session.user.id };
    const courses = await Course.find(courseFilter).select('_id title price isPublished').lean();
    const courseIds = courses.map(c => c._id);

    // 1. Total Courses count
    const totalCourses = courses.length;

    // 2. Active Batches count
    const totalBatches = await Batch.countDocuments({
      course: { $in: courseIds },
      isActive: true
    });

    // 3. Active Enrollments count
    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: 'active'
    });

    // 4. Average Rating
    const ratings = await Review.aggregate([
      { $match: { course: { $in: courseIds }, isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = ratings.length > 0 ? parseFloat(ratings[0].avgRating.toFixed(1)) : 4.8;

    // 5. Upcoming Live Sessions
    const upcomingLive = await LiveSession.countDocuments({
      course: { $in: courseIds },
      scheduledAt: { $gte: new Date() }
    });

    // 6. Pending Submissions
    const pendingSubmissions = await AssignmentSubmission.countDocuments({
      course: { $in: courseIds },
      status: 'submitted'
    });

    // 7. Recent courses list
    const recentCourses = courses.slice(0, 5).map(c => ({
      id: c._id,
      title: c.title,
      price: c.price,
      isPublished: c.isPublished
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        totalBatches,
        totalEnrollments,
        avgRating,
        upcomingLive,
        pendingSubmissions
      },
      recentCourses
    });
  } catch (error) {
    console.error('Instructor Stats API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
