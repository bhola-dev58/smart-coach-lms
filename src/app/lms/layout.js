export const metadata = {
  title: 'Student LMS Dashboard',
  description: 'Access your courses, watch video lectures, track progress, take notes, and take quizzes on MeetMe Center LMS.',
};

export default function LmsLayout({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {children}
    </div>
  );
}
