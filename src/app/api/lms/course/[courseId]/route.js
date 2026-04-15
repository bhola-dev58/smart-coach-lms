import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { courseId } = await params;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: { $in: ['active', 'completed'] },
    }).lean();

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Fetch full course with chapters and lessons
    const course = await Course.findById(courseId)
      .populate('instructor', 'name bio')
      .lean();

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Sort chapters and lessons by order
    if (course.chapters) {
      course.chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
      course.chapters.forEach((ch) => {
        if (ch.lessons) {
          ch.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      });
    }

    // Serialize
    const serialized = {
      _id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      level: course.level,
      totalHours: course.totalHours,
      instructor: course.instructor ? {
        name: course.instructor.name,
        bio: course.instructor.bio,
      } : null,
      chapters: course.chapters.map((ch) => ({
        _id: ch._id.toString(),
        title: ch.title,
        description: ch.description,
        order: ch.order,
        lessons: ch.lessons.map((l) => ({
          _id: l._id.toString(),
          title: l.title,
          slug: l.slug,
          duration: l.duration,
          videoUrl: l.videoUrl || '',
          content: l.content || '',
          order: l.order,
          isFree: l.isFree,
          resources: l.resources || [],
        })),
      })),
      progress: {
        completedLessons: enrollment.progress?.completedLessons || [],
        currentLesson: enrollment.progress?.currentLesson || '',
        percentage: enrollment.progress?.percentage || 0,
        totalWatchTimeMin: enrollment.progress?.totalWatchTimeMin || 0,
      },
    };

    return NextResponse.json({ success: true, course: serialized });
  } catch (error) {
    console.error('Course Content API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch course' }, { status: 500 });
  }
}
