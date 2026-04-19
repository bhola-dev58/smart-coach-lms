import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User';
import BrowseCoursesClient from '@/components/lms/BrowseCoursesClient';

export const metadata = { title: 'Browse Courses — MeetMe Center' };

export default async function BrowseCoursesPage() {
  await connectDB();

  let courses = await Course.find({ isPublished: true })
    .populate('instructor', 'name')
    .sort({ createdAt: -1 })
    .lean();

  courses = courses.map(c => {
    let computedLessons = 0;
    let computedDurationMinutes = 0;
    if (c.chapters) {
      c.chapters.forEach(ch => {
        if (ch.lessons) {
          ch.lessons.forEach(l => {
            const isAssignment = l.title.toLowerCase().includes('assignment') || l.type === 'assignment';
            if (!isAssignment) {
              computedLessons += 1;
              computedDurationMinutes += (l.duration || 0);
            }
          });
        }
      });
    }
    const hours = Math.floor(computedDurationMinutes / 60);
    const mins = computedDurationMinutes % 60;
    const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      ...c,
      totalLessons: computedLessons,
      formattedTime: formattedTime,
      totalHours: Math.ceil(computedDurationMinutes / 60)
    };
  });

  // Deep serialize — converts ALL nested ObjectIds to plain strings
  const serialized = JSON.parse(JSON.stringify(courses));

  return <BrowseCoursesClient courses={serialized} />;
}
