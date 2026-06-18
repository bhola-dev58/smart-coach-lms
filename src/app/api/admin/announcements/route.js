// ============================================================
// 📢 ADMIN ANNOUNCEMENTS API — /api/admin/announcements
// POST — Create announcement + notify ALL active students
//         (in-app notification + email broadcast)
// GET  — List recent announcements
// ============================================================
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';
import { sendAnnouncementEmail } from '@/lib/email';

// GET /api/admin/announcements
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'instructor'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'name')
      .lean();

    return NextResponse.json({ success: true, announcements });
  } catch (err) {
    console.error('[Announcements GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST /api/admin/announcements — Broadcast to all students
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { title, content, type = 'general', targetRole = 'all' } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required.' }, { status: 400 });
    }

    await connectDB();

    // ── Save announcement to DB ──
    const announcement = await Announcement.create({
      title,
      content,
      type,
      author: session.user.id,
      isPublished: true,
    });

    // ── Get all active users to notify ──
    const roleFilter = targetRole === 'all'
      ? { isActive: true }
      : { isActive: true, role: targetRole };

    const users = await User.find(roleFilter).select('_id email').lean();

    if (users.length > 0) {
      const userIds = users.map(u => u._id.toString());
      const emails = users.map(u => u.email).filter(Boolean);

      // ── In-app notifications (bulk) ──
      createNotification(
        userIds,
        'announcement',
        `📢 ${title}`,
        content.length > 120 ? content.substring(0, 120) + '…' : content,
        '/lms/notifications'
      );

      // ── Email broadcast (non-blocking, chunked for safety) ──
      const CHUNK_SIZE = 50;
      const sendChunk = async (chunk) => {
        await sendAnnouncementEmail(chunk, title, content);
      };
      for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
        sendChunk(emails.slice(i, i + CHUNK_SIZE))
          .catch(err => console.error('[Announcement email chunk error]', err.message));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Announcement published and sent to ${users.length} users.`,
      announcementId: announcement._id.toString(),
      notifiedCount: users.length,
    }, { status: 201 });

  } catch (err) {
    console.error('[Announcements POST]', err);
    return NextResponse.json({ success: false, error: 'Failed to create announcement' }, { status: 500 });
  }
}
