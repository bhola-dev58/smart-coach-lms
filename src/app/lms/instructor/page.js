'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InstructorRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to the courses manager, since it's the primary instructor tool
    router.replace('/lms/instructor/courses');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--dash-text-muted)' }}>
      Redirecting to Courses Manager...
    </div>
  );
}
