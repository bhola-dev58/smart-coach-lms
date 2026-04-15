'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/lms/player.module.css';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const res = await fetch('/api/lms/my-courses');
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to fetch my courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  if (loading) {
    return <div className={styles.loading}>⏳ Loading your courses...</div>;
  }

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        color: '#f0f0f0',
        marginBottom: '0.4rem',
      }}>
        My Courses
      </h1>
      <p style={{ color: '#666', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
        {courses.length > 0
          ? `You have ${courses.length} enrolled course${courses.length > 1 ? 's' : ''}`
          : 'No enrolled courses yet'}
      </p>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📚</div>
          <h2 style={{ color: '#f0f0f0', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            No Courses Yet
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Explore our catalog and enroll in your first course!
          </p>
          <Link href="/lms/browse" style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
          }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className={styles.myCoursesGrid}>
          {courses.map((c) => (
            <Link
              key={c._id}
              href={`/lms/learn/${c.courseId}`}
              className={styles.myCourseCard}
            >
              {/* Thumbnail */}
              <div className={styles.myCourseThumb}>
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} />
                ) : (
                  <span style={{ fontSize: '3rem', opacity: 0.2 }}>📚</span>
                )}
                <span className={styles.myCourseCategory}>{c.category}</span>
                <span className={`${styles.myCourseStatus} ${c.status === 'completed' ? styles.statusCompleted : styles.statusActive}`}>
                  {c.status === 'completed' ? '✅ Completed' : '▶ Active'}
                </span>
              </div>

              {/* Body */}
              <div className={styles.myCourseBody}>
                <div className={styles.myCourseName}>{c.title}</div>
                <div className={styles.myCourseMeta}>
                  <span>⏱ {c.totalHours}h</span>
                  <span>📖 {c.completedLessons}/{c.totalLessons} lessons</span>
                  <span>📊 {c.level}</span>
                </div>
                <div className={`${styles.myCourseProgress} ${c.percentage >= 100 ? styles.myCourseProgressComplete : ''}`}>
                  <div className={styles.myCourseProgressFill} style={{ width: `${c.percentage}%` }} />
                </div>
                <div className={styles.myCourseProgressText}>
                  <span>{c.percentage}% complete</span>
                  <span>{c.completedLessons} of {c.totalLessons} lessons</span>
                </div>
                <span className={styles.myCourseBtn}>
                  {c.percentage >= 100 ? 'Review Course' : c.percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
