import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import slugify from 'slugify';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'instructor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // ── Input Validation ──
    const { title, category, price } = data;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Course title is required and must be a valid string.' }, { status: 400 });
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Course category is required and must be a valid string.' }, { status: 400 });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ success: false, error: 'A valid non-negative course price is required.' }, { status: 400 });
    }

    // Auto-generate slug if not provided or empty
    if (!data.slug || data.slug.trim() === '') {
      data.slug = slugify(data.title, { lower: true, strict: true }) || `course-${Date.now()}`;
    }

    // Default instructor to current user if empty
    if (!data.instructor) {
        data.instructor = session.user.id;
    }

    const newCourse = await Course.create(data);
    
    return NextResponse.json({ success: true, data: newCourse, error: null });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'A course with this slug already exists. Please choose a unique title or slug.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'instructor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) return NextResponse.json({ success: false, error: 'Course ID missing' }, { status: 400 });

    const updatedCourse = await Course.findByIdAndUpdate(_id, updateData, { new: true });
    
    return NextResponse.json({ success: true, data: updatedCourse, error: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
   try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'instructor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await request.json();
    
    if (!id) return NextResponse.json({ success: false, error: 'Course ID missing' }, { status: 400 });

    await Course.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } 
}
