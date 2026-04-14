import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

/**
 * GET /api/courses/featured
 * Returns only courses marked as featured (isFeatured: true) by admin.
 * Used on the homepage "Popular Courses" section.
 */
export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find({
      isPublished: true,
      isFeatured: true,
    })
      .select(
        'title slug shortDescription description thumbnail category level price originalPrice totalHours totalStudents rating'
      )
      .populate('instructor', 'name avatar')
      .sort({ totalStudents: -1 })
      .limit(6)
      .lean();

    return NextResponse.json(
      { success: true, courses },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Featured courses API error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured courses' },
      { status: 500 }
    );
  }
}
