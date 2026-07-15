import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import EnrollButton from '@/components/courses/EnrollButton';

export const metadata = {
  title: 'Coding Classes in Whitefield, Bangalore | Gradify Academy',
  description:
    'Join live online coding & school coaching classes from Whitefield, Bangalore. Python, Java, DSA, CBSE board prep for Class 8-12 by IIT-trained faculty. ₹999 onwards.',
  keywords: [
    'coding classes Whitefield Bangalore',
    'online tuition near Whitefield',
    'programming course Bengaluru',
    'best coaching institute Whitefield',
    'DSA course Bangalore',
    'Python classes for school students Bangalore',
    'Java programming Whitefield Bengaluru',
    'CBSE coaching Whitefield',
    'Class 11 12 coaching Bangalore',
    'Gradify Academy Whitefield',
  ].join(', '),
  alternates: {
    canonical: 'https://gradify.academy/whitefield-bangalore-coaching',
  },
  openGraph: {
    title: 'Coding Classes in Whitefield, Bangalore | Gradify Academy',
    description:
      'Live online coding & board coaching in Whitefield, Bangalore — Python, Java, DSA, Class 8-12 CBSE prep. Learn from IITian faculty at affordable prices.',
    url: 'https://gradify.academy/whitefield-bangalore-coaching',
    type: 'website',
    locale: 'en_IN',
  },
};

// LocalBusiness + ItemList schema for the landing page
const localPageSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gradify.academy' },
      { '@type': 'ListItem', position: 2, name: 'Whitefield Bangalore Coaching', item: 'https://gradify.academy/whitefield-bangalore-coaching' },
    ],
  },
];

const categoryLabels = {
  MATHS: 'Mathematics', SCIENCE: 'Science', COMMERCE: 'Commerce',
  ARTS: 'Arts', GENERAL: 'General', COMPUTER_SCIENCE: 'Computer Science',
};

export default async function WhitefieldBangaloreCoachingPage() {
  await connectDB();
  const courses = await Course.find({ isPublished: true })
    .populate('instructor', 'name')
    .sort({ totalStudents: -1 })
    .lean();

  const serializedCourses = JSON.parse(JSON.stringify(courses));

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gradify Academy Courses — Whitefield, Bangalore',
    description: 'Online coding and school coaching courses available for students in Whitefield, Bangalore.',
    url: 'https://gradify.academy/whitefield-bangalore-coaching',
    numberOfItems: serializedCourses.length,
    itemListElement: serializedCourses.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://gradify.academy/courses/${c.slug}`,
    })),
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      {localPageSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="page-banner" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a3a6b 100%)' }}>
        <div className="container">
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.3rem 0.9rem', borderRadius: '20px', marginBottom: '1rem', textTransform: 'uppercase' }}>
            📍 Whitefield • Varthur • Bangalore
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', marginBottom: '1rem', lineHeight: 1.3 }}>
            Live Coding & School Coaching Classes<br />in Whitefield, Bangalore
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '680px', marginBottom: '2rem', lineHeight: 1.7 }}>
            Expert online coaching for Class 8-12 students in Whitefield, Varthur, and across Bengaluru.
            Python, Java, DSA, and CBSE/ICSE board prep — taught live by IIT-trained faculty in Hindi & English.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/courses" className="btn btn-white btn-lg">Browse All Courses</Link>
            <Link href="/contact" className="btn btn-outline-white btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
              Free Counselling →
            </Link>
          </div>
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <span className="separator" style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            <span className="current" style={{ color: '#fff' }}>Whitefield Bangalore Coaching</span>
          </nav>
        </div>
      </div>

      {/* ── Why Gradify? Trust Signals ──────────────────────── */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2>Why Whitefield Students Choose Gradify Academy</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-3" style={{ marginTop: '2rem', gap: '1.5rem' }}>
            {[
              { icon: '🎓', title: 'IIT-Trained Faculty', desc: 'Every instructor holds a degree from IIT or NIT with 5+ years of teaching and industry experience.' },
              { icon: '📺', title: 'Live + Recorded Classes', desc: 'Attend live sessions or revisit recordings anytime — perfect for students near Whitefield with busy schedules.' },
              { icon: '📝', title: 'Board Exam Focused', desc: 'Curriculum mapped to CBSE/ICSE syllabus. Regular mock tests and revision sessions targeting 95%+ scores.' },
              { icon: '💻', title: 'Hands-On Projects', desc: 'Build real-world Python and Java projects. Complete DSA challenges that mirror actual placement interview questions.' },
              { icon: '🏆', title: 'Verified Certificate', desc: 'Earn a Gradify Academy certificate upon completion — recognized by companies and higher education institutes.' },
              { icon: '💰', title: 'Affordable Pricing', desc: 'Quality coaching starting at ₹999. EMI options available. No hidden fees for students from Whitefield & Bangalore.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course Grid ─────────────────────────────────────── */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Available Now</span>
            <h2>Courses Available for Whitefield, Bangalore Students</h2>
            <div className="section-divider" />
            <p>Structured curriculum designed by IIT alumni, updated with latest industry and board exam trends.</p>
          </div>

          {serializedCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Courses coming soon. <Link href="/contact">Contact us</Link> to be notified.</p>
            </div>
          ) : (
            <div className="grid grid-3" style={{ marginTop: '2rem' }}>
              {serializedCourses.map((c) => (
                <div className="card" key={c._id?.toString() || c.slug}>
                  <div className="card-img-wrapper">
                    <img
                      src={c.thumbnail || '/images/courses/default.jpg'}
                      alt={`${c.title} course — Gradify Academy Whitefield Bangalore`}
                      className="card-img"
                      loading="lazy"
                    />
                    <span className="course-category badge badge-primary">
                      {categoryLabels[c.category] || c.category}
                    </span>
                    {c.isFeatured && (
                      <span className="badge badge-dark" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', fontSize: '0.65rem' }}>
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{c.title}</h3>
                    <p className="card-text">{c.shortDescription || c.description?.slice(0, 120)}</p>
                    {/* Location tags */}
                    {c.locationTags?.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        📍 {c.locationTags.slice(0, 3).join(' • ')}
                      </p>
                    )}
                    <div className="course-meta">
                      <span className="course-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {c.totalHours}h
                      </span>
                      <span className="course-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        {c.totalStudents?.toLocaleString('en-IN') || 0}
                      </span>
                      {c.rating > 0 && (
                        <span className="course-meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          {c.rating}
                        </span>
                      )}
                    </div>
                    <div className="course-price">
                      <div className="course-price-row">
                        <div>
                          <span className="price-amount">₹{c.price?.toLocaleString('en-IN')}</span>
                          {c.originalPrice > 0 && (
                            <span className="price-original">₹{c.originalPrice?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                      <div className="course-btn-group">
                        <Link href={`/courses/${c.slug}`} className="btn btn-outline btn-sm" id={`local-details-${c.slug}`}>
                          More Details
                        </Link>
                        <EnrollButton courseId={c._id?.toString()} amount={c.price} courseTitle={c.title} className="btn btn-primary btn-sm" style={{}}>
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

      {/* ── FAQ Section (local-intent questions) ────────────── */}
      <section className="section section-light">
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2>Questions from Whitefield Parents & Students</h2>
            <div className="section-divider" />
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { q: 'Are the classes online or offline in Whitefield?', a: 'All Gradify Academy classes are live online — so students from anywhere in Whitefield, Varthur, Mahadevapura, or across Bengaluru can attend from home, with no commute.' },
              { q: 'What subjects do you cover for Class 10-12 in Bangalore?', a: 'We currently offer Python programming, Java programming, and full DSA (Data Structures & Algorithms) courses. CBSE Math and Science courses for Class 8-12 are coming soon.' },
              { q: 'Do you provide study materials and recorded lectures?', a: 'Yes — every enrolled student gets access to recorded lectures, downloadable PDFs, assignments, and practice problems via our online LMS portal.' },
              { q: 'What is the fee for coaching classes in Whitefield?', a: 'Course fees start from ₹999 and go up to ₹4,999 depending on the course. All pricing is transparent — no hidden charges. EMI options are available.' },
              { q: 'How do I enroll in a course from Whitefield, Bangalore?', a: 'Simply click "Enroll Now" on any course above, complete the payment online, and you will receive immediate access to all course materials.' },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {q} <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>+</span>
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <div>
            <h2>Ready to Start Learning in Whitefield, Bangalore?</h2>
            <p>Talk to our counselors — free academic guidance, no obligation.</p>
          </div>
          <Link href="/contact" className="btn btn-white btn-lg">
            Get Free Counselling
          </Link>
        </div>
      </section>
    </>
  );
}
