import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="/images/logo-only.png"
                  alt="Gradify Academy"
                  style={{ height: '48px', width: 'auto', display: 'block', borderRadius: '10px' }}
                />
              </Link>
              <p>Empowering school students with expert coaching, conceptual academic courses, and personalized mentorship — From Concepts to Creation.</p>
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
              <h4>Popular Classes</h4>
              <ul className="footer-links">
                <li><Link href="/courses">Class 8-10 Math & Science</Link></li>
                <li><Link href="/courses">Class 11-12 Physics & Chemistry</Link></li>
                <li><Link href="/courses">IIT-JEE & NEET Foundations</Link></li>
                <li><Link href="/courses">Olympiad & NTSE Prep</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Get In Touch</h4>
              <ul className="footer-contact">
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#27AE60' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span style={{ whiteSpace: 'nowrap' }}>10th Cross, Varthur, Devasthanagalu,<br />Bengaluru, Karnataka 560087, India</span>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#27AE60' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  <span>+91 8874270707</span>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#27AE60' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href="mailto:admin@gradify.academy" style={{ color: 'inherit', textDecoration: 'none' }}>admin@gradify.academy</a>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: '#27AE60' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href="mailto:support@gradify.academy" style={{ color: 'inherit', textDecoration: 'none' }}>support@gradify.academy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Gradify Academy. All rights reserved.</p>
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
