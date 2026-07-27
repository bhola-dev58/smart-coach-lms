import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import LmsCourseDetail from '@/components/lms/LmsCourseDetail';
import CourseSchema from '@/components/courses/CourseSchema';
import styles from '@/app/lms/lms.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();

  if (!course) return { title: 'Course Not Found | Gradify Academy' };

  // Use DB-seeded SEO fields; fall back to title/shortDescription if not yet seeded
  const title = course.seoTitle?.trim()
    ? course.seoTitle
    : `${course.title} | Gradify Academy`;

  const description = course.seoDescription?.trim()
    ? course.seoDescription
    : (course.shortDescription?.slice(0, 155) || course.description?.slice(0, 155) || '');

  const keywords = course.seoKeywords?.length
    ? course.seoKeywords.join(', ')
    : [course.title, course.category, 'Gradify Academy', 'Online Course'].filter(Boolean).join(', ');

  const thumbnail = course.thumbnail || '';
  const canonicalUrl = `https://gradify.academy/courses/${course.slug}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      images: thumbnail ? [{ url: thumbnail, alt: `${course.title} — Gradify Academy` }] : [],
      url: canonicalUrl,
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  };
}

export default async function CourseDetailsPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug })
    .populate('instructor', 'name bio specialization')
    .lean();

  if (!course) notFound();

  // Fetch up to 3 other published courses for cross-linking (excluding current)
  const relatedCourses = await Course.find({
    isPublished: true,
    slug: { $ne: slug },
  })
    .select('slug title shortDescription thumbnail category price originalPrice rating totalStudents')
    .sort({ totalStudents: -1 })
    .limit(3)
    .lean();

  let computedLessons = 0;
  let computedDurationMinutes = 0;
  if (course.chapters) {
    course.chapters.forEach(ch => {
      if (ch.lessons) {
        ch.lessons.forEach(l => {
          const isAssignment = l.title?.toLowerCase().includes('assignment') || l.type === 'assignment';
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

  const serialized = JSON.parse(JSON.stringify({
    ...course,
    totalLessons: computedLessons,
    formattedTime,
    totalHours: Math.ceil(computedDurationMinutes / 60),
  }));

  const serializedRelated = JSON.parse(JSON.stringify(relatedCourses));

  const categoryLabels = {
    MATHS: 'Mathematics', SCIENCE: 'Science', COMMERCE: 'Commerce',
    ARTS: 'Arts', GENERAL: 'General', COMPUTER_SCIENCE: 'Computer Science',
  };

  return (
    <>
      {/* Structured JSON-LD schemas: Course, FAQPage (if applicable), BreadcrumbList, AggregateRating (if reviews exist) */}
      <CourseSchema course={serialized} />

      {/* Star rating summary — only show when reviews exist */}
      {serialized.totalRatings > 0 && (
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.6rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem', marginRight: '0.4rem' }}>
            {'★'.repeat(Math.round(serialized.rating))}{'☆'.repeat(5 - Math.round(serialized.rating))}
          </span>
          <strong style={{ color: 'var(--color-text)' }}>{serialized.rating}</strong>/5
          &nbsp;·&nbsp;{serialized.totalRatings} review{serialized.totalRatings !== 1 ? 's' : ''}
        </div>
      )}

      <div className={styles.lmsWrapper} style={{ minHeight: '80vh', background: 'var(--dash-bg)', width: '100%', padding: '1.5rem 0' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <LmsCourseDetail course={serialized} backLink="/courses" />
        </div>
      </div>

      {/* ── Related Courses Cross-Links ─────────────────────── */}
      {serializedRelated.length > 0 && (
        <section style={{ background: 'var(--color-bg-light, #f8f9fc)', padding: '3rem 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              More Courses You Might Like
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Continue your learning journey with these popular courses at Gradify Academy
            </p>
            <div className="grid grid-3">
              {serializedRelated.map((c) => (
                <div className="card" key={c.slug} style={{ transition: 'transform 0.2s' }}>
                  <div className="card-img-wrapper">
                    <img
                      src={c.thumbnail || '/images/courses/default.jpg'}
                      alt={`${c.title} — Gradify Academy course thumbnail`}
                      className="card-img"
                      loading="lazy"
                    />
                    <span className="course-category badge badge-primary">
                      {categoryLabels[c.category] || c.category}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{c.title}</h3>
                    <p className="card-text" style={{ fontSize: '0.85rem' }}>
                      {c.shortDescription?.slice(0, 90) || ''}
                    </p>
                    <div className="course-price">
                      <div className="course-price-row">
                        <span className="price-amount">₹{c.price?.toLocaleString('en-IN')}</span>
                        {c.originalPrice > 0 && (
                          <span className="price-original">₹{c.originalPrice?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <div className="course-btn-group" style={{ marginTop: '0.5rem' }}>
                        <Link
                          href={`/courses/${c.slug}`}
                          className="btn btn-primary btn-sm"
                          id={`related-${c.slug}`}
                          style={{ width: '100%', textAlign: 'center' }}
                        >
                          View Course →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
