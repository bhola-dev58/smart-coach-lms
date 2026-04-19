import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── POST: Upload KYC document ──
export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType') || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No document provided' }, { status: 400 });
    }

    // Validate document type
    const allowedTypes = ['aadhaar', 'student_id', 'pan', 'passport', 'college_id'];
    if (!allowedTypes.includes(documentType)) {
      return NextResponse.json({ success: false, error: 'Invalid document type' }, { status: 400 });
    }

    // Validate file type — images + PDF
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only JPEG, PNG, WebP, or PDF files allowed' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File must be under 10MB' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Already approved - block re-submission
    if (user.verification?.status === 'approved') {
      return NextResponse.json({ success: false, error: 'Your verification is already approved' }, { status: 400 });
    }

    // Convert to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'meetme-center/kyc-documents',
      public_id: `kyc_${user._id}_${documentType}_${Date.now()}`,
      resource_type: resourceType,
    });

    // Update DB: status -> pending
    user.verification = {
      status: 'pending',
      documentUrl: result.secure_url,
      documentType,
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      rejectionReason: '',
    };
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Document submitted for review. You will be notified once approved.',
      verification: {
        status: 'pending',
        documentType,
        submittedAt: user.verification.submittedAt,
      }
    });
  } catch (err) {
    console.error('KYC upload error:', err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

// ── GET: Fetch own verification status ──
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select('verification role')
      .lean();

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      verification: user.verification || { status: 'unverified' },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
