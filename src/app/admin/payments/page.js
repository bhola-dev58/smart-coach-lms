import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import '@/models/User';
import '@/models/Course';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Financials | Admin' };

export default async function AdminPaymentsPage() {
  await connectDB();
  
  const payments = await Payment.find({})
    .populate('student', 'name email')
    .populate('course', 'title price')
    .sort({ createdAt: -1 })
    .lean();
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Transaction History</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Transaction ID (RZP)</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Student</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Course</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Amount</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
               <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No payment records found.</td></tr>
            )}
            {payments.map(txn => (
              <tr key={txn._id.toString()} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                   <div>{txn.razorpayOrderId}</div>
                   {txn.razorpayPaymentId && <div style={{ color: '#666', marginTop: '0.2rem' }}>{txn.razorpayPaymentId}</div>}
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ fontWeight: 500 }}>{txn.student?.name || 'Unknown'}</div>
                   <div style={{ fontSize: '0.8rem', color: '#666' }}>{txn.student?.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ fontWeight: 500 }}>{txn.course?.title || 'Unknown Course'}</div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>
                   ₹{(txn.amount / 100).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    background: txn.status === 'captured' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                    color: txn.status === 'captured' ? '#2ed573' : '#ffab00',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {txn.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                   {new Date(txn.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
