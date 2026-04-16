import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Payment from '@/models/Payment';
import styles from './admin.module.css';

export default async function AdminDashboardPage() {
  await connectDB();

  const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Dashboard Overview</h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>{totalUsers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Published Courses</div>
          <div className={styles.statValue}>{totalCourses}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Enrollments</div>
          <div className={styles.statValue}>{totalEnrollments}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue}>₹{revenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
         <div className={styles.statCard} style={{ gridColumn: 'span 2' }}>
            <h3 style={{ marginBottom: '1rem' }}>Welcome to the Control Panel</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
               From this panel, you can manage the entire application database dynamically. 
               Navigate through the sidebar to Create, Read, Update, and Delete courses, users, and oversee financial records. All actions reflect live on the website.
            </p>
         </div>
      </div>
    </div>
  );
}
