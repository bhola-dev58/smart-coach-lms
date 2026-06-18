// ============================================================
// 🔔 NOTIFICATIONS API — /api/notifications
// GET  — Fetch notifications for current user
// PATCH — Mark all as read
// ============================================================
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

// GET /api/notifications?page=1&limit=20&unreadOnly=false
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    await connectDB();

    const filter = { recipient: session.user.id };
    if (unreadOnly) filter.isRead = false;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: session.user.id, isRead: false }),
      Notification.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[Notifications GET Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/notifications — Mark all as read
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { recipient: session.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[Notifications PATCH Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
