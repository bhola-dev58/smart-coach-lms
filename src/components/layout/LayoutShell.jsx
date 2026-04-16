'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isLMS = pathname.startsWith('/lms');
  const isInstructor = pathname.startsWith('/instructor');
  const isAdmin = pathname.startsWith('/admin');

  if (isLMS || isInstructor || isAdmin) {
    // Isolated application routes: handled by their respective layout files
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
