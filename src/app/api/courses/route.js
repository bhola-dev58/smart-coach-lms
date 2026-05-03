import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { cacheOrFetch, cacheDelete } from '@/lib/cache';

// GET /api/courses — Fetch all published courses (with Redis caching)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const sort = searchParams.get('sort') || 'popular';

    // Build a unique cache key based on query params
    const cacheKey = `courses:list:${category || 'all'}:${level || 'all'}:${sort}`;

    const courses = await cacheOrFetch(cacheKey, async () => {
      await connectDB();

      const filter = { isPublished: true };
      if (category) filter.category = category;
      if (level) filter.level = level;

      let sortQuery = {};
      if (sort === 'popular') sortQuery = { totalStudents: -1 };
      else if (sort === 'price-low') sortQuery = { price: 1 };
      else if (sort === 'price-high') sortQuery = { price: -1 };
      else if (sort === 'rating') sortQuery = { rating: -1 };

      return Course.find(filter)
        .populate('instructor', 'name avatar')
        .sort(sortQuery)
        .lean();
    }, 300); // Cache for 5 minutes

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
