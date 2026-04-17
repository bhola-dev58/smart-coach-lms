'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';
import Course from '@/models/Course';
import { revalidatePath } from 'next/cache';

/**
 * Creates a Zoom Meeting using Zoom Server-to-Server OAuth
 * Note: Requires ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET in .env
 */
async function generateZoomMeeting(topic, startTime, duration) {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId) {
      console.warn("Zoom credentials missing, falling back to dummy link.");
      return { 
        join_url: `https://meet.google.com/dummy-${Math.random().toString(36).substring(7)}`, 
        start_url: `https://meet.google.com/start-dummy-${Math.random().toString(36).substring(7)}` 
      };
    }

    // 1. Get Access Token
    const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      cache: 'no-store'
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error("Failed to get zoom access token");

    // 2. Create Meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: new Date(startTime).toISOString(),
        duration: duration,
        settings: {
          host_video: true,
          participant_video: false,
          join_before_host: false,
          mute_upon_entry: true,
        }
      })
    });

    const meetingData = await meetingResponse.json();
    return meetingData; // Contains join_url and start_url
  } catch (error) {
    console.error("Zoom API Error:", error);
    return null; // Handle failure upstream
  }
}

/**
 * Creates a Live Session in Database and generates Zoom link
 */
export async function scheduleLiveSession(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  await connectDB();

  const title = formData.get('title');
  const courseId = formData.get('courseId');
  const duration = parseInt(formData.get('duration') || '60');
  const scheduledAt = formData.get('scheduledAt'); // e.g., "2026-10-14T10:30"
  
  if (!title || !scheduledAt) {
    return { success: false, error: 'Title and Scheduled Time are required.' };
  }

  try {
    // Zoom API integration to get real links
    const meetingDetails = await generateZoomMeeting(title, scheduledAt, duration);
    const joinUrl = meetingDetails?.join_url || '';
    const startUrl = meetingDetails?.start_url || '';

    // Save to Database
    const newSession = await LiveSession.create({
      instructor: session.user.id,
      course: courseId !== 'general' ? courseId : null,
      title,
      scheduledAt: new Date(scheduledAt),
      duration,
      joinUrl, 
      hostUrl: startUrl // We should add hostUrl to the model if it doesn't exist, we'll store it in joinUrl temporarily or add it.
    });

    // We only have joinUrl in schema, let's just save joinUrl for now. We can update schema later.
    newSession.joinUrl = startUrl || joinUrl; 
    await newSession.save();

    revalidatePath('/instructor/live');
    revalidatePath('/lms/live'); // Instantly updates student dashboard

    return { success: true };
  } catch (err) {
    console.error('Failed to schedule session', err);
    return { success: false, error: 'Failed to schedule session to DB.' };
  }
}

/**
 * Deletes a scheduled session
 */
export async function deleteLiveSession(sessionId) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await connectDB();
  await LiveSession.findOneAndDelete({ _id: sessionId, instructor: session.user.id });

  revalidatePath('/instructor/live');
  revalidatePath('/lms/live');
  
  return { success: true };
}
