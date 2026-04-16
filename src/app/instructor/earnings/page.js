import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export const metadata = {
  title: 'Earnings - Instructor Panel',
};

export default async function InstructorEarningsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Find instructor's courses
  const courses = await Course.find({ instructor: session.user.id }).lean();
  const courseIds = courses.map(c => c._id);

  // Find all enrollments
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('course', 'title price')
    .sort({ enrolledAt: -1 })
    .lean();

  // Calculate earnings
  let totalRevenue = 0;
  const earningsByCourse = {};

  enrollments.forEach(enr => {
    const revenue = enr.course?.price || 0;
    totalRevenue += revenue;
    
    const cId = enr.course?._id.toString();
    if (!earningsByCourse[cId]) {
      earningsByCourse[cId] = {
        title: enr.course?.title || 'Unknown',
        sales: 0,
        revenue: 0
      };
    }
    earningsByCourse[cId].sales += 1;
    earningsByCourse[cId].revenue += revenue;
  });

  const courseBreakdown = Object.values(earningsByCourse).sort((a,b) => b.revenue - a.revenue);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Earnings & Revenue
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Track your lifetime earnings, course sales, and request payouts.
          </p>
        </div>
        <button style={{
          background: 'var(--dash-accent)', color: 'white', border: 'none',
          padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}>
          Request Payout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--dash-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>LIFETIME EARNINGS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dash-text)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.8rem', color: '#2ed573', marginTop: '0.5rem', fontWeight: 500 }}>+₹{(totalRevenue * 0.1).toFixed(0)} this month</div>
        </div>
        
        <div style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--dash-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL SALES</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dash-text)' }}>{enrollments.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#2ed573', marginTop: '0.5rem', fontWeight: 500 }}>{Math.floor(enrollments.length * 0.1)} new this month</div>
        </div>

        <div style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--dash-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>PLATFORM FEE (10%)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{(totalRevenue * 0.1).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>Deducted from gross</div>
        </div>
      </div>

      <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Course Breakdown</h2>
      {courseBreakdown.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', 
          borderRadius: '12px', padding: '3rem', textAlign: 'center' 
        }}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.95rem' }}>No sales data available yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course Name</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>Total Sales</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {courseBreakdown.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>{item.sales}</td>
                  <td style={{ padding: '1rem', color: '#2ed573', fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>₹{item.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(46,213,115,0.05)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: '12px' }}>
        <h3 style={{ color: '#2ed573', fontSize: '1rem', marginBottom: '0.5rem' }}>Next Payout Expected</h3>
        <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          Your estimated payout for this month will be processed by the 5th of next month directly to your registered bank account.
        </p>
      </div>
    </div>
  );
}
