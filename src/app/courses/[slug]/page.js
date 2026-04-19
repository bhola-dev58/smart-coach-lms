import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import EnrollButton from '@/components/courses/EnrollButton';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();
  
  if (!course) return { title: 'Course Not Found' };
  
  return {
    title: `${course.title} | MeetMe Center`,
    description: course.shortDescription || course.description,
  };
}

export default async function CourseDetailsPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();

  if (!course) notFound();

  let computedLessons = 0;
  let computedDurationMinutes = 0;
  if (course.chapters) {
    course.chapters.forEach(ch => {
      if (ch.lessons) {
        ch.lessons.forEach(l => {
          const isAssignment = l.title.toLowerCase().includes('assignment') || l.type === 'assignment';
          if (!isAssignment) {
            computedLessons += 1;
            computedDurationMinutes += (l.duration || 0);
          }
        });
      }
    });
  }
  
  course.totalLessons = computedLessons;
  course.totalHours = Math.ceil(computedDurationMinutes / 60);

  const hours = Math.floor(computedDurationMinutes / 60);
  const mins = computedDurationMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="course-details-page">
      <div className="page-banner" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>{course.category}</span>
              <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{course.title}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                {course.description}
              </p>
              <div className="course-meta" style={{ gap: '2rem' }}>
                <span className="course-meta-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formattedTime}
                </span>
                <span className="course-meta-item" style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  {course.totalLessons} Lessons
                </span>
                <span className="course-meta-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {course.totalStudents?.toLocaleString('en-IN')} Students
                </span>
                <span className="course-meta-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {course.rating} ({course.totalRatings || 0} reviews)
                </span>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <img 
                src={course.thumbnail || '/images/courses/default.jpg'} 
                alt={course.title} 
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} 
              />
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  ₹{course.price?.toLocaleString('en-IN')}
                </span>
                {course.originalPrice > 0 && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', marginLeft: '1rem' }}>
                    ₹{course.originalPrice?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              
              <EnrollButton 
                courseId={course._id.toString()} 

                amount={course.price} 
                courseTitle={course.title}
              />
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <p>● Full lifetime access</p>
                <p>● Certificate of completion</p>
                <p>● Responsive support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '800px', marginLeft: '0' }}>
          <h2 style={{ marginBottom: '2rem' }}>What You&apos;ll Learn</h2>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            {course.learningOutcomes?.map((outcome, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{outcome}</span>
              </div>
            ))}
          </div>

          <h2 style={{ margin: '4rem 0 2rem' }}>Course Curriculum</h2>
          <div className="curriculum">
            {course.chapters?.map((chapter, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-surface-hover)', padding: '1rem', fontWeight: '600' }}>
                  Chapter {i+1}: {chapter.title}
                </div>
                <div>
                  {chapter.lessons?.map((lesson, j) => {
                    const isAssignmentType = lesson.title.toLowerCase().includes('assignment') || lesson.type === 'assignment';
                    return (
                    <div key={j} style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>{lesson.title}</span>
                      </div>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {isAssignmentType ? 'Task' : (lesson.duration >= 60 ? `${Math.floor(lesson.duration / 60)}h ${lesson.duration % 60}m` : `${lesson.duration || 0}m`)}
                      </span>
                    </div>
                  )})}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
