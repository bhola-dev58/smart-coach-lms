import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';

// GET: Fetch all reviews for a course
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId required' }, { status: 400 });
    }

    const reviews = await Review.find({ course: courseId, isApproved: true })
      .populate('student', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    // Check if current user already reviewed
    const myReview = await Review.findOne({ course: courseId, student: session.user.id }).lean();

    // Calculate average rating
    const totalRatings = reviews.length;
    const avgRating = totalRatings > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
      : 0;

    return NextResponse.json({ success: true, reviews, myReview, avgRating: parseFloat(avgRating), totalRatings });
  } catch (error) {
    console.error('Reviews GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST: Submit or update a review
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { courseId, rating, title, comment } = await req.json();

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'courseId and rating (1-5) required' }, { status: 400 });
    }

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
      { student: session.user.id, course: courseId },
      {
        student: session.user.id,
        course: courseId,
        rating,
        title: title || '',
        comment: comment || '',
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Reviews POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 });
  }
}
