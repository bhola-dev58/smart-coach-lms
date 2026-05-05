import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import LiveRoom from '@/models/LiveRoom';

// ============================================
// 🎥 LIVE ROOM API (WebRTC Live Classes)
// Create, join, and manage live classroom rooms
// ============================================

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET: List rooms or get a specific room
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');
    const courseId = searchParams.get('courseId');

    await connectDB();

    if (roomCode) {
      // Get specific room
      const room = await LiveRoom.findOne({ roomCode })
        .populate('host', 'name email avatar')
        .lean();

      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, room });
    }

    // List rooms (for instructor: their rooms, for students: available rooms)
    const filter = {};
    if (session.user.role === 'instructor') {
      filter.host = session.user.id;
    } else if (courseId) {
      filter.course = courseId;
    }
    filter.status = { $in: ['scheduled', 'live'] };

    const rooms = await LiveRoom.find(filter)
      .populate('host', 'name avatar')
      .sort({ scheduledAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error('Live room GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new room or join/leave/chat in existing room
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    await connectDB();

    switch (action) {
      case 'create': {
        // Only instructors/admins can create rooms
        if (!['instructor', 'admin'].includes(session.user.role)) {
          return NextResponse.json({ success: false, error: 'Only instructors can create live rooms' }, { status: 403 });
        }

        let roomCode = generateRoomCode();
        while (await LiveRoom.findOne({ roomCode })) {
          roomCode = generateRoomCode();
        }

        const room = await LiveRoom.create({
          title: body.title || 'Live Class',
          description: body.description || '',
          roomCode,
          host: session.user.id,
          course: body.courseId || undefined,
          maxParticipants: body.maxParticipants || 100,
          allowChat: body.allowChat !== false,
          allowScreenShare: body.allowScreenShare !== false,
          allowStudentVideo: body.allowStudentVideo || false,
          allowStudentAudio: body.allowStudentAudio !== false,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
          status: 'scheduled',
        });

        return NextResponse.json({ success: true, room, roomCode });
      }

      case 'start': {
        const room = await LiveRoom.findOne({ roomCode: body.roomCode, host: session.user.id });
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found or unauthorized' }, { status: 404 });
        }
        room.status = 'live';
        room.startedAt = new Date();
        await room.save();
        return NextResponse.json({ success: true, room });
      }

      case 'join': {
        const room = await LiveRoom.findOne({ roomCode: body.roomCode });
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }

        // Check if already joined
        const alreadyJoined = room.participants.some(
          p => p.user?.toString() === session.user.id && !p.leftAt
        );

        if (!alreadyJoined) {
          if (room.participants.filter(p => !p.leftAt).length >= room.maxParticipants) {
            return NextResponse.json({ success: false, error: 'Room is full' }, { status: 400 });
          }

          room.participants.push({
            user: session.user.id,
            name: session.user.name,
            role: room.host.toString() === session.user.id ? 'host' : 'student',
            joinedAt: new Date(),
          });
          await room.save();
        }

        return NextResponse.json({ success: true, room });
      }

      case 'leave': {
        const room = await LiveRoom.findOne({ roomCode: body.roomCode });
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }

        const participant = room.participants.find(
          p => p.user?.toString() === session.user.id && !p.leftAt
        );
        if (participant) {
          participant.leftAt = new Date();
          await room.save();
        }

        return NextResponse.json({ success: true, message: 'Left room' });
      }

      case 'chat': {
        const room = await LiveRoom.findOne({ roomCode: body.roomCode });
        if (!room || !room.allowChat) {
          return NextResponse.json({ success: false, error: 'Chat unavailable' }, { status: 400 });
        }

        room.messages.push({
          user: session.user.id,
          userName: session.user.name,
          message: body.message,
          timestamp: new Date(),
        });

        // Keep only last 500 messages to prevent bloat
        if (room.messages.length > 500) {
          room.messages = room.messages.slice(-500);
        }

        await room.save();
        return NextResponse.json({ success: true, message: 'Message sent' });
      }

      case 'end': {
        const room = await LiveRoom.findOne({ roomCode: body.roomCode, host: session.user.id });
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found or unauthorized' }, { status: 404 });
        }

        room.status = 'ended';
        room.endedAt = new Date();
        // Mark all active participants as left
        room.participants.forEach(p => {
          if (!p.leftAt) p.leftAt = new Date();
        });
        await room.save();

        return NextResponse.json({ success: true, message: 'Room ended' });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Live room POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
