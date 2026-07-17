'use client';

import Link from 'next/link';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'For Class 8–12',
    desc: 'CBSE | ICSE | State Boards',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.08)',
    link: '/courses',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Board Exam Prep',
    desc: 'Score Higher with Strategy',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    link: '/whitefield-bangalore-coaching',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    title: 'Competitive Exams',
    desc: 'JEE | NEET | CUET & More',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    link: '/courses',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Expert Mentors',
    desc: 'Learn from the Best',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.08)',
    link: '/about',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Doubt Support',
    desc: 'Always Here to Help',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    link: '/contact',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section section-white" style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-12) 0' }}>
      <div className="container">
        {/* Responsive Grid containing exactly 5 clickable highlight cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-5)',
            marginTop: '1.5rem', /* Solved overlapping: replaced negative margin with clean spacing */
            position: 'relative',
            zIndex: 4,
          }}
        >
          {features.map((f, i) => (
            <Link
              href={f.link}
              key={i}
              className="animate-fade-in-up"
              style={{
                textDecoration: 'none',
                background: 'white',
                padding: 'var(--space-6) var(--space-4)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                animationDelay: `${150 * i}ms`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = f.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.03)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              {/* Colored Circular Icon wrapper */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: f.color,
                  backgroundColor: f.bg,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', margin: 0, fontWeight: 500 }}>
                {f.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
