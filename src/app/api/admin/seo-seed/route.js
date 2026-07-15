import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

/**
 * POST /api/admin/seo-seed
 * One-time admin-only route that patches SEO fields on the 4 launched courses.
 * SAFE: only updates seoTitle, seoDescription, seoKeywords, locationTags, targetClass.
 * Never touches chapters, lessons, pricing, enrollments, or any payment data.
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();

  const SEO_DATA = [
    {
      slug: 'dsa-in-python',
      seoTitle: 'DSA in Python Course – Live Classes in Whitefield, Bangalore',
      seoDescription: 'Master Data Structures & Algorithms in Python. Live doubt-clearing for Class 11-12 & coding aspirants in Whitefield, Bangalore. Covers arrays, trees, graphs, DP & 100+ interview problems.',
      seoKeywords: [
        'DSA course Bangalore',
        'DSA in Python',
        'data structures and algorithms course',
        'coding classes Whitefield Bangalore',
        'DSA course for class 12',
        'best DSA course for placements',
        'DSA Python online class',
        'coding interview preparation Bangalore',
      ],
      locationTags: ['Whitefield', 'Bangalore', 'Bengaluru', 'Varthur'],
      targetClass: ['Class 11', 'Class 12'],
      // Language is English — do NOT add "Hindi" or "Programming in Hindi" keywords
    },
    {
      slug: 'mastering-data-structures-and-algorithms-in-java',
      seoTitle: 'DSA in Java Course – Placement-Ready Classes in Bangalore',
      seoDescription: 'Java DSA bootcamp for Class 12 & early coders in Whitefield, Bangalore. Covers recursion, DP, backtracking for software engineering interviews and college placements.',
      seoKeywords: [
        'DSA in Java',
        'Java data structures course Bangalore',
        'best DSA course for placements',
        'coding classes near Whitefield',
        'Java programming classes for students',
        'Java DSA online course',
        'data structures Java Bangalore',
        'coding interview Java class',
      ],
      locationTags: ['Whitefield', 'Bangalore', 'Bengaluru', 'Varthur'],
      targetClass: ['Class 12'],
    },
    {
      slug: 'python-programming-masterclass-zero-to-hero',
      seoTitle: 'Python Programming Course for Beginners – Bangalore & Online',
      seoDescription: 'Learn Python from scratch in Hindi — built for Class 10-12 students in Whitefield, Bangalore and beyond. Covers OOP, file handling, and real-world projects with hands-on exercises.',
      seoKeywords: [
        'Python programming for beginners',
        'Python tutorial for class 11',
        'Python course Bangalore',
        'coding classes for class 10 students',
        'Python course in Hindi',
        'Python programming Whitefield Bangalore',
        'Python beginners online class India',
        'learn Python for class 12 board',
      ],
      locationTags: ['Whitefield', 'Bangalore', 'Bengaluru', 'Varthur'],
      targetClass: ['Class 10', 'Class 11', 'Class 12'],
    },
    {
      slug: 'java-programming-masterclass-core-to-advanced',
      seoTitle: 'Java Programming Course – Core to Advanced (Bangalore & Online)',
      seoDescription: 'Master Java Core to Advanced with hands-on projects — designed for Class 11-12 students in Whitefield, Bangalore. Covers OOPs, Exception Handling, and Collections Framework in Hindi.',
      seoKeywords: [
        'Java programming classes for students',
        'Java course Bangalore',
        'coding classes for class 11',
        'Java programming for beginners',
        'Java course in Hindi',
        'Java programming Whitefield Bangalore',
        'Core Java online course India',
        'Java OOP course for school students',
      ],
      locationTags: ['Whitefield', 'Bangalore', 'Bengaluru', 'Varthur'],
      targetClass: ['Class 11', 'Class 12'],
    },
  ];

  const results = [];

  for (const data of SEO_DATA) {
    const { slug, ...seoFields } = data;
    try {
      const updated = await Course.findOneAndUpdate(
        { slug },
        {
          $set: {
            seoTitle: seoFields.seoTitle,
            seoDescription: seoFields.seoDescription,
            seoKeywords: seoFields.seoKeywords,
            locationTags: seoFields.locationTags,
            targetClass: seoFields.targetClass,
          }
        },
        { new: true, select: 'slug seoTitle seoKeywords locationTags targetClass' }
      );

      if (updated) {
        results.push({ slug, status: 'updated', seoTitle: updated.seoTitle });
      } else {
        results.push({ slug, status: 'not_found' });
      }
    } catch (err) {
      results.push({ slug, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({
    message: 'SEO seed complete',
    results,
  });
}
