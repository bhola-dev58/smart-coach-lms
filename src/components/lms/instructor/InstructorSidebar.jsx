'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuGroups = [
  {
    title: 'Academics',
    items: [
      { id: 'courses', label: 'Courses', icon: '📚' },
      { id: 'enrollments', label: 'Enrollments', icon: '📝' },
      { id: 'studymaterials', label: 'Study Materials', icon: '📄' },
      { id: 'reviews', label: 'Reviews', icon: '⭐' },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { id: 'assignments', label: 'Assignments', icon: '✍️' },
      { id: 'assignmentsubmissions', label: 'Submissions', icon: '📥' },
      { id: 'discussions', label: 'Discussions', icon: '💬' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'livesessions', label: 'Live Sessions', icon: '📡' },
      { id: 'announcements', label: 'Announcements', icon: '📢' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ]
  },
  {
    title: 'Finance & Ops',
    items: [
      { id: 'payments', label: 'Payments', icon: '💰' },
      { id: 'coupons', label: 'Coupons', icon: '🏷️' },
      { id: 'contacts', label: 'Contacts', icon: '📞' },
    ]
  }
];

export default function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '240px',
      background: 'var(--dash-surface)',
      borderRight: '1px solid var(--dash-border)',
      height: '100%',
      padding: '1.5rem 1rem',
      overflowY: 'auto'
    }}>
      <Link href="/lms/instructor" style={{
        textDecoration: 'none',
        color: 'var(--dash-text)',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        marginBottom: '2rem',
        display: 'block',
        paddingLeft: '0.5rem'
      }}>
        💼 Instructor Panel
      </Link>

      {menuGroups.map((group, idx) => (
        <div key={idx} style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--dash-text-muted)',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem'
          }}>
            {group.title}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.items.map(item => {
              const href = `/lms/instructor/${item.id}`;
              const isActive = pathname === href;
              return (
                <li key={item.id} style={{ marginBottom: '0.2rem' }}>
                  <Link href={href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--color-primary)' : 'var(--dash-text-secondary)',
                    background: isActive ? 'var(--dash-surface-hover, rgba(200,16,46,0.1))' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--dash-text)'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--dash-text-secondary)'; }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
