import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="cta-banner">
      <div className="container">
        <div className="animate-fade-in-up">
          <h2>Ready to Excel in Your School and Board Exams?</h2>
          <p>Join 10,000+ students who chose Gradify Academy for conceptual clarity and academic success.</p>
        </div>
        <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <Link href="/courses" className="btn btn-white btn-lg">Browse Courses</Link>
          <Link href="/contact" className="btn btn-outline-white btn-lg">Talk to Us</Link>
        </div>
      </div>
    </section>
  );
}
