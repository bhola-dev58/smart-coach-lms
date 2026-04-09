import Link from 'next/link';

const courses = [
  { title: 'Data Structures & Algorithms', desc: 'Master arrays, linked lists, trees, graphs, sorting, and dynamic programming.', hours: '120', students: '2,400', rating: '4.8', price: '₹4,999', original: '₹9,999', badge: 'CSE', image: '/images/courses/dsa.jpg' },
  { title: 'Full Stack Web Development', desc: 'Build modern web apps with HTML, CSS, JavaScript, React, Node.js, MongoDB.', hours: '180', students: '3,100', rating: '4.9', price: '₹6,999', original: '₹14,999', badge: 'CSE', image: '/images/courses/webdev.jpg' },
  { title: 'Machine Learning & AI', desc: 'Learn neural networks, NLP, computer vision with Python & TensorFlow.', hours: '150', students: '1,800', rating: '4.7', price: '₹7,499', original: '₹15,999', badge: 'AI/ML', image: '/images/courses/ml.jpg' },
  { title: 'GATE CSE Preparation', desc: 'Complete GATE preparation with mock tests, subject-wise video lectures.', hours: '300', students: '4,500', rating: '4.9', price: '₹9,999', original: '₹19,999', badge: 'GATE', image: '/images/courses/gate.jpg' },
];

export default function CoursesSection() {
  return (
    <section className="section section-light">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Courses</span>
          <h2>Industry-Relevant B.Tech Courses</h2>
          <div className="section-divider" />
          <p>Structured curriculum designed by IIT alumni, updated with latest industry trends.</p>
        </div>
        <div className="grid grid-3">
          {courses.map((c, i) => (
            <div className="card" key={i}>
              <div className="card-img-wrapper">
                <img src={c.image} alt={c.title} className="card-img" />
                <span className="course-category badge badge-primary">{c.badge}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{c.title}</h3>
                <p className="card-text">{c.desc}</p>
                <div className="course-meta">
                  <span className="course-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {c.hours} Hours
                  </span>
                  <span className="course-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {c.students}
                  </span>
                  <span className="course-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {c.rating}
                  </span>
                </div>
                <div className="course-price">
                  <div>
                    <span className="price-amount">{c.price}</span>
                    <span className="price-original">{c.original}</span>
                  </div>
                  <Link href="/courses" className="btn btn-primary btn-sm">Enroll Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link href="/courses" className="btn btn-outline btn-lg">View All Courses →</Link>
        </div>
      </div>
    </section>
  );
}
