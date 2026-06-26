import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary server-side
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const hasCloudinary = !!(cloudName && apiKey && apiSecret);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req) {
  try {
    // 1. Authorize: only instructor or admin can upload files in LMS dashboard
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized Access' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Try Cloudinary first if credentials are configured
    if (hasCloudinary) {
      try {
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
        const resourceType = file.type.startsWith('video/') ? 'video' : 'auto';

        const result = await cloudinary.uploader.upload(base64, {
          folder: 'gradify-academy/materials',
          resource_type: resourceType,
        });

        if (result && result.secure_url) {
          return NextResponse.json({
            success: true,
            url: result.secure_url,
          });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local file storage:', cloudErr);
      }
    }

    // 3. Fallback to Local Disk Storage (offline-friendly development fallback)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const sanitizedFilename = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
      const filename = `${Date.now()}-${sanitizedFilename}`;
      const filePath = path.join(uploadDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      const localUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: localUrl,
        local: true,
      });
    } catch (localWriteErr) {
      console.error('Local file write fallback failed:', localWriteErr);
      return NextResponse.json({
        success: false,
        error: 'Upload failed. Cloudinary is offline, and local storage fallback failed due to write permissions on the server.'
      }, { status: 500 });
    }

  } catch (err) {
    console.error('File upload API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
