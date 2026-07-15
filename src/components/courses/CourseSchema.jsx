/**
 * CourseSchema.jsx
 * Server-renderable JSON-LD schema component for individual course pages.
 * Emits: Course, FAQPage (if faqs present), BreadcrumbList, and AggregateRating (if reviews present).
 * Referenced by: src/app/courses/[slug]/page.js
 */

export default function CourseSchema({ course }) {
  if (!course) return null;

  const siteUrl = 'https://gradify.academy';
  const courseUrl = `${siteUrl}/courses/${course.slug}`;

  // ── Core Course Schema ──────────────────────────────────────────
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.seoDescription || course.shortDescription || course.description || '',
    image: course.thumbnail || '',
    url: courseUrl,
    inLanguage: course.language || 'Hindi',
    provider: {
      '@type': 'Organization',
      name: 'Gradify Academy',
      url: siteUrl,
      sameAs: siteUrl,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'OnlineCourse',
      inLanguage: course.language || 'Hindi',
      courseWorkload: `PT${course.totalHours || 0}H`,
    },
    offers: {
      '@type': 'Offer',
      category: course.isFree ? 'Free' : 'Paid',
      price: course.price || 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      url: courseUrl,
    },
    educationalCredentialAwarded: 'Certificate of Completion',
    teaches: (course.learningOutcomes || []).slice(0, 8),
    // ── AggregateRating — only emit when reviews exist (avoids Google penalty for 0-review markup) ──
    ...(course.totalRatings > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: course.rating?.toFixed(1) || '0',
            ratingCount: course.totalRatings,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  };

  // ── FAQPage Schema ───────────────────────────────────────────────
  const faqJsonLd = course.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: course.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  // ── BreadcrumbList Schema ────────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: courseUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
