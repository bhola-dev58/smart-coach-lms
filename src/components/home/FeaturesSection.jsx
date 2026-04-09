const features = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Expert IIT/NIT Faculty',
    desc: 'Learn from 35+ professors and industry veterans with 10+ years of teaching and real-world experience.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="0"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    title: 'Live + Recorded Classes',
    desc: 'Attend interactive live sessions or learn at your own pace with HD recorded lectures accessible 24/7.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    title: 'Placement Assistance',
    desc: 'Resume building, mock interviews, and direct referrals to 200+ partner companies across India.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    title: 'Lifetime Access',
    desc: 'Pay once and access course materials forever. Get free updates and new content as the curriculum evolves.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section section-white">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Why Choose Us</span>
          <h2>Built for Serious B.Tech Students</h2>
          <div className="section-divider" />
          <p>We combine academic rigor with practical skills to ensure you excel in exams and your career.</p>
        </div>
        <div className="grid grid-4">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
