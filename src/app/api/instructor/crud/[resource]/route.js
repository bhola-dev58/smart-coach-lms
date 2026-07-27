import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';

import slugify from 'slugify';

// Safely lazy load all models
const getModel = async (resource) => {
  switch (resource.toLowerCase()) {
    case 'announcements': return (await import('@/models/Announcement')).default;
    case 'assignments': return (await import('@/models/Assignment')).default;
    case 'assignmentsubmissions': return (await import('@/models/AssignmentSubmission')).default;
    case 'contacts': return (await import('@/models/Contact')).default;
    case 'coupons': return (await import('@/models/Coupon')).default;
    case 'courses': return (await import('@/models/Course')).default;
    case 'batches': return (await import('@/models/Batch')).default;
    case 'discussions': return (await import('@/models/Discussion')).default;
    case 'enrollments': return (await import('@/models/Enrollment')).default;
    case 'livesessions': return (await import('@/models/LiveSession')).default;
    case 'notifications': return (await import('@/models/Notification')).default;
    case 'payments': return (await import('@/models/Payment')).default;
    case 'reviews': return (await import('@/models/Review')).default;
    case 'studymaterials': return (await import('@/models/StudyMaterial')).default;
    case 'practicequestions': return (await import('@/models/PracticeQuestion')).default;
    case 'certificates': return (await import('@/models/Certificate')).default;
    default: return null;
  }
};

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
    return { error: 'Unauthorized Access' };
  }
  return { session };
}

export async function GET(request, { params }) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const unwrappedParams = await params;
    await connectDB();
    const Model = await getModel(unwrappedParams.resource);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    // Filter to instructor-specific data if applicable (admin sees all data)
    const query = {};
    if (auth.session.user.role !== 'admin') {
      if (Model.schema.paths.instructor) {
        query.instructor = auth.session.user.id;
      } else if (Model.schema.paths.user) {
        query.user = auth.session.user.id;
      } else if (Model.schema.paths.createdBy) {
        query.createdBy = auth.session.user.id;
      }
    }

    let queryBuilder = Model.find(query);
    const resourceName = unwrappedParams.resource.toLowerCase();

    // Ensure related models are loaded and populated for human-readable DataTable view
    if (resourceName === 'enrollments') {
      await import('@/models/User');
      await import('@/models/Course');
      await import('@/models/Batch');
      queryBuilder = queryBuilder
        .populate('student', 'name email')
        .populate('course', 'title')
        .populate('batch', 'name');
    } else if (resourceName === 'batches') {
      await import('@/models/Course');
      queryBuilder = queryBuilder.populate('course', 'title');
    } else if (resourceName === 'livesessions') {
      await import('@/models/Course');
      await import('@/models/Batch');
      queryBuilder = queryBuilder
        .populate('course', 'title')
        .populate('batch', 'name');
    } else if (resourceName === 'announcements') {
      await import('@/models/Course');
      queryBuilder = queryBuilder.populate('course', 'title');
    } else if (resourceName === 'assignments') {
      await import('@/models/Course');
      queryBuilder = queryBuilder.populate('course', 'title');
    } else if (resourceName === 'studymaterials') {
      await import('@/models/Course');
      queryBuilder = queryBuilder.populate('course', 'title');
    } else if (resourceName === 'reviews') {
      await import('@/models/User');
      await import('@/models/Course');
      queryBuilder = queryBuilder
        .populate('student', 'name email')
        .populate('course', 'title');
    } else if (resourceName === 'discussions') {
      await import('@/models/User');
      await import('@/models/Course');
      queryBuilder = queryBuilder
        .populate('user', 'name email')
        .populate('course', 'title');
    } else if (resourceName === 'assignmentsubmissions') {
      await import('@/models/User');
      await import('@/models/Assignment');
      await import('@/models/Course');
      queryBuilder = queryBuilder
        .populate('student', 'name email')
        .populate('assignment', 'title')
        .populate('course', 'title');
    }

    const data = await queryBuilder.sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(`Error fetching resource:`, err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const body = await request.json();
    const unwrappedParams = await params;
    const resourceName = unwrappedParams.resource.toLowerCase();
    await connectDB();
    const Model = await getModel(resourceName);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    // Auto-inject instructor ID if applicable
    if (Model.schema.paths.instructor) body.instructor = auth.session.user.id;
    if (Model.schema.paths.user) body.user = auth.session.user.id;
    if (Model.schema.paths.createdBy) body.createdBy = auth.session.user.id;

    // Auto-inject required discussion defaults if applicable
    if (resourceName === 'discussions') {
      if (!body.userName) body.userName = auth.session.user.name || auth.session.user.email || 'Instructor';
      if (!body.userRole) body.userRole = auth.session.user.role || 'instructor';
      if (!body.question) body.question = body.title || body.content || body.discussion || 'Discussion Question';
      if (!body.lessonSlug || body.lessonSlug.trim() === '') body.lessonSlug = 'general';
    }

    // Auto-generate slug for courses if not provided
    if (resourceName === 'courses') {
      if (!body.slug || body.slug.trim() === '') {
        const baseSlug = slugify(body.title || 'course', { lower: true, strict: true }) || `course-${Date.now()}`;
        let slug = baseSlug;
        let count = 1;
        while (await Model.exists({ slug })) {
          slug = `${baseSlug}-${count}`;
          count++;
        }
        body.slug = slug;
      }
    }

    const newItem = await Model.create(body);
    return NextResponse.json({ success: true, data: newItem });
  } catch (err) {
    console.error(`Error creating resource:`, err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const body = await request.json();
    const { _id, ...updateData } = body;
    if (!_id) return NextResponse.json({ success: false, error: 'Missing _id' }, { status: 400 });

    const unwrappedParams = await params;
    const resourceName = unwrappedParams.resource.toLowerCase();
    await connectDB();
    const Model = await getModel(resourceName);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    // Auto-generate/update slug for courses if empty or not provided
    if (resourceName === 'courses') {
      if (!body.slug || body.slug.trim() === '') {
        const baseSlug = slugify(body.title || 'course', { lower: true, strict: true }) || `course-${Date.now()}`;
        let slug = baseSlug;
        let count = 1;
        while (await Model.exists({ slug, _id: { $ne: _id } })) {
          slug = `${baseSlug}-${count}`;
          count++;
        }
        updateData.slug = slug;
      }
    }

    if (resourceName === 'discussions') {
      if (!updateData.userName) updateData.userName = auth.session.user.name || auth.session.user.email || 'Instructor';
      if (!updateData.userRole) updateData.userRole = auth.session.user.role || 'instructor';
      if (!updateData.question && (updateData.title || updateData.content)) {
        updateData.question = updateData.title || updateData.content;
      }
      if (!updateData.lessonSlug || updateData.lessonSlug.trim() === '') updateData.lessonSlug = 'general';
    }

    const updatedItem = await Model.findByIdAndUpdate(_id, updateData, { returnDocument: 'after', runValidators: true }).lean();

    // ── Live Session Completed Hook: Auto-add to Course Curriculum ──
    if (resourceName === 'livesessions' && updatedItem.status === 'completed' && updatedItem.joinUrl && updatedItem.course) {
      try {
        const Course = (await import('@/models/Course')).default;
        const slugify = (await import('slugify')).default;
        
        const course = await Course.findById(updatedItem.course);
        if (course) {
          // Check if "Recorded Live Classes" chapter exists
          let chapter = course.chapters.find(ch => ch.title === 'Recorded Live Classes');
          if (!chapter) {
            // Create a new chapter
            course.chapters.push({
              title: 'Recorded Live Classes',
              description: 'Recordings of live sessions for offline viewing',
              order: course.chapters.length,
              lessons: []
            });
            chapter = course.chapters[course.chapters.length - 1];
          }

          // Check if lesson with this video url or slug already exists to prevent duplicates
          const baseSlug = slugify(updatedItem.title, { lower: true, strict: true }) || 'live-recording';
          const existingLesson = chapter.lessons.find(l => l.videoUrl === updatedItem.joinUrl || l.slug.startsWith(baseSlug));
          
          if (!existingLesson) {
            // Add lesson
            const lessonSlug = `${baseSlug}-${Date.now()}`;
            chapter.lessons.push({
              title: updatedItem.title,
              slug: lessonSlug,
              type: 'video',
              duration: updatedItem.duration || 60,
              videoUrl: updatedItem.joinUrl,
              order: chapter.lessons.length,
              isFree: false
            });
            await course.save();
            console.log(`✅ Auto-attached recorded live session to course curriculum: ${updatedItem.title}`);
          }
        }
      } catch (err) {
        console.error('Error auto-attaching live session recording to course curriculum:', err);
      }
    }

    // ── Assignment Submission Evaluation Hook: Notify Student ──
    if (resourceName === 'assignmentsubmissions' && updatedItem && updatedItem.student) {
      try {
        const { createNotification } = await import('@/lib/notifications');
        const isAccepted = updatedItem.status === 'accepted' || updatedItem.status === 'graded';
        const isRejected = updatedItem.status === 'rejected';

        const notifTitle = isAccepted 
          ? '✅ Assignment Accepted & Graded' 
          : isRejected 
            ? '❌ Assignment Revision Required' 
            : '📝 Assignment Status Updated';

        const notifMsg = `Your submission status is now ${updatedItem.status?.toUpperCase() || 'EVALUATED'}.${updatedItem.marksAwarded !== null && updatedItem.marksAwarded !== undefined ? ` Score: ${updatedItem.marksAwarded}` : ''}`;

        await createNotification(
          updatedItem.student,
          'assignment_graded',
          notifTitle,
          notifMsg,
          '/lms/tests'
        );
      } catch (notifErr) {
        console.error('Failed to notify student on assignment evaluation:', notifErr);
      }
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error(`Error updating resource:`, err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const unwrappedParams = await params;
    await connectDB();
    const Model = await getModel(unwrappedParams.resource);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    await Model.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error(`Error deleting resource:`, err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
