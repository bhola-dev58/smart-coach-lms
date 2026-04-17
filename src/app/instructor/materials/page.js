import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import StudyMaterial from '@/models/StudyMaterial';
import MaterialDashboardClient from '@/components/instructor/MaterialDashboardClient';

export const metadata = { title: 'Study Materials | Instructor Panel' };

export default async function InstructorMaterialsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Get instructor courses for dropdown
  const coursesRaw = await Course.find({ instructor: session.user.id }).select('_id title').lean();
  const courses = coursesRaw.map(c => ({ _id: c._id.toString(), title: c.title }));

  // Get uploaded materials
  const materialsRaw = await StudyMaterial.find({ instructor: session.user.id })
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const materials = materialsRaw.map(m => ({
    _id: m._id.toString(),
    title: m.title,
    fileType: m.fileType,
    size: m.size,
    fileUrl: m.fileUrl,
    courseTitle: m.course?.title || 'General',
    createdAt: m.createdAt.toISOString()
  }));

  return <MaterialDashboardClient courses={courses} materials={materials} />;
}
