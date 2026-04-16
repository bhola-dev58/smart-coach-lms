import styles from '@/app/lms/lms.module.css';
import Link from 'next/link';

export const metadata = { title: 'Study Materials | LMS' };

export default function MaterialsPage() {
  const materials = [
    { id: 1, title: 'Maths Formula List (PDF)', course: 'Advance Maths for Placements', type: 'PDF', size: '2.4 MB', date: 'Oct 2' },
    { id: 2, title: 'Digital Electronics Logic Cheatsheet', course: 'Digital Electronics Mastery', type: 'PDF', size: '1.1 MB', date: 'Sep 28' },
    { id: 3, title: 'Aptitude Question Bank 2024', course: 'Placement Preparation Pack', type: 'ZIP', size: '15 MB', date: 'Aug 15' },
    { id: 4, title: 'React Interview Guides', course: 'Full Stack Web Dev', type: 'PDF', size: '4.5 MB', date: 'Jul 22' },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--dash-text)', marginBottom: '0.4rem', fontWeight: 700 }}>
          Study Materials
        </h1>
        <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
          Downloadable resources, cheatsheets, and question banks provided by your instructors.
        </p>
      </div>

      {/* Materials Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {materials.map((mat) => (
          <div key={mat.id} className={styles.dCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            
            {/* Top Row: Icon & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', padding: '0.6rem', borderRadius: '10px' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <line x1="16" y1="13" x2="8" y2="13"></line>
                   <line x1="16" y1="17" x2="8" y2="17"></line>
                 </svg>
               </div>
               <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dash-text-muted)' }}>{mat.date}</span>
            </div>
            
            {/* Middle Row: Title & Course */}
            <div style={{ marginTop: '0.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem 0', color: 'var(--dash-text)', fontWeight: 700, lineHeight: 1.3 }}>
                {mat.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', margin: 0 }}>
                Course: <span style={{ color: 'var(--dash-text-secondary)', fontWeight: 500 }}>{mat.course}</span>
              </p>
            </div>

            {/* Bottom Row: File Info & Download Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--dash-border)' }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', fontWeight: 500 }}>
                 {mat.type} • {mat.size}
               </div>
               <button className={styles.outlineBtn}>
                 Download
               </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
