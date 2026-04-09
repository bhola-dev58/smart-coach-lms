import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export const metadata = {
  title: 'All Courses',
  description: 'Explore 50+ B.Tech courses at MeetMe Center — CSE, ECE, Mechanical, GATE Prep. Expert faculty, affordable pricing.',
};

export default async function CoursesPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || 'popular';

  const filter = { isPublished: true };
  if (category) filter.category = category;

  let sortQuery = {};
  if (sort === 'popular') sortQuery = { totalStudents: -1 };
  else if (sort === 'price-low') sortQuery = { price: 1 };
  else if (sort === 'price-high') sortQuery = { price: -1 };
  else if (sort === 'rating') sortQuery = { rating: -1 };

  const courses = await Course.find(filter).sort(sortQuery).lean();

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>Our Courses</h1>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <span className="current">Courses</span>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Showing <strong style={{ color: 'var(--color-text)' }}>{courses.length}</strong> courses
            </span>
            <select className="form-select" style={{ width: 'auto', fontSize: 'var(--text-sm)' }}>
              <option>Sort by: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: Highest</option>
            </select>
          </div>

          <div className="grid grid-3">
            {courses.map((c, i) => (
              <div className="card" key={i}>
                <div className="card-img-wrapper">
                  <img src={c.thumbnail || '/images/courses/default.jpg'} alt={c.title} className="card-img" />
                  <span className="course-category badge badge-primary">{c.category}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{c.title}</h3>
                  <p className="card-text">{c.shortDescription || c.description}</p>
                  <div className="course-meta">
                    <span className="course-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {c.totalHours} Hours
                    </span>
                    <span className="course-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      {c.totalStudents?.toLocaleString('en-IN')}
                    </span>
                    <span className="course-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {c.rating}
                    </span>
                  </div>
                  <div className="course-price">
                    <div>
                      <span className="price-amount">₹{c.price?.toLocaleString('en-IN')}</span>
                      {c.originalPrice > 0 && <span className="price-original">₹{c.originalPrice?.toLocaleString('en-IN')}</span>}
                    </div>
                    <Link href={`/courses/${c.slug}`} className="btn btn-primary btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <div><h2>Can&apos;t Find What You&apos;re Looking For?</h2><p>Talk to our academic counselors to find the perfect course.</p></div>
          <Link href="/contact" className="btn btn-white btn-lg">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
