'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { revalidatePath } from 'next/cache';

/**
 * Creates a basic Draft Course
 */
export async function createCourseDraft(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  await connectDB();

  const title = formData.get('title');
  const category = formData.get('category');
  const price = parseInt(formData.get('price') || '0');
  const shortDescription = formData.get('shortDescription') || '';
  const description = formData.get('description') || shortDescription;
  const originalPrice = parseInt(formData.get('originalPrice') || price);
  const isFree = price === 0;

  // Auto-generate slug
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  try {
    // Check if slug exists to avoid uniqueness errors
    let slugExists = await Course.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCourse = await Course.create({
      title,
      slug,
      category,
      price,
      originalPrice,
      isFree,
      shortDescription,
      description,
      instructor: session.user.id,
      isPublished: false,
    });

    revalidatePath('/instructor/courses');
    return { success: true, courseId: newCourse._id.toString() };
  } catch (err) {
    console.error('Failed to create course draft', err);
    return { success: false, error: 'Failed to create course draft.' };
  }
}

/**
 * Update course details or publish state
 */
export async function updateCourse(courseId, updateData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await connectDB();

  try {
    await Course.findOneAndUpdate(
      { _id: courseId, instructor: session.user.id },
      { $set: updateData }
    );
    
    revalidatePath(`/instructor/courses`);
    revalidatePath(`/lms/browse`);
    revalidatePath(`/lms/courses`);
    revalidatePath(`/`); // Update public home
    
    return { success: true };
  } catch (err) {
    console.error('Failed to update course', err);
    return { success: false, error: 'Failed to update course.' };
  }
}

/**
 * Append a lesson (or chapter)
 */
export async function addChapterToCourse(courseId, chapterTitle) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await connectDB();
  try {
    await Course.findOneAndUpdate(
      { _id: courseId, instructor: session.user.id },
      { $push: { chapters: { title: chapterTitle, lessons: [] } } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Error adding chapter' };
  }
}
