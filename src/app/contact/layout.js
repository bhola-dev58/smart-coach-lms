export const metadata = {
  title: 'Contact Us - Admissions & Support Helpline | Gradify Academy',
  description: 'Get in touch with Gradify Academy. Contact us via phone +91-8874270707, email contact@gradify.academy, or visit our Bengaluru coaching campus for admissions inquiry.',
};

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
      "name": "Contact Us",
      "item": "https://gradify.academy/contact"
    }
  ]
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
