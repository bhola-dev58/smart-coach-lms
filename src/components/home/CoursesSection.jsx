import Link from 'next/link';
import EnrollButton from '@/components/courses/EnrollButton';
import { getFormattedCategory, getFormattedClasses } from '@/lib/courseFormat';

export default function CoursesSection({ courses = [] }) {

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 360px))', gap: '1.5rem', justifyContent: 'center' }}>
            {courses.map((c, i) => (
              <div
                className="card animate-fade-in-up"
                key={c._id || c.slug}
                style={{ animationDelay: `${i * 150}ms`, maxWidth: '360px', width: '100%', margin: '0 auto' }}
              >
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
                </div>
                <div className="card-body">
                  {/* Header Row: Title + Category Subtitle Tag */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 className="card-title" style={{ margin: 0, flex: 1 }}>{c.title}</h3>
                    {c.category && (
                      <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {getFormattedCategory(c.category)}
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
                    {/* Price Row: Price + Target Class Badge */}
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

