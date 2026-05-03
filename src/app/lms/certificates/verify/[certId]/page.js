import { connectDB } from '@/lib/db';
import Certificate from '@/models/Certificate';
import Link from 'next/link';

// ============================================
// 🔍 PUBLIC CERTIFICATE VERIFICATION PAGE
// Anyone with a cert ID can verify its authenticity
// ============================================

export default async function VerifyCertificatePage({ params }) {
  const { certId } = await params;

  await connectDB();
  const certificate = await Certificate.findOne({ certId })
    .populate('student', 'name email')
    .populate('course', 'title totalHours')
    .lean();

  if (!certificate || certificate.status === 'revoked') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {certificate?.status === 'revoked' ? 'Certificate Revoked' : 'Certificate Not Found'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            {certificate?.status === 'revoked'
              ? `This certificate was revoked on ${new Date(certificate.revokedAt).toLocaleDateString('en-IN')}.`
              : `No certificate found with ID: ${certId}`
            }
          </p>
          <Link href="/" style={{
            background: '#C8102E', color: 'white', padding: '12px 30px',
            textDecoration: 'none', borderRadius: '8px', fontWeight: 600,
          }}>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white',
      fontFamily: 'system-ui, sans-serif', padding: '2rem',
    }}>
      <div style={{
        maxWidth: 700, width: '100%', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        padding: '3rem', backdropFilter: 'blur(10px)',
      }}>
        {/* Verification Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 4px 30px rgba(46,204,113,0.3)',
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Certificate Verified ✅</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            This certificate is authentic and issued by MeetMe Center
          </p>
        </div>

        {/* Certificate Details */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Student Name
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certificate.studentName}</p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Certificate ID
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace', color: '#FFD700' }}>
              {certificate.certId}
            </p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Course Completed
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certificate.courseName}</p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Completion Date
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{completionDate}</p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Instructor
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certificate.instructorName || 'MeetMe Center'}</p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              Total Duration
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certificate.totalHours || 0} hours</p>
          </div>
        </div>

        {/* Certificate Image Preview */}
        {certificate.imageUrl && (
          <div style={{
            borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '2rem',
          }}>
            <img
              src={certificate.imageUrl}
              alt="Certificate Preview"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            Issued on {completionDate} • MeetMe Center Learning Platform
          </p>
          <Link href="/" style={{
            display: 'inline-block', marginTop: '1rem',
            color: '#C8102E', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          }}>
            ← Back to MeetMe Center
          </Link>
        </div>
      </div>
    </div>
  );
}
