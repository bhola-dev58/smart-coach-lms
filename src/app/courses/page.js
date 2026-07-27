import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User'; // Register User schema for populate('instructor')
import EnrollButton from '@/components/courses/EnrollButton';
import CategoryDropdown from '@/components/courses/CategoryDropdown';
import CourseFilterToolbar from '@/components/courses/CourseFilterToolbar';
import Category from '@/models/Category';
import { getFormattedCategory, getFormattedClasses, getFormattedLevels } from '@/lib/courseFormat';

export const metadata = {
  title: 'All Courses | Gradify Academy',
  description:
    'Explore courses at Gradify Academy — Mathematics, Physics, Chemistry, Biology, Olympiad & Board Prep for Class 8, 9, 10, 11, and 12. Expert faculty, affordable pricing.',
};

export default async function CoursesPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;
  const category = params.category;
  const targetClass = params.class || params.targetClass;
  const level = params.level;
  const sort = params.sort || 'popular';
  const searchQuery = params.q || '';

  const filter = { isPublished: true };
  if (category && category !== 'All') {
    const catList = category.split(',').filter(Boolean);
    filter.category = catList.length > 1 ? { $in: catList } : catList[0];
  }
  if (targetClass && targetClass !== 'All') {
    const classList = targetClass.split(',').filter(Boolean);
    filter.targetClass = { $in: [...classList, 'All Classes'] };
  }
  if (level && level !== 'All') {
    const levelList = level.split(',').filter(Boolean);
    filter.level = { $in: [...levelList, 'All Levels', 'All'] };
  }
  if (searchQuery) {
    filter.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { shortDescription: { $regex: searchQuery, $options: 'i' } },
    ];
  }

  let sortQuery = {};
  if (sort === 'popular') sortQuery = { totalStudents: -1 };
  else if (sort === 'price-low') sortQuery = { price: 1 };
  else if (sort === 'price-high') sortQuery = { price: -1 };
  else if (sort === 'rating') sortQuery = { rating: -1 };
  else if (sort === 'newest') sortQuery = { publishedAt: -1 };

  // Parallel execution of courses search and categories fetch for fast performance
  const [coursesRaw, categoriesFromDb] = await Promise.all([
    Course.find(filter)
      .select('title shortDescription description category targetClass level price originalPrice thumbnail slug isPublished isFeatured totalStudents rating publishedAt chapters instructor')
      .populate('instructor', 'name avatar')
      .sort(sortQuery)
      .lean(),
    Category.find({ isActive: true }).sort({ label: 1 }).select('name label').lean(),
  ]);

  // Dynamically compute runtime stats
  const courses = coursesRaw.map(c => {
    let computedLessons = 0;
    let computedDurationMinutes = 0;
    if (c.chapters) {
      c.chapters.forEach(ch => {
        if (ch.lessons) {
          ch.lessons.forEach(l => {
            const isAssignment = l.title ? (l.title.toLowerCase().includes('assignment') || l.type === 'assignment') : false;
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

  const allCategories = categoriesFromDb.map(c => c.name);
  const categoryLabels = categoriesFromDb.reduce((acc, c) => {
    acc[c.name] = c.label;
    return acc;
  }, {});

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Gradify Academy Courses",
    "description": "Explore coaching courses for Mathematics, Physics, Chemistry, Biology, Olympiad & Board Prep.",
    "url": "https://gradify.academy/courses",
    "numberOfItems": courses.length,
    "itemListElement": courses.map((c, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://gradify.academy/courses/${c.slug}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="page-banner">
        <div className="container">
          <h1>All Courses</h1>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <span className="current">Courses</span>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Multi-Filter Toolbar (Class, Category, Level, Search, Sort) ── */}
          <CourseFilterToolbar categories={allCategories} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-6)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Showing{' '}
              <strong style={{ color: 'var(--color-text)' }}>
                {courses.length}
              </strong>{' '}
              courses
              {category ? ` in ${categoryLabels[category] || category}` : ''}
              {targetClass && targetClass !== 'All' ? ` (${targetClass})` : ''}
              {level && level !== 'All' ? ` • ${level}` : ''}
            </span>
          </div>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
              <h3 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                No courses found
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                No matching courses found for your selected filters. Try choosing a different class or category.
              </p>
              <Link
                href="/courses"
                className="btn btn-outline btn-md"
                style={{ marginTop: 'var(--space-4)' }}
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 360px))', gap: '1.5rem', justifyContent: 'center' }}>
              {courses.map((c) => (
                <div className="card" key={c._id.toString()} style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>
                  <div className="card-img-wrapper">
                    <img
                      src={c.thumbnail || '/images/courses/default.jpg'}
                      alt=""
                      className="card-img-blur"
                      aria-hidden="true"
                    />
                    <img
                      src={c.thumbnail || '/images/courses/default.jpg'}
                      alt={`${c.title} — Gradify Academy course thumbnail`}
                      className="card-img"
                      loading="lazy"
                    />
                    {c.isFeatured && (
                      <span
                        className="badge badge-dark"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          zIndex: 2,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    {/* Header Row: Title + Category Subtitle Tag */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <h3 className="card-title" style={{ margin: 0, flex: 1 }}>{c.title}</h3>
                      {c.category && (
                        <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {getFormattedCategory(c.category, categoryLabels)}
                        </span>
                      )}
                    </div>

                    <p className="card-text">
                      {c.shortDescription || c.description}
                    </p>
                    <div className="course-meta">
                      <span className="course-meta-item">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {c.formattedTime || `${c.totalHours}h`}
                      </span>
                      <span className="course-meta-item">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                        {c.totalStudents?.toLocaleString('en-IN')}
                      </span>
                      <span className="course-meta-item">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                        {c.totalLessons} Lessons
                      </span>
                      <span className="course-meta-item">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {c.rating}
                      </span>
                    </div>
                    <div className="course-price">
                      {/* Price Row: Price + Target Class & Level Badges */}
                      <div className="course-price-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div>
                          <span className="price-amount">
                            ₹{c.price?.toLocaleString('en-IN')}
                          </span>
                          {c.originalPrice > 0 && (
                            <span className="price-original">
                              ₹{c.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {getFormattedClasses(c.targetClass) && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                            {getFormattedClasses(c.targetClass)}
                          </span>
                        )}
                        {getFormattedLevels(c.level) && (
                          <span style={{ fontSize: '0.675rem', fontWeight: 500, padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }}>
                            {getFormattedLevels(c.level)}
                          </span>
                        )}
                      </div>
                      <div className="course-btn-group">
                        <Link
                          href={`/courses/${c.slug}`}
                          className="btn btn-outline btn-sm"
                        >
                          More Details
                        </Link>
                        <EnrollButton
                          courseId={c._id.toString()}
                          amount={c.price}
                          courseTitle={c.title}
                          className="btn btn-primary btn-sm"
                          style={{}}
                        >
                          Enroll Now
                        </EnrollButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <div>
            <h2>Can&apos;t Find What You&apos;re Looking For?</h2>
            <p>
              Talk to our academic counselors to find the perfect course.
            </p>
          </div>
          <Link href="/contact" className="btn btn-white btn-lg">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
