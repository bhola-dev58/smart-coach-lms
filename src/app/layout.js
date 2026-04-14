import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import LayoutShell from '@/components/layout/LayoutShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'MeetMe Center — Premier B.Tech Coaching Institute',
    template: '%s — MeetMe Center',
  },
  description: 'India\'s premier B.Tech coaching institute offering 50+ courses, expert faculty, GATE preparation, and placement assistance for engineering students.',
  keywords: ['B.Tech coaching', 'engineering courses', 'GATE preparation', 'DSA course', 'MeetMe Center'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <AuthModal />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
