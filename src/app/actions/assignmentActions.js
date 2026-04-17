'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import { revalidatePath } from 'next/cache';

export async function createAssignment(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  await connectDB();

  const title = formData.get('title');
  const courseId = formData.get('courseId');
  const totalMarks = parseInt(formData.get('totalMarks') || '100');
  const dueDate = formData.get('dueDate');

  if (!title || !courseId || !dueDate) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    await Assignment.create({
      title,
      course: courseId,
      instructor: session.user.id,
      totalMarks,
      dueDate: new Date(dueDate)
    });

    revalidatePath('/instructor/assignments');
    revalidatePath('/lms/tests'); // Assume student views assignments in tests module
    
    return { success: true };
  } catch (err) {
    console.error('Failed to create assignment', err);
    return { success: false, error: 'Failed to create assignment to DB.' };
  }
}
