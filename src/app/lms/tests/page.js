import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import Enrollment from '@/models/Enrollment';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export const metadata = { title: 'My Assignments & Tests — MeetMe Center' };

export default async function MyTestSeriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/?auth=login');

  await connectDB();

  // 1. Get enrolled courses
  const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
  const courseIds = enrollments.map(e => e.course);

  // 2. Fetch Assignments linked to those courses
  const assignmentsRaw = await Assignment.find({ course: { $in: courseIds } })
    .populate('course', 'title')
    .sort({ dueDate: 1 })
    .lean();

  // 3. Fetch submissions for this student
  const submissionsRaw = await AssignmentSubmission.find({ student: session.user.id }).lean();
  const subMap = {};
  submissionsRaw.forEach(s => {
    subMap[s.assignment.toString()] = s;
  });

  const now = new Date();

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--dash-text)', marginBottom: '0.4rem', fontWeight: 700 }}>
          Assignments & Tests
        </h1>
        <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
          Complete required tasks to earn a certificate of completion.
        </p>
      </div>

      {assignmentsRaw.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📝</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No pending assignments</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
            Instructors haven't assigned any tests for your enrolled courses yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {assignmentsRaw.map(a => {
            const sub = subMap[a._id.toString()];
            const isLate = new Date(a.dueDate) < now;
            let status = sub ? sub.status.toUpperCase() : (isLate ? 'OVERDUE' : 'PENDING');
            let statusColor = sub ? '#2ed573' : (isLate ? '#e74c3c' : '#f39c12');

            return (
              <div key={a._id.toString()} style={{ background: 'var(--dash-surface)', border: `1px solid ${statusColor}`, borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.4rem 0.8rem', background: statusColor, color: 'white', fontSize: '0.7rem', fontWeight: 700, borderBottomLeftRadius: '8px' }}>
                  {status}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', marginBottom: '0.5rem' }}>{a.course?.title}</div>
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{a.title}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--dash-text-secondary)', marginBottom: '1.25rem' }}>
                  <span>Due: {new Date(a.dueDate).toLocaleDateString('en-IN')}</span>
                  <span>Marks: {a.totalMarks}</span>
                </div>

                {sub ? (
                  <div style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#2ed573', fontWeight: 600 }}>Successfully Submitted</div>
                    {sub.status === 'graded' && (
                      <div style={{ fontSize: '1rem', color: 'var(--dash-text)', fontWeight: 700, marginTop: '0.2rem' }}>
                        Score: {sub.marksAwarded} / {a.totalMarks}
                      </div>
                    )}
                  </div>
                ) : (
                  <button style={{ width: '100%', padding: '0.75rem', background: statusColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    {isLate ? 'Submit Late' : 'Start Task'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
