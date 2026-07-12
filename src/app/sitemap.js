import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gradify.academy';

  // 1. Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/courses',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch all published courses from MongoDB dynamically
  let courseRoutes = [];
  try {
    await connectDB();
    const courses = await Course.find({ isPublished: true }).select('slug updatedAt').lean();
    courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: new (course.updatedAt || Date)().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...courseRoutes];
}
