'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/lms/lms.module.css';

// ── Certificate Card ──
function CertCard({ cert }) {
  const date = new Date(cert.completionDate || cert.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      background: 'var(--dash-surface)',
      border: '1px solid var(--dash-border)',
      borderRadius: 'var(--dash-radius)',
      overflow: 'hidden',
      boxShadow: 'var(--dash-shadow)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--dash-shadow)';
      }}
    >
      {/* Certificate Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1B2B6B 0%, #27AE60 100%)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -10, left: -10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>🏆</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Certificate of Completion
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem', lineHeight: 1.3 }}>
              {cert.courseName}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: cert.pdfUrl
            ? 'rgba(39,174,96,0.2)' : 'rgba(245,166,35,0.2)',
          color: cert.pdfUrl ? '#27AE60' : '#F5A623',
          border: `1px solid ${cert.pdfUrl ? 'rgba(39,174,96,0.4)' : 'rgba(245,166,35,0.4)'}`,
          padding: '0.15rem 0.6rem', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700,
        }}>
          {cert.pdfUrl ? '✓ Verified' : '⏳ Processing'}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>
          {cert.instructorName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {cert.instructorName}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {date}
          </span>
          {cert.totalHours > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {cert.totalHours}h of content
            </span>
          )}
        </div>

        {/* Cert ID */}
        <div style={{
          background: 'var(--dash-bg, #F4F6F8)',
          borderRadius: 8, padding: '0.5rem 0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', fontFamily: 'monospace' }}>
            ID: {cert.certId}
          </span>
          <button
            onClick={() => navigator.clipboard?.writeText(cert.certId)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-accent)', fontSize: '0.72rem', fontWeight: 600, padding: '0 0.25rem' }}
            title="Copy certificate ID"
          >
            Copy
          </button>
        </div>

        {/* Actions */}
        {!cert.pdfUrl ? (
          <div style={{
            marginTop: 'auto',
            padding: '0.75rem',
            background: 'rgba(245,166,35,0.08)',
            border: '1px dashed rgba(245,166,35,0.3)',
            borderRadius: 8,
            textAlign: 'center',
            color: '#D97706',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            🔄 Certificate generation under process
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <Link
              href={`/lms/certificates/verify/${cert.certId}`}
              style={{
                flex: 1, textAlign: 'center', padding: '0.6rem',
                background: 'var(--color-primary, #1B2B6B)', color: 'white',
                borderRadius: 8, textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              🔍 Verify
            </Link>
            <a
              href={cert.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, textAlign: 'center', padding: '0.6rem',
                background: 'transparent', color: 'var(--color-primary, #1B2B6B)',
                border: '1px solid var(--color-primary, #1B2B6B)',
                borderRadius: 8, textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(27,43,107,0.05)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              👁️ Review Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty State ──
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.75rem' }}>
        No Certificates Yet
      </h2>
      <p style={{ color: 'var(--dash-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Complete a course to earn your first verified certificate. Each certificate is uniquely identified and shareable.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/lms/browse" style={{
          padding: '0.65rem 1.5rem',
          background: 'var(--color-primary, #1B2B6B)', color: 'white',
          borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
        }}>
          Browse Courses
        </Link>
        <Link href="/lms/courses" style={{
          padding: '0.65rem 1.5rem',
          background: 'transparent', color: 'var(--color-primary, #1B2B6B)',
          border: '1px solid var(--color-primary, #1B2B6B)',
          borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
        }}>
          My Courses
        </Link>
      </div>
    </div>
  );
}

// ── Main Certificates Page ──
export default function CertificatesPageClient() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/lms/certificates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCerts(data.certificates || []);
        } else {
          setError(data.message || 'Failed to load certificates');
        }
      })
      .catch(() => setError('Network error. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p style={{ color: 'var(--dash-text-secondary)' }}>Loading your certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dash-text-secondary)' }}>
        <p>❌ {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      {certs.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
            You have earned <strong>{certs.length}</strong> certificate{certs.length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {certs.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {certs.map(cert => (
            <CertCard key={cert._id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
