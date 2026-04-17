'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import StudyMaterial from '@/models/StudyMaterial';
import { revalidatePath } from 'next/cache';

export async function uploadStudyMaterial(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  await connectDB();

  const title = formData.get('title');
  const courseId = formData.get('courseId');
  const fileUrl = formData.get('fileUrl'); // Expected from AWS S3 / Cloudinary client upload
  const fileType = formData.get('fileType') || 'PDF';
  const size = formData.get('size') || 'Unknown';

  if (!title || !courseId || !fileUrl) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    const newDoc = await StudyMaterial.create({
      title,
      course: courseId,
      instructor: session.user.id,
      fileUrl,
      fileType,
      size
    });

    revalidatePath('/instructor/materials');
    revalidatePath('/lms/materials');
    
    return { success: true };
  } catch (err) {
    console.error('Failed to upload material', err);
    return { success: false, error: 'Failed to upload material to DB.' };
  }
}

export async function deleteStudyMaterial(id) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await connectDB();
  await StudyMaterial.findOneAndDelete({ _id: id, instructor: session.user.id });

  revalidatePath('/instructor/materials');
  revalidatePath('/lms/materials');
  
  return { success: true };
}
