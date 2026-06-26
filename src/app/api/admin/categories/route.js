import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';

// Helper to check admin role
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return false;
  }
  return true;
}

// GET: Fetch all categories (for admin management)
export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const categories = await Category.find({}).sort({ label: 1 }).lean();
    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        ...c,
        _id: c._id.toString()
      }))
    });
  } catch (error) {
    console.error('[GET /api/admin/categories]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new category
export async function POST(req) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, label, icon, color, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category key code (name) is required' }, { status: 400 });
    }

    if (!label || !label.trim()) {
      return NextResponse.json({ success: false, error: 'Display label is required' }, { status: 400 });
    }

    const normName = name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');

    // Check if category already exists
    const existing = await Category.findOne({ name: normName });
    if (existing) {
      return NextResponse.json({ success: false, error: `Category with key "${normName}" already exists` }, { status: 409 });
    }

    const newCategory = new Category({
      name: normName,
      label: label.trim(),
      icon: (icon || 'default').trim(),
      color: (color || '#3b82f6').trim(),
      isActive: isActive !== undefined ? !!isActive : true
    });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: {
        ...newCategory.toObject(),
        _id: newCategory._id.toString()
      }
    });
  } catch (error) {
    console.error('[POST /api/admin/categories]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
