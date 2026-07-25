'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EnrollButton from '@/components/courses/EnrollButton';
import styles from '@/app/lms/lms.module.css';
import UiIcon from '@/components/common/UiIcon';

export default function BrowseCoursesClient({ courses = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'All');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'All');

  const categoryLabels = {
    MATHS: 'Mathematics',
    SCIENCE: 'Science',
    COMMERCE: 'Commerce',
    ARTS: 'Arts',
    GENERAL: 'General',
    COMPUTER_SCIENCE: 'Computer Science'
  };

  const filter = searchParams.get('category') || 'All';
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  const classTabs = [
    { label: 'All Classes', value: 'All' },
    { label: 'Class 8th', value: 'Class 8' },
    { label: 'Class 9th', value: 'Class 9' },
    { label: 'Class 10th (SSLC)', value: 'Class 10' },
    { label: 'Class 11th (1st PUC)', value: 'Class 11' },
    { label: 'Class 12th (2nd PUC)', value: 'Class 12' },
    { label: 'Dropper / Repeater', value: 'Dropper / Repeater' },
  ];

  const levelOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Apply filters
  const filtered = courses.filter(c => {
    const matchesCategory = filter === 'All' || !filter || (c.category && c.category.toUpperCase() === filter.toUpperCase());
    const matchesClass = selectedClass === 'All' || c.targetClass === selectedClass || c.targetClass === 'All Classes';
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel || c.level === 'All Levels' || c.level === 'All';
    const matchesQuery = !query || 
      (c.title || '').toLowerCase().includes(query) ||
      (c.shortDescription || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.category || '').toLowerCase().includes(query) ||
      (c.tags || []).some(t => t.toLowerCase().includes(query));

    return matchesCategory && matchesClass && matchesLevel && matchesQuery;
  });

  return (
    <div style={{ padding: '1.5rem 2rem' }}>

      {/* ── Target Class Filter Tabs ── */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--dash-surface)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Filter by Class / Target Grade:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {classTabs.map(item => {
            const active = selectedClass === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setSelectedClass(item.value)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1.5px solid var(--dash-accent, #2563eb)' : '1px solid var(--dash-border)',
                  background: active ? 'rgba(37, 99, 235, 0.1)' : 'var(--dash-bg)',
                  color: active ? 'var(--dash-accent, #2563eb)' : 'var(--dash-text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Level filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--dash-border)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>Skill Level:</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {levelOptions.map(lvl => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    border: active ? '1px solid var(--dash-accent)' : '1px solid var(--dash-border)',
                    background: active ? 'var(--dash-accent)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--dash-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {lvl === 'All' ? 'All Levels' : lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search result heading */}
      {query && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.25rem' }}>
            Results for &ldquo;<span style={{ color: 'var(--dash-accent)' }}>{query}</span>&rdquo;
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--dash-text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <UiIcon name="search" size={40} color="var(--dash-text-muted)" />
          </p>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {query ? `No courses found for "${query}"` : 'No courses found in this category.'}
          </p>
          {query && <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>Try a different keyword or browse all courses.</p>}
        </div>
      ) : (

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {filtered.map(c => (
            <div key={c._id} style={{
              background: 'var(--dash-surface)',
              border: '1px solid var(--dash-border)',
              borderRadius: 'var(--dash-radius)',
              overflow: 'hidden',
              transition: 'border-color var(--dash-transition), box-shadow var(--dash-transition)',
              boxShadow: 'var(--dash-shadow)',
            }}>
              {/* Thumbnail */}
              <div style={{
                height: '150px',
                background: 'linear-gradient(135deg, #222, #2a2a2a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <img src={c.thumbnail || '/images/courses/default.jpg'} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                    {categoryLabels[c.category] || c.category}
                  </span>
                  {c.targetClass && c.targetClass !== 'All Classes' && (
                    <span style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      {c.targetClass}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  color: 'var(--dash-text)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '0.4rem',
                  fontFamily: 'var(--font-heading)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {c.title}
                </h3>
                <p style={{
                  color: 'var(--dash-text-muted)',
                  fontSize: '0.78rem',
                  marginBottom: '0.75rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {c.shortDescription || c.description}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.75rem', color: 'var(--dash-text-muted)', fontSize: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {c.formattedTime || `${c.totalHours}h`}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    {c.totalLessons} Lessons
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {c.totalStudents?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    {c.rating}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--dash-accent)', fontSize: '1.15rem', fontWeight: 700 }}>
                    ₹{c.price?.toLocaleString('en-IN')}
                  </span>
                  {c.originalPrice > 0 && (
                    <span style={{ color: 'var(--dash-text-muted)', textDecoration: 'line-through', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                      ₹{c.originalPrice?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/lms/browse/${c.slug}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      textAlign: 'center',
                      border: '1px solid var(--dash-border)',
                      borderRadius: '8px',
                      color: 'var(--dash-text)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'border-color var(--dash-transition)',
                    }}
                  >
                    Details
                  </Link>
                  <EnrollButton
                    courseId={c._id}
                    amount={c.price}
                    courseTitle={c.title}
                    className=""
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Enroll Now
                  </EnrollButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
