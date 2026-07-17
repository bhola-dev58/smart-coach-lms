import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection({ statsData = [] }) {
  const baseStats = [
    { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )},
    { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    )},
    { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    )},
  ];

  // Resolve dynamic stats with fallback properties (icons, colors, and correct suffix string formatting)
  const stats = statsData.length > 0
    ? statsData.map((item, i) => ({
        ...baseStats[i % baseStats.length],
        ...item,
        number: typeof item.number === 'number'
          ? `${item.number.toLocaleString()}${item.suffix || ''}`
          : item.number
      }))
    : baseStats.map((item, i) => ({
        ...item,
        number: i === 0 ? '1,000+' : i === 1 ? '10+' : '95%',
        label: i === 0 ? 'Students Enrolled' : i === 1 ? 'Expert Courses' : 'Academic Success Rate'
      }));

  return (
    <section className={styles.hero}>
      {/* Optimized Background Image for LCP & Web Vitals performance */}
      <Image
        src="/images/hero/hero-bg.jpg"
        alt="Gradify Academy Hero Background"
        fill
        priority
        quality={75}
        sizes="100vw"
        style={{ objectFit: 'cover', zIndex: 0 }}
      />
      <div className={styles.heroOverlay} />

      <div className={`container ${styles.heroContainer}`}>
        {/* Left Column - Main Headings & CTA buttons */}
        <div className={styles.heroContentLeft}>
          {/* Top Pill Badge */}
          <div className={`${styles.badge} animate-fade-in-up delay-100`}>
            <span className={styles.badgeIcon}>🎓</span>
            <span>India&apos;s Premium Academic Coaching Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="animate-fade-in-up delay-200">
            Master Your <span className={styles.highlightGreen}>Academic</span> Journey With{' '}
            <span className={styles.underlineHighlight}>
              Expert Coaching
              <svg className={styles.underlineSVG} viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`${styles.subtitle} animate-fade-in-up delay-300`}>
            Join thousands of school students who are building a strong foundation for board exams and competitive entries
            with personalized expert guidance.
          </p>

          {/* CTA Buttons */}
          <div className={`${styles.heroActions} animate-fade-in-up delay-400`}>
            <Link href="/courses" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', border: 'none' }}>
              {/* Rocket icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              Explore Courses
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link href="/about" className="btn btn-outline-white btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {/* Play icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              Watch Demo
            </Link>
          </div>

          {/* Handwritten Annotation */}
          <div className={`${styles.handwritingWrap} animate-scale-in delay-600`}>
            <span className={styles.handwritingText}>From Concepts to Creation!</span>
            <svg className={styles.handwritingCurve} viewBox="0 0 50 10" fill="none">
              <path d="M1,8 Q25,2 49,8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right Column - Floating Glassmorphic Stats */}
        <div className={styles.heroContentRight}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`${styles.statsCard} animate-fade-in-up`}
              style={{ animationDelay: `${500 + i * 150}ms` }}
            >
              <div className={styles.statsIconWrapper} style={{ backgroundColor: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div className={styles.statsDetails}>
                <div className={styles.statsNumber}>{stat.number}</div>
                <div className={styles.statsLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Trust Banner */}
      <div className={`${styles.trustBanner} animate-fade-in-up delay-900`}>
        <div className="container">
          <div className={styles.trustHeader}>
            <span className={styles.trustLine} />
            <span className={styles.trustTitle}>Trusted by Students &amp; Parents Across India</span>
            <span className={styles.trustLine} />
          </div>
          <div className={styles.trustItems}>
            {[
              'Expert Faculty',
              'Structured Learning',
              'Regular Assessments',
              'Personalized Guidance',
            ].map((text, i) => (
              <div key={i} className={styles.trustItem}>
                <span className={styles.checkIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative dot grids on the sides */}
        <div className={`${styles.dotGrid} ${styles.dotGridLeft}`} />
        <div className={`${styles.dotGrid} ${styles.dotGridRight}`} />
      </div>
    </section>
  );
}
