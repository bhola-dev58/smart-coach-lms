import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" fill="#C8102E"/><path d="M10 28V12L16 20L22 12V28" stroke="white" strokeWidth="2.5" strokeLinecap="square"/><path d="M26 12V28H32" stroke="white" strokeWidth="2.5" strokeLinecap="square"/></svg>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                  <span style={{ color: '#C8102E' }}>Meet</span>Me Center
                </span>
              </Link>
              <p>Empowering B.Tech students with expert coaching, industry-relevant courses, and personalized mentorship since 2018.</p>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/courses">All Courses</Link></li>
                <li><Link href="/lms">Student LMS</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Popular Courses</h4>
              <ul className="footer-links">
                <li><Link href="/courses">Data Structures & Algorithms</Link></li>
                <li><Link href="/courses">Full Stack Web Development</Link></li>
                <li><Link href="/courses">Machine Learning & AI</Link></li>
                <li><Link href="/courses">GATE Preparation</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Get In Touch</h4>
              <ul className="footer-contact">
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#C8102E' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Block A, Tech Park Road,<br/>Bengaluru 560001</span>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#C8102E' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} MeetMe Center. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
