import styles from '@/app/lms/lms.module.css';

export default function ComingSoon({ title, icon }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>{icon || '🚀'}</div>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        color: '#f0f0f0',
        marginBottom: '0.75rem',
      }}>
        {title}
      </h1>
      <p style={{
        color: '#666',
        fontSize: 'var(--text-lg)',
        fontWeight: 500,
        letterSpacing: '0.05em',
      }}>
        Coming Soon...
      </p>
      <div style={{
        marginTop: '2rem',
        width: '60px',
        height: '4px',
        background: 'var(--color-primary)',
        borderRadius: '2px',
        opacity: 0.5,
      }} />
    </div>
  );
}
