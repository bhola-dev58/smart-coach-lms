import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="cta-banner">
      <div className="container">
        <div>
          <h2>Ready to Accelerate Your Engineering Career?</h2>
          <p>Join 10,000+ B.Tech students who chose MeetMe Center for their academic and career success.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <Link href="/courses" className="btn btn-white btn-lg">Browse Courses</Link>
          <Link href="/contact" className="btn btn-outline-white btn-lg">Talk to Us</Link>
        </div>
      </div>
    </section>
  );
}
