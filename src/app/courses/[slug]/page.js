import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import LmsCourseDetail from '@/components/lms/LmsCourseDetail';
import styles from '@/app/lms/lms.module.css';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();
  
  if (!course) return { title: 'Course Not Found' };
  
  const isCoding = course.category?.toLowerCase().includes('computer') || 
                   course.category?.toLowerCase().includes('coding') || 
                   course.title?.toLowerCase().includes('python') || 
                   course.title?.toLowerCase().includes('java') || 
                   course.title?.toLowerCase().includes('dsa');

  const baseKeywords = [
    course.title,
    course.category,
    ...(course.tags || []),
    "Gradify Academy",
    "Online Course Syllabus",
    "Tuition Fee Details",
    "Course Certificate"
  ];

  const codingKeywords = [
    "Best Coding Institute",
    "Programming in Hindi",
    "Coding Interview Preparation",
    "DSA Course Online",
    "Placement Support Course"
  ];

  const schoolKeywords = [
    "School Coaching Online",
    "Class 10 CBSE Maths",
    "Class 12 Science Tuition",
    "JEE Main Preparation",
    "NEET Biology Prep",
    "Board Exam Revision Course"
  ];

  const keywords = [...baseKeywords, ...(isCoding ? codingKeywords : schoolKeywords)].filter(Boolean);

  const description = course.shortSubtitle || course.description?.substring(0, 160) || 
    (isCoding 
      ? `Master ${course.title} with Gradify Academy. Online classes in Hindi, complete syllabus, hands-on programming exercises, and certificate of completion.`
      : `Master ${course.title} with Gradify Academy. Online classes, comprehensive school syllabus coverage, regular mock tests, and board exam target prep.`
    );

  return {
    title: `${course.title} Course Syllabus, Fees & Certificate | Gradify Academy`,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `https://gradify.academy/courses/${course.slug}`
    },
    openGraph: {
      title: `${course.title} | Gradify Academy`,
      description,
      images: course.thumbnail ? [{ url: course.thumbnail }] : [],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | Gradify Academy`,
      description,
      images: course.thumbnail ? [course.thumbnail] : [],
    }
  };
}

export default async function CourseDetailsPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug })
    .populate('instructor', 'name bio specialization')
    .lean();

  if (!course) notFound();

  let computedLessons = 0;
  let computedDurationMinutes = 0;
  if (course.chapters) {
    course.chapters.forEach(ch => {
      if (ch.lessons) {
        ch.lessons.forEach(l => {
          const isAssignment = l.title?.toLowerCase().includes('assignment') || l.type === 'assignment';
          if (!isAssignment) {
            computedLessons += 1;
            computedDurationMinutes += (l.duration || 0);
          }
        });
      }
    });
  }

  const hours = Math.floor(computedDurationMinutes / 60);
  const mins = computedDurationMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const serialized = JSON.parse(JSON.stringify({
    ...course,
    totalLessons: computedLessons,
    formattedTime,
    totalHours: Math.ceil(computedDurationMinutes / 60),
  }));

  // Google Search Course Rich Snippet Schema
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.shortSubtitle || course.description || "",
    "image": course.thumbnail || "",
    "provider": {
      "@type": "Organization",
      "name": "Gradify Academy",
      "sameAs": "https://gradify.academy"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "On-demand / Self-paced",
      "inLanguage": course.language || "Hindi",
      "courseWorkload": `PT${serialized.totalHours || 0}H`
    },
    "offers": {
      "@type": "Offer",
      "category": "Paid",
      "price": course.price || 0,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2027-12-31"
    },
    "educationalCredentialAwarded": "Certificate of Completion",
    "teaches": (course.learningOutcomes || []).slice(0, 5)
  };

  // Google Search FAQ Rich Snippet Schema
  const faqJsonLd = (course.faqs && course.faqs.length > 0) ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": course.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://gradify.academy"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Courses",
        "item": "https://gradify.academy/courses"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": course.title,
        "item": `https://gradify.academy/courses/${course.slug}`
      }
    ]
  };

  return (
    <>
      {/* Injecting Course Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {/* Injecting FAQ Schema Markup */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Injecting Breadcrumb Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className={styles.lmsWrapper} style={{ minHeight: '80vh', background: 'var(--dash-bg)', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <LmsCourseDetail course={serialized} backLink="/courses" />
        </div>
      </div>
    </>
  );
}
