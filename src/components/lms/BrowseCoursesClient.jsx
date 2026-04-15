'use client';

import { useState } from 'react';
import Link from 'next/link';
import EnrollButton from '@/components/courses/EnrollButton';
import styles from '@/app/lms/lms.module.css';

export default function BrowseCoursesClient({ courses = [] }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter);

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-2xl)',
          color: '#f0f0f0',
          marginBottom: '0.5rem',
        }}>
          Browse Courses
        </h1>
        <p style={{ color: '#666', fontSize: 'var(--text-sm)' }}>
          Explore {courses.length} courses and start learning today
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filter === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
              background: filter === cat ? 'rgba(200,16,46,0.12)' : '#1A1A1A',
              color: filter === cat ? 'var(--color-primary)' : '#a0a0a0',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</p>
          <p>No courses found in this category.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {filtered.map(c => (
            <div key={c._id} style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              transition: 'border-color 0.25s',
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
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', opacity: 0.2 }}>📚</span>
                )}
                <span style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}>
                  {c.category}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  color: '#f0f0f0',
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
                  color: '#666',
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
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', color: '#888', fontSize: '0.75rem' }}>
                  <span>⏱ {c.totalHours}h</span>
                  <span>👥 {c.totalStudents?.toLocaleString('en-IN')}</span>
                  <span>⭐ {c.rating}</span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontSize: '1.15rem', fontWeight: 700 }}>
                    ₹{c.price?.toLocaleString('en-IN')}
                  </span>
                  {c.originalPrice > 0 && (
                    <span style={{ color: '#555', textDecoration: 'line-through', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
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
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#a0a0a0',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
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
