import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export async function POST(req) {
  try {
    await connectDB();
    const { courseId, lessonId, duration } = await req.json();

    if (!courseId || !lessonId || duration === undefined) {
      return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    // Convert duration (seconds) from video to minutes for DB schema standard
    const durationMinutes = Math.ceil(duration / 60);

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' });

    let updated = false;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson._id.toString() === lessonId && lesson.duration !== durationMinutes && lesson.type !== 'assignment' && !lesson.title.toLowerCase().includes('assignment')) {
          lesson.duration = durationMinutes;
          updated = true;
        }
      }
    }

    if (updated) {
      await course.save();
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('Failed to update duration:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
