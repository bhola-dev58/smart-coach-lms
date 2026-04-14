'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isLMS = pathname.startsWith('/lms');

  if (isLMS) {
    // LMS routes: No Header, No Footer — the lms/layout.js handles its own sidebar
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
