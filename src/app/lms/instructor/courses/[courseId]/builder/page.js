'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUploader from '@/components/lms/instructor/CustomUploader';

// Premium SVG Lesson Icons replacing emojis
const LessonIcon = ({ type }) => {
  if (type === 'video') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3b82f6', flexShrink: 0 }}>
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981', flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  );
};

export default function CourseCurriculumBuilder({ params }) {
  const unwrappedParams = use(params);
  const { courseId } = unwrappedParams;
  const router = useRouter();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active form states
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [activeLessonForm, setActiveLessonForm] = useState(null); // { chapIdx, lIdx, lesson } or null

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/curriculum`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.chapters || []);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCurriculum = async (newChapters) => {
    setSaving(true);
    try {
      const payload = newChapters || chapters;
      const res = await fetch(`/api/instructor/courses/${courseId}/curriculum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters: payload })
      });
      const data = await res.json();
      if (data.success) {
        setChapters(data.chapters);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
      setEditingLessonId(null);
      setActiveLessonForm(null);
    }
  };

  const addChapter = () => {
    const newTitle = `New Chapter ${chapters.length + 1}`;
    const newChapters = [...chapters, { title: newTitle, lessons: [] }];
    setChapters(newChapters);
    saveCurriculum(newChapters);
  };

  const deleteChapter = (idx) => {
    if (!confirm('Delete this entire chapter and its lessons?')) return;
    const newChapters = chapters.filter((_, i) => i !== idx);
    setChapters(newChapters);
    saveCurriculum(newChapters);
  };

  const moveChapter = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= chapters.length) return;
    const newChapters = [...chapters];
    const temp = newChapters[idx];
    newChapters[idx] = newChapters[idx + dir];
    newChapters[idx + dir] = temp;
    setChapters(newChapters);
    saveCurriculum(newChapters);
  };

  const renameChapter = (idx, newTitle) => {
    const newChapters = [...chapters];
    newChapters[idx].title = newTitle;
    setChapters(newChapters);
  };

  // Lesson Operations
  const addLesson = (chapIdx) => {
    const newLesson = { title: '', type: 'video', duration: '', videoUrl: '', slug: `lesson-${Date.now()}` };
    const newChapters = [...chapters];
    newChapters[chapIdx].lessons.push(newLesson);
    setChapters(newChapters);
    // Auto-open editing form for the new lesson so it shows placeholders
    setActiveLessonForm({ chapIdx, lIdx: newChapters[chapIdx].lessons.length - 1, lesson: newLesson });
  };

  const handleCancelLessonEdit = () => {
    if (activeLessonForm) {
      const { chapIdx, lIdx, lesson } = activeLessonForm;
      if (!lesson.title || !lesson.title.trim()) {
        const newChapters = [...chapters];
        newChapters[chapIdx].lessons = newChapters[chapIdx].lessons.filter((_, i) => i !== lIdx);
        setChapters(newChapters);
      }
    }
    setActiveLessonForm(null);
  };

  const deleteLesson = (chapIdx, lessonIdx) => {
    if (!confirm('Delete this lesson?')) return;
    const newChapters = [...chapters];
    newChapters[chapIdx].lessons = newChapters[chapIdx].lessons.filter((_, i) => i !== lessonIdx);
    setChapters(newChapters);
    saveCurriculum(newChapters);
  };

  const moveLesson = (chapIdx, lessonIdx, dir) => {
    const newChapters = [...chapters];
    const lessons = newChapters[chapIdx].lessons;
    if (lessonIdx + dir < 0 || lessonIdx + dir >= lessons.length) return;
    const temp = lessons[lessonIdx];
    lessons[lessonIdx] = lessons[lessonIdx + dir];
    lessons[lessonIdx + dir] = temp;
    setChapters(newChapters);
    saveCurriculum(newChapters);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)' }}>Loading Builder...</div>;

  return (
    <div className="builder-container">
      <style>{`
        .builder-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
          box-sizing: border-box;
        }
        .chapter-card {
          background: var(--dash-surface);
          border: 1px solid var(--dash-border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .chapter-header {
          background: rgba(0, 0, 0, 0.04);
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--dash-border);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        [data-theme='dark'] .chapter-header {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .lesson-item {
          background: var(--dash-bg);
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          border: 1px solid var(--dash-border);
          margin-bottom: 0.65rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
        }
        .builder-input {
          background: var(--dash-surface);
          border: 1px solid var(--dash-border);
          border-radius: 6px;
          color: var(--dash-text);
          font-family: inherit;
          font-size: 0.875rem;
          padding: 0.55rem 0.75rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .builder-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .action-btn {
          background: transparent;
          border: none;
          color: var(--dash-text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, color 0.2s;
        }
        .action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--dash-text);
        }
        [data-theme='light'] .action-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
        }
        .action-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        @media (max-width: 600px) {
          .builder-container {
            padding: 1rem 0.5rem;
          }
          .chapter-header {
            padding: 0.75rem;
          }
          .lesson-item {
            padding: 0.5rem;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/lms/instructor/courses" style={{ color: 'var(--dash-text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Back to Courses
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--dash-text)' }}>Curriculum Builder</h2>
        </div>
        <button
          onClick={addChapter}
          style={{ padding: '0.55rem 1.25rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          + Add New Chapter
        </button>
      </div>

      {/* Chapters Array */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {chapters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: 'var(--dash-text-muted)', border: '1px dashed var(--dash-border)' }}>
            No chapters yet. Click "Add New Chapter" to start.
          </div>
        )}

        {chapters.map((chap, cIdx) => (
          <div key={cIdx} className="chapter-card">

            {/* Chapter Header */}
            <div className="chapter-header">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                <span style={{ fontWeight: 600, color: 'var(--dash-text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Chapter {cIdx + 1}:</span>
                <input
                  type="text"
                  value={chap.title}
                  onChange={(e) => renameChapter(cIdx, e.target.value)}
                  onBlur={() => saveCurriculum()}
                  placeholder="Enter Chapter Title (e.g. Recursion Basics)"
                  style={{ background: 'transparent', border: '1px solid transparent', borderBottomColor: 'var(--dash-border)', color: 'var(--dash-text)', fontSize: '0.95rem', fontWeight: 600, padding: '0.2rem 0.4rem', width: '70%', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button onClick={() => moveChapter(cIdx, -1)} disabled={cIdx === 0} className="action-btn" title="Move Up">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </button>
                <button onClick={() => moveChapter(cIdx, 1)} disabled={cIdx === chapters.length - 1} className="action-btn" title="Move Down">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button onClick={() => deleteChapter(cIdx)} className="action-btn" style={{ color: '#ef4444' }} title="Delete Chapter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div style={{ padding: '0.85rem' }}>
              {chap.lessons && chap.lessons.map((lesson, lIdx) => {
                const isEditing = activeLessonForm?.chapIdx === cIdx && activeLessonForm?.lIdx === lIdx;

                return (
                  <div key={lIdx} className="lesson-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <LessonIcon type={lesson.type} />
                        <span style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '0.875rem' }}>{lesson.title || <span style={{ color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>Lesson will appear here</span>}</span>
                        {lesson.duration ? (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--dash-text-muted)' }}>{lesson.duration} mins</span>
                        ) : null}
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button onClick={() => moveLesson(cIdx, lIdx, -1)} disabled={lIdx === 0} className="action-btn" title="Move Up">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </button>
                        <button onClick={() => moveLesson(cIdx, lIdx, 1)} disabled={lIdx === chap.lessons.length - 1} className="action-btn" title="Move Down">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <button onClick={() => setActiveLessonForm({ chapIdx: cIdx, lIdx, lesson })} className="action-btn" style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem' }}>Edit</button>
                        <button onClick={() => deleteLesson(cIdx, lIdx)} className="action-btn" style={{ color: '#ef4444', padding: '0.25rem' }} title="Delete Lesson">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Form for lesson */}
                    {isEditing && (
                      <div style={{ marginTop: '0.85rem', padding: '0.85rem 0 0 0', borderTop: '1px solid var(--dash-border)', display: 'flex', gap: '0.85rem', flexDirection: 'column' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Lesson Title</label>
                            <input
                              type="text"
                              value={activeLessonForm.lesson.title}
                              onChange={e => setActiveLessonForm(p => ({ ...p, lesson: { ...p.lesson, title: e.target.value } }))}
                              placeholder="Enter lesson title"
                              className="builder-input"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Duration (mins)</label>
                            <input
                              type="number"
                              value={activeLessonForm.lesson.duration === '' ? '' : activeLessonForm.lesson.duration}
                              onChange={e => setActiveLessonForm(p => ({ ...p, lesson: { ...p.lesson, duration: e.target.value === '' ? '' : Number(e.target.value) } }))}
                              placeholder="Enter duration in minutes"
                              className="builder-input"
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Video Content URL / Assignment Link</label>
                          <input
                            type="text"
                            value={activeLessonForm.lesson.videoUrl}
                            onChange={e => setActiveLessonForm(p => ({ ...p, lesson: { ...p.lesson, videoUrl: e.target.value } }))}
                            placeholder="e.g. https://www.youtube.com/watch?v=... or https://zoom.us/..."
                            className="builder-input"
                            style={{ marginBottom: '0.6rem' }}
                          />
                          <CustomUploader
                            onUploadSuccess={(url) => setActiveLessonForm(p => ({ ...p, lesson: { ...p.lesson, videoUrl: url } }))}
                            label="Or upload video/doc directly"
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
                          <button onClick={handleCancelLessonEdit} style={{ padding: '0.45rem 1rem', background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                          <button
                            onClick={async () => {
                              if (!activeLessonForm.lesson.title || !activeLessonForm.lesson.title.trim()) {
                                alert('Lesson title is required.');
                                return;
                              }
                              const durationNum = Number(activeLessonForm.lesson.duration);
                              if (isNaN(durationNum) || durationNum <= 0) {
                                alert('Duration must be a positive number.');
                                return;
                              }
                              const newChapters = [...chapters];
                              newChapters[cIdx].lessons[lIdx] = activeLessonForm.lesson;
                              await saveCurriculum(newChapters);
                            }}
                            style={{ padding: '0.45rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Save Lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => addLesson(cIdx)}
                style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--dash-border)', color: 'var(--dash-text-secondary)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.03)';
                  e.target.style.borderColor = 'var(--dash-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.01)';
                  e.target.style.borderColor = 'var(--dash-border)';
                }}
              >
                + Add Lesson to {chap.title || `Chapter ${cIdx + 1}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
