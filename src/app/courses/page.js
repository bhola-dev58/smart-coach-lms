import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User'; // Register User schema for populate('instructor')
import EnrollButton from '@/components/courses/EnrollButton';

export const metadata = {
  title: 'All Courses | MeetMe Center',
  description:
    'Explore 50+ B.Tech courses at MeetMe Center — CSE, ECE, Mechanical, GATE Prep. Expert faculty, affordable pricing.',
};

export default async function CoursesPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || 'popular';
  const searchQuery = params.q || '';

  const filter = { isPublished: true };
  if (category) filter.category = category;
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

  let courses = await Course.find(filter)
    .populate('instructor', 'name avatar')
    .sort(sortQuery)
    .lean();

  // Dynamically compute runtime stats
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

  // All unique categories for filter tabs
  const allCategories = await Course.distinct('category', { isPublished: true });

  return (
    <>
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
          
          <div 
            className="courses-toolbar"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: 'var(--space-6)',
              background: 'var(--color-surface)',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              flexWrap: 'wrap'
            }}
          >
            {/* Category Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                flex: 1
              }}
            >
              <Link
                href={`/courses${searchQuery ? `?q=${searchQuery}` : ''}`}
                className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '20px' }}
              >
                All
              </Link>
              {allCategories.map((cat) => (
                <Link
                  href={`/courses?category=${cat}${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                  key={cat}
                  style={{ borderRadius: '20px' }}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Search Bar Navbar Style */}
            <form method="GET" action="/courses" style={{ display: 'flex', gap: '0.5rem', minWidth: '300px', flex: '0 1 auto' }}>
               <input 
                 type="search" 
                 name="q" 
                 defaultValue={searchQuery}
                 placeholder="Search courses..." 
                 style={{
                   flex: 1, padding: '0.6rem 1rem', borderRadius: '20px',
                   border: '1px solid var(--color-border)', outline: 'none',
                   fontSize: '0.9rem', color: 'var(--color-text)', background: 'var(--color-background)'
                 }}
               />
               {category && <input type="hidden" name="category" value={category} />}
               <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1.25rem', borderRadius: '20px' }}>
                 Search
               </button>
            </form>
          </div>

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
              {category ? ` in ${category}` : ''}
            </span>
          </div>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
              <h3 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                No courses found
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {category
                  ? `No courses available in the "${category}" category yet.`
                  : 'New courses are being added soon!'}
              </p>
              <Link
                href="/courses"
                className="btn btn-outline btn-md"
                style={{ marginTop: 'var(--space-4)' }}
              >
                View All Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {courses.map((c) => (
                <div className="card" key={c._id.toString()}>
                  <div className="card-img-wrapper">
                    <img
                      src={c.thumbnail || '/images/courses/default.jpg'}
                      alt={c.title}
                      className="card-img"
                    />
                    <span className="course-category badge badge-primary">
                      {c.category}
                    </span>
                    {c.isFeatured && (
                      <span
                        className="badge badge-dark"
                        style={{
                          position: 'absolute',
                          top: 'var(--space-3)',
                          right: 'var(--space-3)',
                          fontSize: '0.65rem',
                        }}
                      >
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{c.title}</h3>
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
                      <div className="course-price-row">
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
