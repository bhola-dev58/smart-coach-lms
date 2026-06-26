import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ label: 1 }).lean();
    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        ...c,
        _id: c._id.toString()
      }))
    });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
