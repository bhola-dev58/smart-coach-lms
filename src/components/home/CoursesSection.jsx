import Link from 'next/link';
import EnrollButton from '@/components/courses/EnrollButton';

export default function CoursesSection({ courses = [] }) {
  // Demo student ID while not logged in
  const demoStudentId = "6614f6b2c892864a2f7c32e1"; 

  return (
    <section className="section section-light" id="popular-courses">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Popular Courses</span>
          <h2>Courses Created by Industry Experts</h2>
          <div className="section-divider" />
          <p>
            Structured curriculum designed by IIT alumni, updated with latest
            industry trends.
          </p>
        </div>

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
              Courses coming soon! Stay tuned.
            </p>
          </div>
        ) : (
          <div className="grid grid-3">
            {courses.map((c) => (
              <div className="card" key={c._id || c.slug}>
                <div className="card-img-wrapper">
                  <img
                    src={c.thumbnail || '/images/courses/default.jpg'}
                    alt={c.title}
                    className="card-img"
                  />
                  <span className="course-category badge badge-primary">
                    {c.category}
                  </span>
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
                      {c.totalHours} Hours
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
                        id={`details-${c.slug}`}
                      >
                        More Details
                      </Link>
                      <EnrollButton
                        courseId={c._id.toString()}
                        studentId={demoStudentId}
                        amount={c.price}
                        courseTitle={c.title}
                        className="btn btn-primary btn-sm"
                        style={{}} // override default 100% width/padding from original EnrollButton
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

        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link href="/courses" className="btn btn-outline btn-lg" id="view-all-courses-btn">
            View All Courses →
          </Link>
        </div>
      </div>
    </section>
  );
}

