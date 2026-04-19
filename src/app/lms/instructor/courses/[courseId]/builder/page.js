'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUploader from '@/components/lms/instructor/CustomUploader';

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
  const [activeLessonForm, setActiveLessonForm] = useState(null); // { idx, lesson } or null

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
    const newChapters = [...chapters, { title: 'New Chapter', lessons: [] }];
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
    const newLesson = { title: 'New Lesson', type: 'video', duration: 0, videoUrl: '', slug: `lesson-${Date.now()}` };
    const newChapters = [...chapters];
    newChapters[chapIdx].lessons.push(newLesson);
    setChapters(newChapters);
    saveCurriculum(newChapters);
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

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Builder...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link href="/lms/instructor/courses" style={{ color: 'var(--dash-text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Back to Courses
          </Link>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', color: 'var(--dash-text)' }}>Curriculum Builder</h2>
        </div>
        <button 
          onClick={addChapter}
          style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + Add New Chapter
        </button>
      </div>

      {/* Chapters Array */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {chapters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: 'var(--dash-text-muted)' }}>
            No chapters yet. Click "Add New Chapter" to start.
          </div>
        )}

        {chapters.map((chap, cIdx) => (
          <div key={cIdx} style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', overflow: 'hidden' }}>
            
            {/* Chapter Header */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--dash-border)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--dash-text-muted)' }}>Chapter {cIdx + 1}:</span>
                <input 
                  type="text" 
                  value={chap.title} 
                  onChange={(e) => renameChapter(cIdx, e.target.value)}
                  onBlur={() => saveCurriculum()}
                  style={{ background: 'transparent', border: '1px solid transparent', borderBottomColor: 'var(--dash-border)', color: 'var(--dash-text)', fontSize: '1rem', fontWeight: 600, padding: '0.3rem', width: '60%', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => moveChapter(cIdx, -1)} disabled={cIdx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer' }}>↑</button>
                <button onClick={() => moveChapter(cIdx, 1)} disabled={cIdx === chapters.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer' }}>↓</button>
                <button onClick={() => deleteChapter(cIdx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button>
              </div>
            </div>

            {/* Lessons List */}
            <div style={{ padding: '1rem' }}>
              {chap.lessons && chap.lessons.map((lesson, lIdx) => {
                const isEditing = activeLessonForm?.chapIdx === cIdx && activeLessonForm?.lIdx === lIdx;
                
                return (
                  <div key={lIdx} style={{ background: 'var(--dash-bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>{lesson.type === 'video' ? '📺' : '📝'}</span>
                        <span style={{ color: 'var(--dash-text)', fontWeight: 500 }}>{lesson.title}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', color: 'var(--dash-text-muted)' }}>{lesson.duration} mins</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.ce' }}>
                        <button onClick={() => moveLesson(cIdx, lIdx, -1)} disabled={lIdx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '0.2rem' }}>↑</button>
                        <button onClick={() => moveLesson(cIdx, lIdx, 1)} disabled={lIdx === chap.lessons.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '0.2rem' }}>↓</button>
                        <button onClick={() => setActiveLessonForm({ chapIdx: cIdx, lIdx, lesson })} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginLeft: '0.5rem', padding: '0.2rem' }}>Edit</button>
                        <button onClick={() => deleteLesson(cIdx, lIdx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '0.5rem', padding: '0.2rem' }}>Delete</button>
                      </div>
                    </div>

                    {/* Expandable Form for lesson */}
                    {isEditing && (
                      <div style={{ marginTop: '1rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>Lesson Title</label>
                            <input type="text" value={activeLessonForm.lesson.title} onChange={e => setActiveLessonForm(p => ({...p, lesson: {...p.lesson, title: e.target.value}}))} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--dash-border)', borderRadius: '4px', color: 'white' }}/>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>Duration (mins)</label>
                            <input type="number" value={activeLessonForm.lesson.duration} onChange={e => setActiveLessonForm(p => ({...p, lesson: {...p.lesson, duration: Number(e.target.value)}}))} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--dash-border)', borderRadius: '4px', color: 'white' }}/>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>Video Content URL / Assignment Link</label>
                          <input type="text" value={activeLessonForm.lesson.videoUrl} onChange={e => setActiveLessonForm(p => ({...p, lesson: {...p.lesson, videoUrl: e.target.value}}))} placeholder="https://..." style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--dash-border)', borderRadius: '4px', color: 'white', marginBottom: '0.5rem' }}/>
                          <CustomUploader 
                            onUploadSuccess={(url) => setActiveLessonForm(p => ({...p, lesson: {...p.lesson, videoUrl: url}}))} 
                            label="Or upload video/doc to Cloudinary directly"
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => setActiveLessonForm(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                          <button 
                            onClick={async () => {
                              const newChapters = [...chapters];
                              newChapters[cIdx].lessons[lIdx] = activeLessonForm.lesson;
                              await saveCurriculum(newChapters);
                            }} 
                            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--dash-border)', color: 'var(--dash-text-secondary)', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                + Add Lesson to {chap.title}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
