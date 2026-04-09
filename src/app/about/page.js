import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description: 'Learn about MeetMe Center — India\'s premier B.Tech coaching institute. Our story, mission, expert faculty since 2018.',
};

export default function AboutPage() {
  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>About MeetMe Center</h1>
          <nav className="breadcrumb"><Link href="/">Home</Link><span className="separator">/</span><span className="current">About Us</span></nav>
        </div>
      </div>

      {/* Our Story */}
      <section className="section section-white">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div>
              <span className="section-label">Our Story</span>
              <h2 style={{ marginTop: 'var(--space-2)' }}>Building India&apos;s Best B.Tech Coaching Platform</h2>
              <div className="section-divider" style={{ margin: 'var(--space-4) 0' }} />
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>Founded in 2018, MeetMe Center started with a simple mission — to make quality engineering education accessible to every B.Tech student in India, regardless of their college tier or financial background.</p>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>What began as a small coaching center in Bengaluru with 3 faculty and 50 students has grown into a comprehensive edtech platform serving over 10,000 students across 150+ cities.</p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link href="/courses" className="btn btn-primary">Explore Courses</Link>
                <Link href="/contact" className="btn btn-outline">Contact Us</Link>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src="/images/hero/hero-bg.jpg" alt="MeetMe Center Campus" style={{ width: '100%', height: 400, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
              <div style={{ position: 'absolute', bottom: -20, right: -20, background: 'var(--color-primary)', color: 'white', padding: 'var(--space-6)', textAlign:'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800 }}>8+</div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Showcase */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Expert Mentors</span>
            <h2>Our Faculty</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-3">
            {[
              { name: 'Dr. Rajesh Kumar', role: 'Head of CSE', image: '/images/faculty/faculty-1.jpg' },
              { name: 'Prof. Sneha Patel', role: 'AI/ML Expert', image: '/images/faculty/faculty-2.jpg' },
              { name: 'Dr. Amit Bansal', role: 'GATE Specialist', image: '/images/faculty/faculty-3.jpg' },
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <img src={f.image} alt={f.name} style={{ width: '100%', height: 300, objectFit: 'cover', marginBottom: 'var(--space-4)', border: '1px solid var(--color-border)' }} />
                <h4 style={{ marginBottom: 'var(--space-1)' }}>{f.name}</h4>
                <p style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{f.role}</p>
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
            <h2>Mission & Vision</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-2">
            <div style={{ background: 'white', padding: 'var(--space-8)', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-primary)' }}>
              <h3 style={{ marginBottom: 'var(--space-3)' }}>Our Mission</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)' }}>To democratize quality engineering education by providing affordable, accessible, and industry-relevant coaching that empowers B.Tech students to achieve academic excellence and career success.</p>
            </div>
            <div style={{ background: 'white', padding: 'var(--space-8)', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-dark)' }}>
              <h3 style={{ marginBottom: 'var(--space-3)' }}>Our Vision</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 'var(--leading-relaxed)' }}>To become India&apos;s most trusted engineering education platform by 2030, producing 100,000+ industry-ready engineers equipped with knowledge, skills, and confidence to drive innovation globally.</p>
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
