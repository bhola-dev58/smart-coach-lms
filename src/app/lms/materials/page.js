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
    <div className={styles.container}>
      <h1 className={styles.title}>Study Materials</h1>
      <p className={styles.subtitle}>Downloadable resources, cheatsheets, and question banks provided by your instructors.</p>

      <div className={styles.grid} style={{ marginTop: '2rem' }}>
        {materials.map((mat) => (
          <div key={mat.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ background: 'rgba(200, 16, 46, 0.1)', color: 'var(--color-primary)', padding: '0.5rem', borderRadius: '8px' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               </div>
               <span style={{ fontSize: '0.8rem', color: '#888' }}>{mat.date}</span>
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#e0e0e0', fontWeight: 600 }}>{mat.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Course: <span style={{ color: '#aaa' }}>{mat.course}</span></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>{mat.type} • {mat.size}</div>
               <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
