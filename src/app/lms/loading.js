export default function LMSLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', padding: '4rem', color: '#fff' }}>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '3px solid rgba(255, 255, 255, 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '1rem', fontWeight: 500, color: '#aaa' }}>Loading dashboard...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
