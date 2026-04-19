'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '@/app/lms/player.module.css';
import AssignmentDropzone from '@/components/lms/AssignmentDropzone';

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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Theater mode toggle
  const [percentage, setPercentage] = useState(0);

  // Phase 5.2: Notes/Bookmarks state
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(true);

  // Phase 5.3: Real Time Duration & Features
  const [durationsMap, setDurationsMap] = useState({}); // Stores real duration of all videos

  // Phase 5.5: Q&A Discussion State
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'qa' | 'feedback'
  const [discussions, setDiscussions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [replyTexts, setReplyTexts] = useState({}); // { discussionId: 'text' }
  const [openReplies, setOpenReplies] = useState({}); // { discussionId: true/false }
  const [loadingQA, setLoadingQA] = useState(false);

  // Phase 5.6: Feedback/Review State
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  const { data: session } = useSession();
  const [watermarkPos, setWatermarkPos] = useState({ top: '80%', left: '15%', transform: 'rotate(-30deg)' });

  // Handle video time update to change watermark position & auto-resume
  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (!video.duration) return;
    const progress = video.currentTime / video.duration;

    // Save Auto-Resume progress every ~2 seconds to local storage
    if (Math.floor(video.currentTime) % 2 === 0 && activeLesson) {
      localStorage.setItem(`meetme_resumeTime_${activeLesson.slug}`, video.currentTime);
    }

    if (progress < 0.25) {
      // Up to 25%: left
      setWatermarkPos({ top: '80%', left: '15%', transform: 'rotate(-30deg)' });
    } else if (progress < 0.50) {
      // 25% to 50%: top-center
      setWatermarkPos({ top: '15%', left: '50%', transform: 'translateX(-50%) rotate(-30deg)' });
    } else if (progress < 0.75) {
      // 50% to 75%: right-center
      setWatermarkPos({ top: '50%', left: '85%', transform: 'translate(-100%, -50%) rotate(-30deg)' });
    } else {
      // 75% to 100%: center
      setWatermarkPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' });
    }
  };

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
        }).catch(() => { });
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
    }).catch(() => { });
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

  // Phase 5.2 Notes Helper Functions
  const addNote = () => {
    if (!noteText.trim() || !videoRef.current) return;
    const time = videoRef.current.currentTime;

    // Format mm:ss
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

    const newNote = { id: Date.now(), text: noteText, time: time, timeStr };
    setNotes([...notes, newNote]);
    setNoteText('');
  };

  const jumpToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  // Dedicated Screenshot Taker
  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataURI = canvas.toDataURL('image/png');

    // Download
    const a = document.createElement('a');
    a.href = dataURI;
    a.download = `MeetMeCenter_${activeLesson?.slug}_Snapshot.png`;
    a.click();
  };

  // ── Phase 5.5: Q&A Functions ──
  const fetchDiscussions = useCallback(async () => {
    if (!courseId || !activeLesson) return;
    setLoadingQA(true);
    try {
      const res = await fetch(`/api/lms/discussions?courseId=${courseId}&lessonSlug=${activeLesson.slug}`);
      const data = await res.json();
      if (data.success) setDiscussions(data.discussions);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoadingQA(false);
    }
  }, [courseId, activeLesson]);

  useEffect(() => {
    if (activeTab === 'qa') fetchDiscussions();
  }, [activeTab, activeLesson, fetchDiscussions]);

  const postQuestion = async () => {
    if (!questionText.trim()) return;
    const videoTimestamp = videoRef.current ? Math.floor(videoRef.current.currentTime) : null;
    try {
      const res = await fetch('/api/lms/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonSlug: activeLesson.slug, question: questionText, videoTimestamp }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestionText('');
        fetchDiscussions();
      }
    } catch (err) {
      console.error('Failed to post question:', err);
    }
  };

  const postReply = async (discussionId) => {
    const text = replyTexts[discussionId];
    if (!text?.trim()) return;
    try {
      const res = await fetch('/api/lms/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussionId, replyMessage: text }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyTexts(prev => ({ ...prev, [discussionId]: '' }));
        fetchDiscussions();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const formatTimestamp = (secs) => {
    if (!secs && secs !== 0) return null;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ── Phase 5.6: Feedback Functions ──
  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    setLoadingFeedback(true);
    try {
      const res = await fetch(`/api/lms/reviews?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setMyReview(data.myReview);
        setAvgRating(data.avgRating);
        setTotalRatings(data.totalRatings);
        if (data.myReview) {
          setFeedbackRating(data.myReview.rating);
          setFeedbackTitle(data.myReview.title || '');
          setFeedbackComment(data.myReview.comment || '');
          setFeedbackSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoadingFeedback(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'feedback') fetchReviews();
  }, [activeTab, fetchReviews]);

  const submitFeedback = async () => {
    if (!feedbackRating) return;
    try {
      const res = await fetch('/api/lms/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          rating: feedbackRating,
          title: feedbackTitle,
          comment: feedbackComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSubmitted(true);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const renderStars = (count, size = '1.2rem', interactive = false) => {
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        onClick={interactive ? () => setFeedbackRating(star) : undefined}
        onMouseEnter={interactive ? () => setFeedbackHover(star) : undefined}
        onMouseLeave={interactive ? () => setFeedbackHover(0) : undefined}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          fontSize: size,
          color: star <= (interactive ? (feedbackHover || feedbackRating) : count) ? '#f1c40f' : 'rgba(255,255,255,0.15)',
          transition: 'color 0.15s ease, transform 0.15s ease',
          transform: interactive && star <= (feedbackHover || feedbackRating) ? 'scale(1.15)' : 'scale(1)',
          display: 'inline-block',
        }}
      >
        ★
      </span>
    ));
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
  const isAssignment = activeLesson?.type === 'assignment' || activeLesson?.title?.toLowerCase().includes('assignment');

  return (
    <>
      <div className={styles.playerWrapper}>
        {/* ── Video Section ── */}
        <div className={styles.videoSection}>
          {/* Video Player */}
          <div className={styles.videoContainer} style={{ position: 'relative' }}>
            {activeLesson?.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  key={activeLesson.slug}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay
                  onPlay={startWatchTimer}
                  onPause={stopWatchTimer}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => {
                    const video = e.target;
                    
                    // Sync original video duration to backend so it perfectly fixes the runtime data
                    fetch('/api/lms/lesson/duration', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        courseId,
                        lessonId: activeLesson._id,
                        duration: video.duration
                      })
                    }).catch(() => {});

                    const savedTime = localStorage.getItem(`meetme_resumeTime_${activeLesson.slug}`);
                    // If progress was saved and the video isn't practically finished already, resume!
                    if (savedTime && parseFloat(savedTime) < video.duration - 10) {
                      video.currentTime = parseFloat(savedTime);
                    }
                  }}
                  onEnded={() => { stopWatchTimer(); markComplete(); }}
                >
                  <source src={activeLesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Dynamically Floating Watermark */}
                {session?.user?.email && (
                  <div style={{
                    position: 'absolute',
                    top: watermarkPos.top,
                    left: watermarkPos.left,
                    transform: watermarkPos.transform,
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: '10pt',
                    fontFamily: 'sans-serif',
                    fontWeight: 700,
                    pointerEvents: 'none', // Prevents blocking controls
                    userSelect: 'none',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    zIndex: 10,
                  }}>
                    support@meetmecenter.com
                  </div>
                )}
              </>
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
                    <span>
                      ⏱ {durationsMap[activeLesson._id] > 0
                        ? `${Math.floor(durationsMap[activeLesson._id] / 60)} min ${Math.floor(durationsMap[activeLesson._id] % 60)} sec`
                        : `${activeLesson.duration || 0} min`}
                    </span>
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

          {/* ── Tabbed Content: Notes + Q&A ── */}
          <div className={styles.lessonContent}>
            {activeLesson && (
              <>
                {/* Tab Switcher */}
                <div style={{
                  display: 'flex', gap: '0', marginBottom: '1.5rem',
                  borderBottom: '2px solid var(--dash-border)', position: 'relative'
                }}>
                  <button
                    onClick={() => setActiveTab('notes')}
                    style={{
                      padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer',
                      background: 'transparent', fontWeight: 600, fontSize: '0.95rem',
                      color: activeTab === 'notes' ? 'var(--color-primary)' : 'var(--dash-text-muted)',
                      borderBottom: activeTab === 'notes' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-2px', transition: 'all 0.2s ease',
                    }}
                  >
                    📝 My Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    style={{
                      padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer',
                      background: 'transparent', fontWeight: 600, fontSize: '0.95rem',
                      color: activeTab === 'qa' ? 'var(--color-primary)' : 'var(--dash-text-muted)',
                      borderBottom: activeTab === 'qa' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-2px', transition: 'all 0.2s ease',
                    }}
                  >
                    💬 Q&A ({discussions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    style={{
                      padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer',
                      background: 'transparent', fontWeight: 600, fontSize: '0.95rem',
                      color: activeTab === 'feedback' ? 'var(--color-primary)' : 'var(--dash-text-muted)',
                      borderBottom: activeTab === 'feedback' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-2px', transition: 'all 0.2s ease',
                    }}
                  >
                    ⭐ Feedback ({totalRatings})
                  </button>
                </div>

                {/* ── Notes Tab ── */}
                {activeTab === 'notes' && (
                  <div style={{ background: 'var(--dash-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Enter note information..."
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '8px',
                          border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && addNote()}
                      />
                      <button
                        onClick={addNote}
                        disabled={!noteText.trim()}
                        style={{
                          padding: '0 1.25rem', borderRadius: '8px', border: 'none',
                          background: noteText.trim() ? 'var(--color-primary)' : 'var(--dash-border)',
                          color: 'white', fontWeight: 600, cursor: noteText.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Bookmarks
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {notes.length === 0 ? (
                        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                          No notes taken for this lesson yet. Write something and save it!
                        </p>
                      ) : (
                        notes.map(note => (
                          <div key={note.id} style={{
                            display: 'flex', gap: '1rem', padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)', borderRadius: '8px', alignItems: 'center'
                          }}>
                            <button
                              onClick={() => jumpToTime(note.time)}
                              style={{
                                background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'none',
                                padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem',
                                fontWeight: 600, cursor: 'pointer', flexShrink: 0
                              }}
                              title="Jump to this time in video"
                            >
                              ▶ {note.timeStr}
                            </button>
                            <span style={{ fontSize: '0.9rem', color: 'var(--dash-text)', lineHeight: 1.4, flex: 1 }}>
                              {note.text}
                            </span>
                            <button
                              onClick={() => deleteNote(note.id)}
                              style={{
                                background: 'transparent', color: '#ff4757', border: 'none',
                                cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem', opacity: 0.6
                              }}
                              title="Delete Note"
                              onMouseOver={(e) => e.target.style.opacity = 1}
                              onMouseOut={(e) => e.target.style.opacity = 0.6}
                            >
                              ✖
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ── Q&A Discussion Tab ── */}
                {activeTab === 'qa' && (
                  <div style={{ background: 'var(--dash-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
                    {/* Ask a Question */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder={`Ask a doubt about "${activeLesson.title}"...`}
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '8px',
                          border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && postQuestion()}
                      />
                      <button
                        onClick={postQuestion}
                        disabled={!questionText.trim()}
                        style={{
                          padding: '0 1.25rem', borderRadius: '8px', border: 'none',
                          background: questionText.trim() ? 'var(--color-primary)' : 'var(--dash-border)',
                          color: 'white', fontWeight: 600, cursor: questionText.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Post
                      </button>
                    </div>

                    {/* Discussion Threads */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                      {loadingQA ? (
                        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '2rem 0' }}>Loading discussions...</p>
                      ) : discussions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                          No questions yet for this lesson. Be the first to ask!
                        </p>
                      ) : (
                        discussions.map(d => (
                          <div key={d._id} style={{
                            background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                            border: '1px solid var(--dash-border)', overflow: 'hidden'
                          }}>
                            {/* Question Header */}
                            <div style={{ padding: '1rem 1.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: d.userRole === 'instructor' ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #0984e3, #74b9ff)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                  }}>
                                    {d.userName?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                  <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dash-text)' }}>{d.userName}</span>
                                    {d.userRole === 'instructor' && (
                                      <span style={{
                                        marginLeft: '0.5rem', fontSize: '0.65rem', padding: '2px 6px',
                                        background: 'rgba(108,92,231,0.2)', color: '#a29bfe', borderRadius: '4px', fontWeight: 700
                                      }}>INSTRUCTOR</span>
                                    )}
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)', flexShrink: 0 }}>
                                  {formatDate(d.createdAt)}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--dash-text)', margin: 0 }}>{d.question}</p>
                              {d.videoTimestamp !== null && d.videoTimestamp !== undefined && (
                                <button
                                  onClick={() => jumpToTime(d.videoTimestamp)}
                                  style={{
                                    marginTop: '0.5rem', background: 'rgba(46,213,115,0.1)', color: '#2ed573',
                                    border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                    fontWeight: 600, cursor: 'pointer'
                                  }}
                                >
                                  ▶ {formatTimestamp(d.videoTimestamp)}
                                </button>
                              )}
                            </div>

                            {/* Replies */}
                            {d.replies?.length > 0 && (
                              <div style={{ borderTop: '1px solid var(--dash-border)', background: 'rgba(0,0,0,0.02)' }}>
                                {d.replies.map((r, idx) => (
                                  <div key={idx} style={{
                                    padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem',
                                    borderBottom: idx < d.replies.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
                                  }}>
                                    <span style={{
                                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                                      background: r.userRole === 'instructor' ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'rgba(255,255,255,0.1)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'white', fontSize: '0.65rem', fontWeight: 700
                                    }}>
                                      {r.userName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                    <div>
                                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--dash-text)' }}>
                                        {r.userName}
                                        {r.userRole === 'instructor' && (
                                          <span style={{
                                            marginLeft: '0.4rem', fontSize: '0.6rem', padding: '1px 5px',
                                            background: 'rgba(108,92,231,0.2)', color: '#a29bfe', borderRadius: '3px', fontWeight: 700
                                          }}>INSTRUCTOR</span>
                                        )}
                                      </span>
                                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--dash-text)' }}>{r.message}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input */}
                            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--dash-border)' }}>
                              {openReplies[d._id] ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <input
                                    type="text"
                                    value={replyTexts[d._id] || ''}
                                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [d._id]: e.target.value }))}
                                    placeholder="Write a reply..."
                                    style={{
                                      flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem',
                                      border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)'
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && postReply(d._id)}
                                  />
                                  <button
                                    onClick={() => postReply(d._id)}
                                    style={{
                                      padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontSize: '0.8rem',
                                      background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer'
                                    }}
                                  >
                                    Reply
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setOpenReplies(prev => ({ ...prev, [d._id]: true }))}
                                  style={{
                                    background: 'transparent', border: 'none', color: 'var(--color-primary)',
                                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0
                                  }}
                                >
                                  💬 Reply ({d.replies?.length || 0})
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ── Feedback Tab ── */}
                {activeTab === 'feedback' && (
                  <div style={{ background: 'var(--dash-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
                    {/* Average Rating Summary */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem',
                      padding: '1rem 1.25rem', background: 'rgba(241,196,15,0.05)', borderRadius: '10px',
                      border: '1px solid rgba(241,196,15,0.15)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1c40f', lineHeight: 1 }}>{avgRating || '—'}</div>
                        <div style={{ marginTop: '0.25rem' }}>{renderStars(Math.round(avgRating), '1rem')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--dash-text)' }}>Course Rating</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>{totalRatings} review{totalRatings !== 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    {/* Submit/Edit Review Form */}
                    <div style={{
                      padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                      border: '1px solid var(--dash-border)', marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--dash-text)' }}>
                        {feedbackSubmitted ? '✅ Your Review (click to edit)' : 'Rate this course'}
                      </h4>
                      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.25rem' }}>
                        {renderStars(feedbackRating, '1.8rem', true)}
                      </div>
                      <input
                        type="text"
                        value={feedbackTitle}
                        onChange={(e) => setFeedbackTitle(e.target.value)}
                        placeholder="Review title (optional)..."
                        style={{
                          width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem',
                          border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem'
                        }}
                      />
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Share your experience with this course..."
                        rows={3}
                        style={{
                          width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', resize: 'vertical',
                          border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem',
                          fontFamily: 'inherit'
                        }}
                      />
                      <button
                        onClick={submitFeedback}
                        disabled={!feedbackRating}
                        style={{
                          padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                          background: feedbackRating ? 'var(--color-primary)' : 'var(--dash-border)',
                          color: 'white', fontWeight: 600, cursor: feedbackRating ? 'pointer' : 'not-allowed', fontSize: '0.9rem'
                        }}
                      >
                        {feedbackSubmitted ? 'Update Review' : 'Submit Review'}
                      </button>
                    </div>

                    {/* All Reviews List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                      {loadingFeedback ? (
                        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '2rem 0' }}>Loading reviews...</p>
                      ) : reviews.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                          No reviews yet. Be the first to rate this course!
                        </p>
                      ) : (
                        reviews.map(r => (
                          <div key={r._id} style={{
                            padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)',
                            borderRadius: '10px', border: '1px solid var(--dash-border)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #f1c40f, #f39c12)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                }}>
                                  {r.student?.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dash-text)' }}>
                                    {r.student?.name || 'Student'}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.15rem', marginTop: '2px' }}>
                                    {renderStars(r.rating, '0.85rem')}
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>
                                {formatDate(r.createdAt)}
                              </span>
                            </div>
                            {r.title && <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dash-text)', margin: '0.5rem 0 0.25rem' }}>{r.title}</p>}
                            {r.comment && <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--dash-text-muted)', margin: 0 }}>{r.comment}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Lesson Sidebar ── */}
        <div className={`${styles.lessonSidebar} ${sidebarOpen ? styles.lessonSidebarOpen : ''} ${!desktopSidebarOpen ? styles.lessonSidebarCollapsed : ''}`}>
          <div className={styles.sidebarHeader} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className={styles.sidebarTitle}>{course?.title}</h3>
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--dash-text-muted)',
                  cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={desktopSidebarOpen ? "Collapse Curriculum" : "Expand Curriculum"}
              >
                {desktopSidebarOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
                )}
              </button>
            </div>

            <div className={styles.sidebarProgress}>
              <div className={styles.sidebarProgressBar}>
                <div className={styles.sidebarProgressFill} style={{ width: `${percentage}%` }} />
              </div>
              <span className={styles.sidebarProgressText}>{percentage}%</span>
            </div>
          </div>

          {/* Hidden Background Video Data Fetcher for Sidebar */}
          <div style={{ display: 'none' }}>
            {course?.chapters?.map(ch =>
              ch.lessons.map(l => (
                !durationsMap[l._id] && l.videoUrl ? (
                  <video
                    key={`preload-${l._id}`}
                    src={l.videoUrl}
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const dur = e.target.duration;
                      setDurationsMap(prev => ({
                        ...prev,
                        [l._id]: dur
                      }));
                      // Automatically push precise duration to MongoDB so global cards get updated!
                      fetch('/api/lms/lesson/duration', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          courseId,
                          lessonId: l._id,
                          duration: dur
                        })
                      }).catch(() => {});
                    }}
                  />
                ) : null
              ))
            )}
          </div>

          <div className={styles.chapterList}>
            {course?.chapters.map((ch) => {
              const videoLessons = ch.lessons.filter(l => !(l.title.toLowerCase().includes('assignment') || l.type === 'assignment'));
              const assignments = ch.lessons.filter(l => l.title.toLowerCase().includes('assignment') || l.type === 'assignment');

              return (
                <div key={ch._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Chapter Module Accordion */}
                  <div className={styles.chapterGroup}>
                    <div className={styles.chapterHeader} onClick={() => toggleChapter(ch._id)}>
                      <div>
                        <div className={styles.chapterName}>{ch.title}</div>
                        <div className={styles.chapterMeta}>
                          {videoLessons.filter(l => completedLessons.includes(l.slug)).length}/{videoLessons.length} lessons
                        </div>
                      </div>
                      <span className={`${styles.chapterArrow} ${openChapters[ch._id] ? styles.chapterArrowOpen : ''}`}>
                        ▶
                      </span>
                    </div>

                    {openChapters[ch._id] && (
                      <div className={styles.lessonList}>
                        {videoLessons.map((l) => {
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
                              <span className={styles.lessonItemDuration}>
                                {durationsMap[l._id] > 0
                                  ? `${Math.floor(durationsMap[l._id] / 60)}:${Math.floor(durationsMap[l._id] % 60) < 10 ? '0' : ''}${Math.floor(durationsMap[l._id] % 60)}`
                                  : `...`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Standalone Assignments for this Chapter (Outside Accordion) */}
                  {assignments.map(l => {
                    const done = completedLessons.includes(l.slug);
                    const isExpanded = expandedAssignment === l.slug;
                    return (
                      <div key={l._id} className={styles.chapterGroup}>
                        <div
                          className={styles.chapterHeader}
                          onClick={() => setExpandedAssignment(isExpanded ? null : l.slug)}
                          style={{
                            borderLeft: isExpanded ? '3px solid var(--color-primary)' : '3px solid transparent',
                            ...(isExpanded ? { background: 'var(--dash-surface)' } : {})
                          }}
                        >
                          <div>
                            <div className={styles.chapterName} style={{ color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
                              {l.title.split(':').length > 1 ? l.title.split(':')[0] : 'Assignment'}
                            </div>
                            <div className={styles.chapterMeta} style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                              {l.title.split(':').length > 1 ? l.title.split(':')[1].trim() : l.title}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={styles.chapterArrow} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                              ▶
                            </span>
                          </div>
                        </div>

                        {/* Expanded Assignment Dropdown Content */}
                        {isExpanded && (
                          <div style={{ padding: '0 0.5rem', borderLeft: '3px solid var(--color-primary)' }}>
                            <AssignmentDropzone lesson={l} courseId={courseId} onComplete={markComplete} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
