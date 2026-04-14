import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Link from 'next/link';

export const metadata = {
  title: 'My Learning Dashboard - MeetMe Center',
};

export default async function LMSDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="section" style={{ background: 'var(--color-surface)', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            {session?.user?.role?.toUpperCase()}
          </span>
          <h1 style={{ marginBottom: '1rem' }}>Welcome, {session?.user?.name}!</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Logged in as {session?.user?.email}
          </p>

          <div className="grid grid-3">
            {/* Just placeholders for now */}
            <div className="card">
              <div className="card-body">
                <h3>My Courses</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0' }}>
                  You haven't enrolled in any courses yet.
                </p>
                <Link href="/courses" className="btn btn-outline btn-sm">Browse Courses</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
