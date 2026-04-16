import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    // Only Admin can change roles
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    await connectDB();
    const data = await request.json();
    const { _id, role } = data;

    if (!_id) return NextResponse.json({ success: false, error: 'User ID missing' }, { status: 400 });

    const validRoles = ['student', 'instructor', 'admin'];
    if (!role || typeof role !== 'string' || !validRoles.includes(role.toLowerCase())) {
       return NextResponse.json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(_id, { role: role.toLowerCase() }, { new: true });
    
    return NextResponse.json({ success: true, data: updatedUser, error: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
