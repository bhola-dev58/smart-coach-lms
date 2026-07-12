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
    default: 'Gradify Academy | Class 8-12 Boards, JEE & NEET Online Coaching',
    template: '%s — Gradify Academy',
  },
  description: 'Join India\'s premier school coaching platform. Live classes for Class 8, 9, 10, 11 & 12 in Science, Math & English. Score 95%+ in CBSE/ICSE board exams and prepare for JEE & NEET with expert IITian faculty.',
  keywords: ['school coaching', 'Class 10 CBSE science', 'Class 12 board preparation', 'JEE online classes', 'NEET coaching online', 'Gradify Academy', 'best school tuition'],
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Gradify Academy",
  "url": "https://gradify.academy",
  "logo": "https://gradify.academy/images/logo-only.png",
  "sameAs": [
    "https://www.facebook.com/gradify.academy",
    "https://www.instagram.com/gradify.academy",
    "https://www.youtube.com/@gradify.academy"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "10th Cross, Varthur, Devasthanagalu",
    "addressLocality": "Bengaluru",
    "addressRegion": "Karnataka",
    "postalCode": "560087",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8874270707",
    "contactType": "Admissions & Support",
    "email": "contact@gradify.academy"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Gradify Academy",
  "url": "https://gradify.academy",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gradify.academy/courses?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://gradify.academy" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <AuthModal />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
