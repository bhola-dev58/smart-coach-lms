'use client';

import Link from 'next/link';
import EnrollButton from '@/components/courses/EnrollButton';
import styles from './LmsCourseDetail.module.css';

export default function LmsCourseDetail({ course, backLink = '/lms/browse' }) {
  const c = course;

  const categoryLabels = {
    MATHS: 'Mathematics',
    SCIENCE: 'Science',
    COMMERCE: 'Commerce',
    ARTS: 'Arts',
    GENERAL: 'General',
    COMPUTER_SCIENCE: 'Computer Science',
  };

  const displayCategory = categoryLabels[c.category] || c.category || 'Courses';

  // Dynamic or default "Who Is This Course For?" points
  const audienceList = (c.targetAudience && Array.isArray(c.targetAudience) && c.targetAudience.length > 0)
    ? c.targetAudience
    : [
      c.targetClass && c.targetClass !== 'All Classes' ? `${c.targetClass} Students` : 'Class 11 & 12 Students',
      c.level ? `${c.level}s in ${c.category === 'COMPUTER_SCIENCE' ? 'Programming' : 'Subject'}` : 'Beginners in Programming',
      'Anyone preparing for coding & technical interviews',
      'Students preparing for competitive programming',
    ];

  const hasSyllabus = c.chapters && c.chapters.length > 0 && c.chapters.some(ch => ch.lessons && ch.lessons.length > 0);

  if (!hasSyllabus) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            color: 'var(--dash-accent, #1B2B6B)',
            fontFamily: 'var(--font-heading)'
          }}>
            Coming Soon!
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--dash-text-muted, #666)',
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            The syllabus for this course is being prepared. Please check back later.
          </p>
          <Link href={backLink} style={{
            background: 'var(--color-primary, #2563eb)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
            transition: 'background var(--dash-transition)'
          }}>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Breadcrumb Navigation ── */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link href={backLink || '/courses'} className={styles.breadcrumbLink}>
          Courses
        </Link>
        {c.category && (
          <>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link href={`/courses?category=${c.category}`} className={styles.breadcrumbLink}>
              {displayCategory}
            </Link>
          </>
        )}
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>
          {c.title}
        </span>
      </nav>

      {/* Main 2-Column Responsive Grid */}
      <div className={styles.detailGrid}>
        {/* ── Left Column: Main Course Content ── */}
        <div className={styles.mainContent}>

          {/* Header Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              padding: '0.3rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {c.category}
            </span>
            {c.targetClass && c.targetClass !== 'All Classes' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.3rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                {c.targetClass}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            color: 'var(--dash-text, #0f172a)',
            marginBottom: '1.25rem',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}>
            {c.title}
          </h1>

          {/* Description */}
          <p style={{
            color: 'var(--dash-text-muted, #475569)',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            marginBottom: '1.75rem',
          }}>
            {c.description}
          </p>

          {/* Meta Information Bar */}
          <div className={styles.metaBar}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {c.formattedTime || `${c.totalHours}h`}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              {c.totalLessons} Lessons
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              {c.totalStudents?.toLocaleString('en-IN')} Students
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <strong style={{ color: '#0f172a', fontWeight: 700 }}>{c.rating}</strong> ({c.totalRatings} reviews)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              {c.level}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {c.language}
            </span>
          </div>

          {/* Instructor Block */}
          {c.instructor && (
            <div className={styles.sectionCard} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}>
                {c.instructor.name?.charAt(0)}
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Instructor</div>
                <div style={{ color: 'var(--dash-text, #0f172a)', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.1rem' }}>{c.instructor.name}</div>
                {c.instructor.bio && <div style={{ color: 'var(--dash-text-muted, #64748b)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{c.instructor.bio}</div>}
              </div>
            </div>
          )}

          {/* What You'll Learn */}
          {c.learningOutcomes?.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                What You&apos;ll Learn
              </h2>
              <div className={styles.outcomesGrid}>
                {c.learningOutcomes.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--dash-text-muted, #475569)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span style={{ fontWeight: 500 }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Prerequisites */}
          {c.prerequisites?.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Requirements & Prerequisites
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {c.prerequisites.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--dash-text-muted, #475569)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span style={{ fontWeight: 500 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          {c.chapters?.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Course Curriculum
              </h2>
              {c.chapters.map((ch, i) => (
                <div key={i} style={{
                  border: '1px solid var(--dash-border, #e2e8f0)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{
                    background: '#f8fafc',
                    padding: '1rem 1.4rem',
                    fontWeight: 700,
                    color: 'var(--dash-text, #0f172a)',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid var(--dash-border, #e2e8f0)',
                  }}>
                    Chapter {i + 1}: {ch.title}
                  </div>
                  {ch.lessons?.map((l, j) => (
                    <div key={j} style={{
                      padding: '0.85rem 1.4rem',
                      borderTop: j > 0 ? '1px solid var(--dash-border, #f1f5f9)' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: 'var(--dash-text-muted, #475569)',
                    }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span style={{ fontWeight: 500 }}>{l.title}</span>
                        {l.isFree && (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.12)', color: '#059669',
                            padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                          }}>FREE PREVIEW</span>
                        )}
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '0.825rem', fontWeight: 500 }}>{l.duration}m</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* FAQs */}
          {c.faqs?.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {c.faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: i < c.faqs.length - 1 ? '1px dashed var(--dash-border, #e2e8f0)' : 'none', paddingBottom: i < c.faqs.length - 1 ? '1.25rem' : '0' }}>
                    <div style={{ color: 'var(--dash-text, #0f172a)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      Q: {faq.question}
                    </div>
                    <div style={{ color: 'var(--dash-text-muted, #475569)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Right Column: Sticky Sidebar ── */}
        <div className={styles.sidebarWrapper}>
          {/* Card 1: Enroll Card */}
          <div className={styles.enrollCard}>
            {/* Thumbnail */}
            <div className={styles.thumbnailBox}>
              <img src={c.thumbnail || '/images/courses/default.jpg'} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Price Row */}
            <div style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--dash-accent, #2563eb)', fontSize: '2rem', fontWeight: 800 }}>
                ₹{c.price?.toLocaleString('en-IN')}
              </span>
              {c.originalPrice > 0 && (
                <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '1.1rem', fontWeight: 500 }}>
                  ₹{c.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
              {c.originalPrice > 0 && (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* No-Cost EMI Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '0.8rem 1rem',
              marginBottom: '1.4rem',
              fontSize: '0.825rem',
              color: '#d97706',
              fontWeight: 600,
              lineHeight: '1.4'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>No-Cost EMI: Pay ₹{Math.round(c.price / 3).toLocaleString('en-IN')}/mo in 3 installments</span>
            </div>

            {/* Enroll Button */}
            <EnrollButton
              courseId={c._id}
              amount={c.price}
              courseTitle={c.title}
            />

            {/* Features Checklist */}
            <div style={{ marginTop: '1.4rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--dash-border, #e2e8f0)', fontSize: '0.85rem', color: 'var(--dash-text-muted, #475569)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Full lifetime access to all materials</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Verified Certificate of Completion</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Responsive Doubt Support & Community</span>
              </div>
            </div>
          </div>

          {/* Card 2: Who Is This Course For? */}
          <div className={styles.audienceCard}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#1e40af',
              marginBottom: '1.25rem',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Who Is This Course For?
            </h3>

            {/* Timeline Node List */}
            <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Connecting Blue Line */}
              <div style={{
                position: 'absolute',
                left: '5px',
                top: '8px',
                bottom: '14px',
                width: '2px',
                background: '#93c5fd',
                borderRadius: '1px',
              }} />

              {audienceList.map((item, idx) => (
                <div key={idx} style={{ position: 'relative', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a', lineHeight: 1.45 }}>
                  {/* Blue Node Circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    boxShadow: '0 0 0 3px #dbeafe',
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
