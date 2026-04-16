'use client';

import Link from 'next/link';
import EnrollButton from '@/components/courses/EnrollButton';

export default function LmsCourseDetail({ course }) {
  const c = course;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1000px' }}>
      {/* Back Button */}
      <Link href="/lms/browse" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: 'var(--dash-text-secondary)',
        fontSize: '0.85rem',
        textDecoration: 'none',
        marginBottom: '1.5rem',
        transition: 'color var(--dash-transition)',
      }}>
        ← Back to Courses
      </Link>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        {/* Left — Info */}
        <div>
          <span style={{
            display: 'inline-block',
            background: 'var(--dash-accent-light)',
            color: 'var(--dash-accent)',
            padding: '0.2rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}>
            {c.category}
          </span>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--dash-text)',
            marginBottom: '1rem',
            lineHeight: 1.3,
          }}>
            {c.title}
          </h1>

          <p style={{
            color: 'var(--dash-text-muted)',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            marginBottom: '1.5rem',
          }}>
            {c.description}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--dash-text-secondary)', fontSize: '0.82rem' }}>
            <span>⏱ {c.totalHours} Hours</span>
            <span>📖 {c.totalLessons} Lessons</span>
            <span>👥 {c.totalStudents?.toLocaleString('en-IN')} Students</span>
            <span>⭐ {c.rating} ({c.totalRatings} reviews)</span>
            <span>📊 {c.level}</span>
            <span>🗣 {c.language}</span>
          </div>

          {c.instructor && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--dash-surface)',
              border: '1px solid var(--dash-border)',
              borderRadius: '12px',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: 'var(--dash-accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
              }}>
                {c.instructor.name?.charAt(0)}
              </div>
              <div>
                <div style={{ color: 'var(--dash-text)', fontWeight: 600, fontSize: '0.9rem' }}>{c.instructor.name}</div>
                <div style={{ color: 'var(--dash-text-muted)', fontSize: '0.75rem' }}>{c.instructor.bio}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Enroll Card */}
        <div style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-border)',
          borderRadius: '14px',
          padding: '1.25rem',
          position: 'sticky',
          top: '1rem',
          alignSelf: 'start',
          boxShadow: 'var(--dash-shadow)',
        }}>
          {/* Thumbnail */}
          <div style={{
            height: '160px',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #222, #2a2a2a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {c.thumbnail ? (
              <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '3rem', opacity: 0.2 }}>📚</span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: 'var(--dash-accent)', fontSize: '1.6rem', fontWeight: 700 }}>
              ₹{c.price?.toLocaleString('en-IN')}
            </span>
            {c.originalPrice > 0 && (
              <span style={{ color: 'var(--dash-text-muted)', textDecoration: 'line-through', marginLeft: '0.75rem', fontSize: '1rem' }}>
                ₹{c.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
            {c.originalPrice > 0 && (
              <span style={{
                marginLeft: '0.5rem',
                background: 'rgba(46,213,115,0.12)',
                color: '#2ed573',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}>
                {Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Enroll */}
          <EnrollButton
            courseId={c._id}
            amount={c.price}
            courseTitle={c.title}
          />

          <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--dash-text-muted)', lineHeight: 1.8 }}>
            <p>● Full lifetime access</p>
            <p>● Certificate of completion</p>
            <p>● Responsive support</p>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      {c.learningOutcomes?.length > 0 && (
        <div style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-border)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--dash-shadow)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>
            What You&apos;ll Learn
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {c.learningOutcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>
                <span style={{ color: '#2ed573', flexShrink: 0 }}>✓</span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum */}
      {c.chapters?.length > 0 && (
        <div style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-border)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--dash-shadow)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Course Curriculum
          </h2>
          {c.chapters.map((ch, i) => (
            <div key={i} style={{
              border: '1px solid var(--dash-border)',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                background: 'var(--dash-bg)',
                padding: '0.85rem 1rem',
                fontWeight: 600,
                color: 'var(--dash-text)',
                fontSize: '0.9rem',
              }}>
                Chapter {i + 1}: {ch.title}
              </div>
              {ch.lessons?.map((l, j) => (
                <div key={j} style={{
                  padding: '0.6rem 1rem',
                  borderTop: '1px solid var(--dash-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  color: 'var(--dash-text-muted)',
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--dash-text-secondary)' }}>▶</span>
                    <span>{l.title}</span>
                    {l.isFree && (
                      <span style={{
                        background: 'rgba(46,213,115,0.12)', color: '#2ed573',
                        padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600,
                      }}>FREE</span>
                    )}
                  </div>
                  <span>{l.duration}m</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* FAQs */}
      {c.faqs?.length > 0 && (
        <div style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-border)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: 'var(--dash-shadow)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>
            FAQs
          </h2>
          {c.faqs.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ color: 'var(--dash-text)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Q: {faq.question}
              </div>
              <div style={{ color: 'var(--dash-text-muted)', fontSize: '0.82rem' }}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
