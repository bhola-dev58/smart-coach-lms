import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';

// Safely lazy load all models
const getModel = async (resource) => {
  switch (resource.toLowerCase()) {
    case 'announcements': return (await import('@/models/Announcement')).default;
    case 'assignments': return (await import('@/models/Assignment')).default;
    case 'assignmentsubmissions': return (await import('@/models/AssignmentSubmission')).default;
    case 'contacts': return (await import('@/models/Contact')).default;
    case 'coupons': return (await import('@/models/Coupon')).default;
    case 'courses': return (await import('@/models/Course')).default;
    case 'discussions': return (await import('@/models/Discussion')).default;
    case 'enrollments': return (await import('@/models/Enrollment')).default;
    case 'livesessions': return (await import('@/models/LiveSession')).default;
    case 'notifications': return (await import('@/models/Notification')).default;
    case 'payments': return (await import('@/models/Payment')).default;
    case 'reviews': return (await import('@/models/Review')).default;
    case 'studymaterials': return (await import('@/models/StudyMaterial')).default;
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

    // Try to fetch instructor specific resources if schema has instructor/user field, else generic fetch
    // For now we do a simple .find() but limit to avoid enormous paylaods
    const data = await Model.find({}).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(`Error fetching resource:`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await checkAuth();
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const body = await request.json();
    const unwrappedParams = await params;
    await connectDB();
    const Model = await getModel(unwrappedParams.resource);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    // Auto-inject instructor ID if applicable
    if (Model.schema.paths.instructor) body.instructor = auth.session.user.id;
    if (Model.schema.paths.user) body.user = auth.session.user.id;

    const newItem = await Model.create(body);
    return NextResponse.json({ success: true, data: newItem });
  } catch (err) {
    console.error(`Error creating resource:`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
    await connectDB();
    const Model = await getModel(unwrappedParams.resource);
    if (!Model) return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });

    const updatedItem = await Model.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true }).lean();
    return NextResponse.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error(`Error updating resource:`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
