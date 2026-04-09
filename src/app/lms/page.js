'use client';

import { useState } from 'react';
import styles from './lms.module.css';

const chapters = [
  { num: 1, title: 'Introduction', progress: '3/3 ✓', lessons: [
    { id: '1.1', title: 'What is DSA?', duration: '12 min', status: 'completed' },
    { id: '1.2', title: 'Big-O Notation', duration: '25 min', status: 'completed' },
    { id: '1.3', title: 'Time & Space Complexity', duration: '30 min', status: 'completed' },
  ]},
  { num: 2, title: 'Arrays & Strings', progress: '1/4', lessons: [
    { id: '2.1', title: 'Array Basics', duration: '20 min', status: 'completed' },
    { id: '2.2', title: 'Two Pointer Technique', duration: '35 min', status: 'active' },
    { id: '2.3', title: 'Sliding Window', duration: '40 min', status: 'locked' },
    { id: '2.4', title: 'String Manipulation', duration: '28 min', status: 'locked' },
  ]},
  { num: 3, title: 'Linked Lists', progress: '0/3', lessons: [
    { id: '3.1', title: 'Singly Linked List', duration: '30 min', status: 'locked' },
    { id: '3.2', title: 'Doubly Linked List', duration: '25 min', status: 'locked' },
    { id: '3.3', title: 'Fast & Slow Pointers', duration: '35 min', status: 'locked' },
  ]},
  { num: 4, title: 'Trees & Graphs', progress: '0/5', lessons: [] },
  { num: 5, title: 'Sorting & Searching', progress: '0/4', lessons: [] },
  { num: 6, title: 'Dynamic Programming', progress: '0/6', lessons: [] },
];

const concepts = [
  'Two Sum Variations', 'Container With Most Water', 'Remove Duplicates In-place',
  'Palindrome Checking', 'Merging Sorted Arrays',
];

const resources = [
  { name: 'Two_Pointer_Notes.pdf', size: '1.2 MB · PDF Document' },
  { name: 'Practice_Problems.pdf', size: '850 KB · PDF Document' },
  { name: 'two_pointer_solutions.py', size: '24 KB · Python Script' },
];

export default function LmsPage() {
  const [activeTab, setActiveTab] = useState('notes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.lmsWrapper}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Data Structures & Algorithms</h3>
          <p className={styles.instructor}>Dr. Rajesh Kumar · 120 Hours</p>
          <div className={styles.progressBar}>
            <div className={styles.progressRow}>
              <span>Course Progress</span><span>72% Complete</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '72%' }} />
            </div>
          </div>
        </div>
        <nav className={styles.nav}>
          {chapters.map(ch => (
            <div key={ch.num}>
              <div className={styles.chapterHeader}>
                <div className={styles.chLeft}>
                  <span className={styles.chNum}>{ch.num}</span>
                  <span>{ch.title}</span>
                </div>
                <span className={styles.chProgress}>{ch.progress}</span>
              </div>
              {ch.lessons.map(l => (
                <div key={l.id} className={`${styles.lessonItem} ${styles[l.status]}`}>
                  <span className={styles.lessonIcon}>
                    {l.status === 'completed' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                    {l.status === 'active' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                    {l.status === 'locked' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  </span>
                  <span className={styles.lessonTitle}>{l.title}</span>
                  <span className={styles.lessonDuration}>{l.duration}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Toggle */}
      <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)' }}><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {/* Main */}
      <div className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <a href="/courses" className={styles.backLink}>← My Courses</a>
            <span className={styles.divider} />
            <span className={styles.courseName}>Data Structures & Algorithms</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.progressInfo}>72% Complete</span>
            <div className={styles.miniBar}><div className={styles.miniFill} /></div>
          </div>
        </div>

        {/* Video */}
        <div className={styles.videoContainer}>
          <div className={styles.videoOverlay}>
            <div className={styles.playBtn}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <span className={styles.videoLabel}>Click to play: Two Pointer Technique</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentScroll}>
          <div className={styles.content}>
            <h2>2.2 Two Pointer Technique</h2>
            <div className={styles.meta}>
              <span>⏱ 35 minutes</span>
              <span>📖 Chapter 2</span>
              <span>👤 2,400 enrolled</span>
              <span>📄 Intermediate</span>
            </div>
            <p className={styles.desc}>The two-pointer technique is a fundamental algorithmic pattern used to solve array and string problems efficiently. Instead of using nested loops (O(n²)), we use two pointers that move through the array, often reducing the time complexity to O(n).</p>

            <h3 className={styles.conceptsTitle}>⭐ Key Concepts Covered</h3>
            <div className={styles.conceptsGrid}>
              {concepts.map((c, i) => (
                <div className={styles.conceptCard} key={i}><span>{c}</span></div>
              ))}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <div className={styles.tabNav}>
                {['notes', 'qa', 'resources', 'quiz'].map(tab => (
                  <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'notes' ? '📝 Notes' : tab === 'qa' ? '💬 Q&A' : tab === 'resources' ? '📁 Resources' : '❓ Quiz'}
                    {tab === 'qa' && <span className={styles.badge}>12</span>}
                  </button>
                ))}
              </div>
              <div className={styles.tabContent}>
                {activeTab === 'notes' && (
                  <div>
                    <textarea className={styles.notes} placeholder="Take personal notes for this lesson..." rows="5" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Last saved: 2 min ago</span>
                      <button className={`${styles.navBtn} ${styles.navPrimary}`} style={{ padding: '6px 16px', fontSize: 12 }}>Save Notes</button>
                    </div>
                  </div>
                )}
                {activeTab === 'qa' && (
                  <div>
                    {[{ initials: 'AK', name: 'Amit Kumar', time: '2 days ago', text: 'What happens when both pointers point to the same element?' },
                      { initials: 'SP', name: 'Sneha Patel', time: '5 days ago', text: 'Can we use two-pointer on unsorted arrays?' }
                    ].map((q, i) => (
                      <div key={i} className={styles.qaItem}>
                        <span className={styles.qaAvatar}>{q.initials}</span>
                        <div><strong>{q.name}</strong><br/><small>{q.time}</small><p style={{ marginTop: 4 }}>{q.text}</p></div>
                      </div>
                    ))}
                    <button className={styles.navBtn} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>+ Ask a Question</button>
                  </div>
                )}
                {activeTab === 'resources' && (
                  <div>
                    {resources.map((r, i) => (
                      <div key={i} className={styles.resourceItem}>
                        <span className={styles.resourceName}>{r.name}</span>
                        <span className={styles.resourceSize}>{r.size}</span>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.4)' }}>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>🔒 Complete the Video to Unlock Quiz</p>
                    <p style={{ fontSize: 12, opacity: 0.6 }}>Watch at least 90% of the video to access.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <div className={styles.lessonNav}>
              <button className={styles.navBtn}>← Previous Lesson</button>
              <button className={`${styles.navBtn} ${styles.navPrimary}`}>Mark Complete & Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
