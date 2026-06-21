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

  // ── Not Found / Revoked ──
  if (!certificate || certificate.status === 'revoked') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F8F9FB', fontFamily: 'system-ui, sans-serif', padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.25rem',
            background: '#FEE2E2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem',
          }}>
            ❌
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#1A1A1A', marginBottom: '0.75rem', fontWeight: 800 }}>
            {certificate?.status === 'revoked' ? 'Certificate Revoked' : 'Certificate Not Found'}
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: 1.6 }}>
            {certificate?.status === 'revoked'
              ? `This certificate was revoked on ${new Date(certificate.revokedAt).toLocaleDateString('en-IN')}.`
              : `No certificate found with ID: ${certId}. Please check the ID and try again.`
            }
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            background: '#1B2B6B', color: 'white', padding: '0.75rem 2rem',
            textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
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

  const detailItems = [
    { label: 'Student Name', value: certificate.studentName },
    { label: 'Certificate ID', value: certificate.certId, mono: true, accent: true },
    { label: 'Course Completed', value: certificate.courseName },
    { label: 'Completion Date', value: completionDate },
    { label: 'Instructor', value: certificate.instructorName || 'Gradify Academy' },
    { label: 'Total Duration', value: `${certificate.totalHours || 0} hours` },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F6F8',
      fontFamily: "'Inter', 'system-ui', sans-serif",
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Gradify Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1B2B6B', letterSpacing: '-0.5px' }}>
              Gradify Academy
            </span>
          </Link>
          <p style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: '0.25rem' }}>
            Certificate Verification Portal
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

          {/* Success Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1B2B6B 0%, #27AE60 100%)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1rem',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', border: '2px solid rgba(255,255,255,0.3)',
              position: 'relative', zIndex: 1,
            }}>
              🏆
            </div>
            <h1 style={{
              color: 'white', fontSize: '1.6rem', fontWeight: 800,
              marginBottom: '0.4rem', position: 'relative', zIndex: 1,
            }}>
              Certificate Verified ✅
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', position: 'relative', zIndex: 1 }}>
              This certificate is authentic and officially issued by Gradify Academy
            </p>
          </div>

          {/* Details Grid */}
          <div style={{ padding: '2rem' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem', marginBottom: '2rem',
            }}>
              {detailItems.map(item => (
                <div key={item.label} style={{
                  background: '#F8F9FB', borderRadius: 10, padding: '1rem 1.25rem',
                  border: '1px solid #E5E7EB',
                }}>
                  <p style={{
                    color: '#9CA3AF', fontSize: '0.7rem', textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.35rem',
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '0.98rem', fontWeight: 700,
                    color: item.accent ? '#1B2B6B' : '#1A1A1A',
                    fontFamily: item.mono ? 'monospace' : 'inherit',
                    wordBreak: 'break-all',
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Certificate Image Preview */}
            {certificate.imageUrl && (
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid #E5E7EB', marginBottom: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <img
                  src={certificate.imageUrl}
                  alt="Certificate Preview"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {/* Footer CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
              paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB',
            }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                Issued on {completionDate} &bull; Gradify Academy Learning Platform
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {certificate.pdfUrl && (
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.55rem 1.25rem',
                      background: '#1B2B6B', color: 'white',
                      borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    ⬇️ Download PDF
                  </a>
                )}
                <Link href="/" style={{
                  padding: '0.55rem 1.25rem',
                  background: 'transparent', color: '#1B2B6B',
                  border: '1px solid #1B2B6B',
                  borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
                  textDecoration: 'none',
                }}>
                  ← Gradify Academy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Gradify Academy &copy; {new Date().getFullYear()} &bull; All certificates are uniquely identified and tamper-proof.
        </p>
      </div>
    </div>
  );
}
