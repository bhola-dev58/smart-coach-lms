import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Tenant from '@/models/Tenant';
import User from '@/models/User';

// ============================================
// 🏢 MULTI-TENANT API
// Manage coaching center tenants/organizations
// ============================================

// GET: Get tenant info by subdomain or list all (admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const listAll = searchParams.get('all');

    await connectDB();

    if (subdomain) {
      const tenant = await Tenant.findOne({ subdomain, isActive: true })
        .populate('owner', 'name email avatar')
        .lean();

      if (!tenant) {
        return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, tenant });
    }

    if (listAll) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
      }

      const tenants = await Tenant.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ success: true, tenants });
    }

    return NextResponse.json({ success: false, error: 'Provide subdomain or all=true' }, { status: 400 });
  } catch (error) {
    console.error('Tenant GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new tenant (onboarding)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, subdomain, tagline, email, phone } = body;

    if (!name || !subdomain) {
      return NextResponse.json({ success: false, error: 'Name and subdomain are required' }, { status: 400 });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({
        success: false,
        error: 'Subdomain must be 4-30 chars, lowercase, alphanumeric with hyphens only',
      }, { status: 400 });
    }

    // Reserved subdomains
    const reserved = ['www', 'app', 'api', 'admin', 'mail', 'smtp', 'ftp', 'cdn', 'lms', 'help', 'support'];
    if (reserved.includes(subdomain)) {
      return NextResponse.json({ success: false, error: 'This subdomain is reserved' }, { status: 400 });
    }

    await connectDB();

    // Check uniqueness
    const existing = await Tenant.findOne({ subdomain });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Subdomain already taken' }, { status: 400 });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const tenant = await Tenant.create({
      name,
      slug,
      subdomain,
      owner: session.user.id,
      branding: {
        tagline: tagline || '',
        primaryColor: body.primaryColor || '#C8102E',
      },
      contact: {
        email: email || session.user.email || '',
        phone: phone || '',
      },
      plan: 'free',
      maxCourses: 5,
      maxStudents: 100,
      maxInstructors: 2,
    });

    return NextResponse.json({
      success: true,
      tenant,
      url: `${subdomain}.gradify.academy`,
    });
  } catch (error) {
    console.error('Tenant POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
