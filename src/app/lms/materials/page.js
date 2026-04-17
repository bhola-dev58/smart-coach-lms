import styles from '@/app/lms/lms.module.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import StudyMaterial from '@/models/StudyMaterial';
import Enrollment from '@/models/Enrollment';

export const metadata = { title: 'Study Materials | LMS' };

export default async function MaterialsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/?auth=login');

  await connectDB();

  // Find enrolled courses for this student
  const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
  const courseIds = enrollments.map(e => e.course);

  // Fetch materials tied to these courses
  const materials = await StudyMaterial.find({ course: { $in: courseIds } })
    .populate('course', 'title category')
    .sort({ createdAt: -1 })
    .lean();

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
      {materials.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>📂</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Materials Found</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
            Instructors haven't uploaded any study materials for your enrolled courses yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {materials.map((mat) => (
            <div key={mat._id.toString()} className={styles.dCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
              
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
                 <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dash-text-muted)' }}>
                   {new Date(mat.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                 </span>
              </div>
              
              {/* Middle Row: Title & Course */}
              <div style={{ marginTop: '0.2rem' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem 0', color: 'var(--dash-text)', fontWeight: 700, lineHeight: 1.3 }}>
                  {mat.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', margin: 0 }}>
                  Course: <span style={{ color: 'var(--dash-text-secondary)', fontWeight: 500 }}>{mat.course?.title || 'Unknown'}</span>
                </p>
              </div>

              {/* Bottom Row: File Info & Download Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--dash-border)' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', fontWeight: 500 }}>
                   {mat.fileType} • {mat.size}
                 </div>
                 <a href={mat.fileUrl} target="_blank" rel="noreferrer" className={styles.outlineBtn} style={{ textDecoration: 'none' }}>
                   Download
                 </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
