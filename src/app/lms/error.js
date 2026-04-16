'use client';

export default function LMSError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', borderRadius: '12px', border: '1px solid rgba(255, 71, 87, 0.3)', margin: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Oops! Couldn't load dashboard</h2>
      <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>{error.message || 'We encountered a momentary issue fetching your student profile.'}</p>
      <button 
        onClick={() => reset()}
        style={{ padding: '0.6rem 1.2rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
      >
        Retry Refresh
      </button>
    </div>
  );
}
