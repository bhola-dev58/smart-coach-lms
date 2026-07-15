export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gradify.academy';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/courses',
          '/courses/',
          '/about',
          '/contact',
          '/whitefield-bangalore-coaching',
        ],
        disallow: [
          '/admin',
          '/api',
          '/lms/instructor',
          '/lms/practice',
          '/lms/answers',
          '/lms/dashboard',
        ],
      },
      {
        // Block AI training crawlers from scraping course content
        userAgent: ['GPTBot', 'Google-Extended', 'CCBot'],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
