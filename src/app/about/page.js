import Link from 'next/link';
import styles from './about.module.css';

export const metadata = {
  title: 'About Us - Our Story, Mission & Faculty | Gradify Academy',
  description: 'Learn about Gradify Academy — India\'s premier school coaching platform. Read about our story, mission, vision, IITian/NITian expert faculty, and core values.',
};

export default function AboutPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://gradify.academy"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": "https://gradify.academy/about"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="page-banner">
        <div className="container">
          <h1>About Gradify Academy</h1>
          <nav className="breadcrumb"><Link href="/">Home</Link><span className="separator">/</span><span className="current">About Us</span></nav>
        </div>
      </div>

      {/* Our Story */}
      <section className="section section-white">
        <div className="container">
          <div className={styles.storyGrid}>
            <div>
              <span className="section-label">Our Story</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>Building India&apos;s Best School Coaching Platform</h2>
              <div className="section-divider" style={{ margin: 'var(--space-4) 0' }} />
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>Founded with a clear mission — Gradify Academy brings quality school education to every student across India, building solid foundations regardless of school tier or financial background.</p>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>What began as a small coaching center in Bengaluru with 3 faculty and 50 students has grown into a comprehensive edtech platform serving over 10,000 students across 150+ cities.</p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link href="/courses" className="btn btn-primary btn-md">Explore Courses</Link>
                <Link href="/contact" className="btn btn-outline btn-md">Contact Us</Link>
              </div>
            </div>
            <div className={styles.imageWrapper}>
              <img src="/images/hero/hero-bg.jpg" alt="Gradify Academy Campus" className={styles.storyImage} />
              <div className={styles.badge}>
                <div className={styles.badgeNumber}>8+</div>
                <Link href="/about" className={styles.badgeLink}>→ About Gradify Academy</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizers & Team Showcase */}
      <section className={styles.organizerSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Team</span>
            <h2>Founding Team &amp; Experts</h2>
            <div className="section-divider" />
            <p style={{ color: 'var(--color-text-light)', marginTop: 'var(--space-2)' }}>
              Meet the visionaries, technical experts, and organizers powering the Gradify Academy platform.
            </p>
          </div>
          <div className={styles.organizerGrid}>
            {[
              { name: 'Er. Adarsh Tiwari', role: 'Founder', image: '/images/faculty/faculty-1.jpg' },
              { name: 'Bhola Yadav', role: 'Technical Expert', image: '/images/faculty/faculty-2.jpg' },
              { name: 'Rudraksha', role: 'Promotion Head', image: '/images/faculty/faculty-3.jpg' },
              { name: 'Antriksh', role: 'Digital Marketing Head', image: '/images/faculty/faculty-4.jpg' },
              { name: 'Priyanshu', role: 'Content Head', image: '/images/faculty/faculty-5.jpg' },
            ].map((f, i) => (
              <div key={i} className={styles.organizerCard}>
                <img src={f.image} alt={`${f.name} — Gradify Academy ${f.role}`} className={styles.avatar} />
                <div className={styles.details}>
                  <h4 className={styles.name}>{f.name}</h4>
                  <p className={styles.role}>{f.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Purpose</span>
            <h2>Mission &amp; Vision</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-2">
            <div className={`${styles.purposeCard} ${styles.mission}`}>
              <div className={styles.purposeIconWrapper}>
                {/* 🎯 Bullseye Target SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className={styles.purposeTitle}>Our Mission</h3>
              <p className={styles.purposeText}>
                To democratize quality school education by providing affordable, accessible, and comprehensive coaching that empowers Class 8 to 12 students to achieve academic excellence and succeed in their careers.
              </p>
            </div>
            <div className={`${styles.purposeCard} ${styles.vision}`}>
              <div className={styles.purposeIconWrapper}>
                {/* 🧭 Compass Vision SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <h3 className={styles.purposeTitle}>Our Vision</h3>
              <p className={styles.purposeText}>
                To become India&apos;s most trusted school coaching platform by 2030, empowering 100,000+ students equipped with deep knowledge, critical thinking, and confidence to succeed globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What Drives Us</span>
            <h2>Our Core Values</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-4">
            {[
              { title: 'Excellence', desc: 'We never compromise on quality. Every lecture, every resource is crafted to deliver the best learning experience.' },
              { title: 'Student First', desc: 'Every decision we make starts with one question: "Will this help our students succeed?"' },
              { title: 'Accessibility', desc: 'Quality education shouldn\'t be a privilege. We keep our prices affordable and offer scholarships.' },
              { title: 'Innovation', desc: 'We embrace modern technology — from AI-powered doubt solving to interactive coding labs.' },
            ].map((v, i) => (
              <div className="feature-card" key={i}>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <div><h2>Want to Join Our Team?</h2><p>We&apos;re always looking for passionate educators and tech professionals.</p></div>
          <Link href="/contact" className="btn btn-white btn-lg">Get in Touch</Link>
        </div>
      </section>
    </>
  );
}
