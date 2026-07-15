import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gradify.academy';
  const today = new Date().toISOString().split('T')[0];

  // 1. Static routes — ordered by SEO priority
  const staticRoutes = [
    { url: `${baseUrl}`,                                   lastModified: today, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${baseUrl}/courses`,                           lastModified: today, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${baseUrl}/whitefield-bangalore-coaching`,     lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`,                             lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`,                           lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // 2. Fetch all published courses from MongoDB dynamically
  let courseRoutes = [];
  try {
    await connectDB();
    const courses = await Course.find({ isPublished: true })
      .select('slug updatedAt')
      .lean();
    courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: course.updatedAt
        ? new Date(course.updatedAt).toISOString().split('T')[0]
        : today,
      changeFrequency: 'weekly',
      priority: 0.85, // courses rank high — individual pages are primary conversion targets
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...courseRoutes];
}
