import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

// GET /api/courses — Fetch all published courses
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const sort = searchParams.get('sort') || 'popular';

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (level) filter.level = level;

    let sortQuery = {};
    if (sort === 'popular') sortQuery = { totalStudents: -1 };
    else if (sort === 'price-low') sortQuery = { price: 1 };
    else if (sort === 'price-high') sortQuery = { price: -1 };
    else if (sort === 'rating') sortQuery = { rating: -1 };

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .sort(sortQuery)
      .lean();

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/courses — Create a new course (admin/instructor only)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const course = await Course.create(body);
    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
