export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gradify.academy';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/lms/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
