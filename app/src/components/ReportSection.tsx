interface ReportSectionProps {
  onNavigate?: (page: 'home' | 'costs') => void;
}

export function ReportSection({ onNavigate }: ReportSectionProps) {
  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Cost Tracking & Analytics</h2>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>Monitor LLM costs and real-time metrics for your accessibility searches</p>
        <button 
          onClick={() => onNavigate?.('costs')}
          style={{ padding: '1rem 2rem', fontSize: '1rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
        >
          View Cost Dashboard →
        </button>
      </div>
    </section>
  );
}
