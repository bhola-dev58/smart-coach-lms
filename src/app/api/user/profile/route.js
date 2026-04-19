import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// ── GET: Fetch logged-in user's profile ──
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select('-password -__v')
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        provider: user.provider,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        college: user.college || '',
        branch: user.branch || '',
        year: user.year || null,
        bio: user.bio || '',
        specialization: user.specialization || [],
        socialLinks: user.socialLinks || { linkedin: '', youtube: '', website: '' },
        enrolledCourses: user.enrolledCourses || [],
        verification: user.verification || { status: 'unverified' },
        payoutInfo: user.payoutInfo || { upiId: '', bankAccount: '', ifscCode: '', bankName: '' },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ── PUT: Update user profile (safe fields only) ──
export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Whitelist: Only these fields can be updated by the user themselves
    const allowedFields = ['name', 'phone', 'avatar', 'college', 'branch', 'year', 'bio', 'socialLinks', 'payoutInfo'];
    const updateData = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        // Sanitize string fields
        if (typeof body[key] === 'string') {
          updateData[key] = body[key].trim();
        } else if (key === 'year') {
          const yr = parseInt(body[key]);
          if (!isNaN(yr) && yr >= 1 && yr <= 4) {
            updateData[key] = yr;
          }
        } else if (key === 'socialLinks' && typeof body[key] === 'object') {
          // Only allow known social link fields
          updateData[key] = {
            linkedin: (body[key].linkedin || '').trim(),
            youtube: (body[key].youtube || '').trim(),
            website: (body[key].website || '').trim(),
          };
        } else if (key === 'payoutInfo' && typeof body[key] === 'object') {
          // Only instructors can set payout info
          updateData[key] = {
            upiId: (body[key].upiId || '').trim(),
            bankAccount: (body[key].bankAccount || '').trim(),
            ifscCode: (body[key].ifscCode || '').trim().toUpperCase(),
            bankName: (body[key].bankName || '').trim(),
          };
        } else {
          updateData[key] = body[key];
        }
      }
    }

    // Validate name is not empty
    if (updateData.name !== undefined && updateData.name.length < 2) {
      return NextResponse.json({ success: false, error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    // Validate bio length
    if (updateData.bio !== undefined && updateData.bio.length > 500) {
      return NextResponse.json({ success: false, error: 'Bio must be under 500 characters' }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -__v').lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        avatar: updatedUser.avatar || '',
        role: updatedUser.role,
        college: updatedUser.college || '',
        branch: updatedUser.branch || '',
        year: updatedUser.year || null,
        bio: updatedUser.bio || '',
        specialization: updatedUser.specialization || [],
        socialLinks: updatedUser.socialLinks || { linkedin: '', youtube: '', website: '' },
      }
    });
  } catch (err) {
    console.error('Profile PUT error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
