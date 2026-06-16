import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import RoleSelectModal from '@/components/auth/RoleSelectModal';
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
    default: 'Gradify Academy — From Concepts to Creation',
    template: '%s — Gradify Academy',
  },
  description: 'Gradify Academy — India\'s premier coaching platform. Expert faculty from IITs & NITs, 50+ industry-relevant courses, GATE preparation, and placement assistance for engineering students.',
  keywords: ['B.Tech coaching', 'engineering courses', 'GATE preparation', 'DSA course', 'Gradify Academy', 'online learning'],
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <AuthModal />
          <RoleSelectModal />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
