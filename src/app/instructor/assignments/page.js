import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export const metadata = {
  title: 'Assignments - Instructor Panel',
};

export default async function InstructorAssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Fetch Assignments created by this instructor
  const assignments = await Assignment.find({ instructor: session.user.id })
    .populate('course', 'title category')
    .sort({ dueDate: 1 })
    .lean();

  // Fetch submission counts for each assignment (using Promise.all for simplicity)
  const assignmentsWithStats = await Promise.all(
    assignments.map(async (assign) => {
      const submissions = await AssignmentSubmission.find({ assignment: assign._id }).lean();
      const graded = submissions.filter(s => s.status === 'graded').length;
      return {
        ...assign,
        totalSubmissions: submissions.length,
        gradedSubmissions: graded,
      };
    })
  );

  const now = new Date();
  const activeAssignments = assignmentsWithStats.filter(a => new Date(a.dueDate) >= now);
  const pastAssignments = assignmentsWithStats.filter(a => new Date(a.dueDate) < now);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Assignments & Grading
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Create tasks, set deadlines, and evaluate student submissions.
          </p>
        </div>
        <button style={{
          background: 'var(--color-primary)', color: 'white', border: 'none',
          padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}>
          + Create Assignment
        </button>
      </div>

      <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Active Assignments</h2>
      {activeAssignments.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', 
          borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>📝</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Active Assignments</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            You haven't assigned any active tasks. Keep your students engaged!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {activeAssignments.map((a, idx) => (
            <div key={idx} style={{
              background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
              borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--dash-shadow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{a.title}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f39c12', background: 'rgba(243,156,18,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>
              <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Course: <strong>{a.course?.title}</strong><br/>
                Due Date: <strong style={{ color: 'var(--dash-text)' }}>{new Date(a.dueDate).toLocaleDateString('en-IN')}</strong><br/>
                Max Marks: <strong>{a.totalMarks}</strong>
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'var(--dash-bg)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dash-text)' }}>{a.totalSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>SUBMITTED</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'var(--dash-border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2ed573' }}>{a.gradedSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>GRADED</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'var(--dash-border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{a.totalSubmissions - a.gradedSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>PENDING</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ 
                  flex: 1, padding: '0.6rem', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)',
                  border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                }}>
                  Grade Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastAssignments.length > 0 && (
        <>
          <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Past Assignments</h2>
          <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Title</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Due Date</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>Graded</th>
                </tr>
              </thead>
              <tbody>
                {pastAssignments.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{a.course?.title || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{new Date(a.dueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', color: a.totalSubmissions === a.gradedSubmissions && a.totalSubmissions > 0 ? '#2ed573' : 'var(--dash-text)' }}>
                      {a.gradedSubmissions} / {a.totalSubmissions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}
