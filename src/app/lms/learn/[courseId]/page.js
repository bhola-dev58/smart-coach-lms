'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/lms/player.module.css';

export default function LearnCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const videoRef = useRef(null);
  const watchTimerRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/lms/course/${courseId}`);
        const data = await res.json();
        if (data.success) {
          setCourse(data.course);
          setCompletedLessons(data.course.progress.completedLessons || []);
          setPercentage(data.course.progress.percentage || 0);

          // Open all chapters by default
          const openMap = {};
          data.course.chapters.forEach((ch) => { openMap[ch._id] = true; });
          setOpenChapters(openMap);

          // Set active lesson: current or first lesson
          const currentSlug = data.course.progress.currentLesson;
          let found = null;
          for (const ch of data.course.chapters) {
            for (const l of ch.lessons) {
              if (currentSlug && l.slug === currentSlug) { found = l; break; }
              if (!found) found = l; // fallback to first lesson
            }
            if (found && currentSlug && found.slug === currentSlug) break;
          }
          if (found) setActiveLesson(found);
        } else {
          setError(data.error || 'Failed to load course');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchCourse();
  }, [courseId]);

  // Watch time tracker (every 60s while video is playing)
  useEffect(() => {
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, []);

  const startWatchTimer = useCallback(() => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    watchTimerRef.current = setInterval(() => {
      if (activeLesson) {
        fetch('/api/lms/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, lessonSlug: activeLesson.slug, action: 'watch' }),
        }).catch(() => {});
      }
    }, 60000);
  }, [courseId, activeLesson]);

  const stopWatchTimer = () => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
  };

  // Select a lesson
  const selectLesson = async (lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);

    // Update current lesson on server
    fetch('/api/lms/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, lessonSlug: lesson.slug, action: 'select' }),
    }).catch(() => {});
  };

  // Mark lesson complete
  const markComplete = async () => {
    if (!activeLesson || completedLessons.includes(activeLesson.slug)) return;

    try {
      const res = await fetch('/api/lms/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonSlug: activeLesson.slug, action: 'complete' }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedLessons(data.progress.completedLessons);
        setPercentage(data.progress.percentage);
      }
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  // Navigation helpers
  const getAllLessons = () => {
    if (!course) return [];
    const all = [];
    course.chapters.forEach((ch) => ch.lessons.forEach((l) => all.push(l)));
    return all;
  };

  const goToLesson = (direction) => {
    const all = getAllLessons();
    const idx = all.findIndex((l) => l.slug === activeLesson?.slug);
    const next = all[idx + direction];
    if (next) selectLesson(next);
  };

  const toggleChapter = (chId) => {
    setOpenChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
  };

  // Loading / Error
  if (loading) return <div className={styles.loading}>⏳ Loading course...</div>;
  if (error) return (
    <div className={styles.loading}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>❌ {error}</p>
        <button onClick={() => router.push('/lms/courses')} style={{
          padding: '0.5rem 1.25rem', background: 'var(--color-primary)', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
        }}>
          Back to My Courses
        </button>
      </div>
    </div>
  );

  const allLessons = getAllLessons();
  const currentIdx = allLessons.findIndex((l) => l.slug === activeLesson?.slug);
  const isCompleted = activeLesson ? completedLessons.includes(activeLesson.slug) : false;
  const totalLessons = allLessons.length;

  return (
    <>
      <div className={styles.playerWrapper}>
        {/* ── Video Section ── */}
        <div className={styles.videoSection}>
          {/* Video Player */}
          <div className={styles.videoContainer}>
            {activeLesson?.videoUrl ? (
              <video
                ref={videoRef}
                key={activeLesson.slug}
                controls
                autoPlay
                onPlay={startWatchTimer}
                onPause={stopWatchTimer}
                onEnded={() => { stopWatchTimer(); markComplete(); }}
              >
                <source src={activeLesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className={styles.videoPlaceholder}>
                <span>🎬</span>
                <p>Video content will be available here</p>
                {activeLesson && (
                  <p style={{ color: '#888', fontSize: 'var(--text-xs)' }}>
                    Lesson: {activeLesson.title}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Lesson Info */}
          {activeLesson && (
            <div className={styles.lessonInfo}>
              <div className={styles.lessonInfoHeader}>
                <div>
                  <h2 className={styles.lessonTitle}>{activeLesson.title}</h2>
                  <div className={styles.lessonMeta}>
                    <span>⏱ {activeLesson.duration} min</span>
                    <span>📖 Lesson {currentIdx + 1} of {totalLessons}</span>
                    {isCompleted && <span style={{ color: '#2ed573' }}>✅ Completed</span>}
                  </div>
                </div>
                <div className={styles.lessonActions}>
                  <button
                    className={styles.prevNextBtn}
                    disabled={currentIdx <= 0}
                    onClick={() => goToLesson(-1)}
                  >
                    ← Prev
                  </button>
                  <button
                    className={`${styles.completeBtn} ${isCompleted ? styles.completeBtnDone : styles.completeBtnActive}`}
                    onClick={markComplete}
                    disabled={isCompleted}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  <button
                    className={styles.prevNextBtn}
                    disabled={currentIdx >= totalLessons - 1}
                    onClick={() => goToLesson(1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Content / Resources */}
          <div className={styles.lessonContent}>
            {activeLesson?.content && (
              <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            )}
            {activeLesson?.resources?.length > 0 && (
              <>
                <h3>📎 Resources</h3>
                <div className={styles.resourcesList}>
                  {activeLesson.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceItem}>
                      <span>{r.type === 'pdf' ? '📄' : r.type === 'code' ? '💻' : '🔗'}</span>
                      <span>{r.name}</span>
                      {r.size && <span style={{ marginLeft: 'auto' }}>({r.size})</span>}
                    </a>
                  ))}
                </div>
              </>
            )}
            {!activeLesson?.content && (!activeLesson?.resources || activeLesson.resources.length === 0) && (
              <p style={{ color: '#555', textAlign: 'center', padding: '2rem' }}>
                Select a lesson from the sidebar to start learning.
              </p>
            )}
          </div>
        </div>

        {/* ── Lesson Sidebar ── */}
        <div className={`${styles.lessonSidebar} ${sidebarOpen ? styles.lessonSidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>{course?.title}</h3>
            <div className={styles.sidebarProgress}>
              <div className={styles.sidebarProgressBar}>
                <div className={styles.sidebarProgressFill} style={{ width: `${percentage}%` }} />
              </div>
              <span className={styles.sidebarProgressText}>{percentage}%</span>
            </div>
          </div>

          <div className={styles.chapterList}>
            {course?.chapters.map((ch) => (
              <div key={ch._id} className={styles.chapterGroup}>
                <div className={styles.chapterHeader} onClick={() => toggleChapter(ch._id)}>
                  <div>
                    <div className={styles.chapterName}>{ch.title}</div>
                    <div className={styles.chapterMeta}>
                      {ch.lessons.filter(l => completedLessons.includes(l.slug)).length}/{ch.lessons.length} lessons
                    </div>
                  </div>
                  <span className={`${styles.chapterArrow} ${openChapters[ch._id] ? styles.chapterArrowOpen : ''}`}>
                    ▶
                  </span>
                </div>

                {openChapters[ch._id] && (
                  <div className={styles.lessonList}>
                    {ch.lessons.map((l) => {
                      const done = completedLessons.includes(l.slug);
                      const isActive = activeLesson?.slug === l.slug;
                      return (
                        <div
                          key={l._id}
                          className={`${styles.lessonItem} ${isActive ? styles.lessonItemActive : ''}`}
                          onClick={() => selectLesson(l)}
                        >
                          <div className={`${styles.lessonCheck} ${done ? styles.lessonCheckDone : ''}`}>
                            {done && '✓'}
                          </div>
                          <span className={styles.lessonItemTitle}>{l.title}</span>
                          <span className={styles.lessonItemDuration}>{l.duration}m</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        📋
      </button>
    </>
  );
}
