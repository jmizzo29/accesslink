import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { apiUrl } from '../lib/api-base';

interface CostEvent {
  id: string;
  provider: string;
  model: string;
  estimatedCostUsd?: number;
  costUsd?: number;
  timestamp: string;
}

interface CostData {
  summary: {
    totalCostUsd: number;
    totalCalls: number;
    totalTokens: number;
    averageRuntimeMs: number;
  };
  events: CostEvent[];
}

export const CostsPage = () => {
  const [costs, setCosts] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/costs'));
        if (!response.ok) throw new Error('Failed to fetch costs');
        const data = await response.json();
        setCosts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
    const interval = setInterval(fetchCosts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !costs) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--forge-space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--forge-color-danger)' }}>Error: {error}</p>
      </div>
    );
  }

  if (!costs) return null;

  return (
    <div className="app-page">
      <h1>Cost tracking dashboard</h1>

      {/* Key Metrics */}
      <div className="grid-2" style={{ marginBottom: 'var(--forge-space-8)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--forge-space-3)' }}>
            <TrendingUp size={32} style={{ color: 'var(--forge-earth-primary)' }} />
            <div>
              <p style={{ color: 'var(--forge-color-text-muted)', fontSize: 'var(--forge-text-sm)' }}>Total Cost</p>
              <p style={{ fontSize: 'var(--forge-text-2xl)', fontWeight: 'bold' }}>
                ${costs.summary.totalCostUsd.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--forge-space-3)' }}>
            <Zap size={32} style={{ color: 'var(--forge-earth-primary)' }} />
            <div>
              <p style={{ color: 'var(--forge-color-text-muted)', fontSize: 'var(--forge-text-sm)' }}>Total Calls</p>
              <p style={{ fontSize: 'var(--forge-text-2xl)', fontWeight: 'bold' }}>
                {costs.summary.totalCalls}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--forge-space-3)' }}>
            <Users size={32} style={{ color: 'var(--forge-earth-primary)' }} />
            <div>
              <p style={{ color: 'var(--forge-color-text-muted)', fontSize: 'var(--forge-text-sm)' }}>Total Tokens</p>
              <p style={{ fontSize: 'var(--forge-text-2xl)', fontWeight: 'bold' }}>
                {costs.summary.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--forge-space-3)' }}>
            <Zap size={32} style={{ color: 'var(--forge-earth-primary)' }} />
            <div>
              <p style={{ color: 'var(--forge-color-text-muted)', fontSize: 'var(--forge-text-sm)' }}>Avg Runtime</p>
              <p style={{ fontSize: 'var(--forge-text-2xl)', fontWeight: 'bold' }}>
                {costs.summary.averageRuntimeMs}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <section className="section">
        <h2 style={{ marginBottom: 'var(--forge-space-6)' }}>Recent Events</h2>
        <div style={{
          overflowX: 'auto',
          borderRadius: 'var(--forge-radius-md)',
          border: '1px solid var(--forge-color-border)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--forge-color-border)', backgroundColor: 'var(--forge-color-surface-2)' }}>
                <th style={{ padding: 'var(--forge-space-3)' }}>Provider</th>
                <th style={{ padding: 'var(--forge-space-3)' }}>Model</th>
                <th style={{ padding: 'var(--forge-space-3)' }}>Cost</th>
                <th style={{ padding: 'var(--forge-space-3)' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {costs.events.slice(0, 10).map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid var(--forge-color-border)' }}>
                  <td style={{ padding: 'var(--forge-space-3)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: 'var(--forge-space-1) var(--forge-space-3)',
                      background: 'var(--forge-earth-primary)',
                      color: 'white',
                      borderRadius: 'var(--forge-radius-sm)',
                      fontSize: 'var(--forge-text-sm)'
                    }}>
                      {event.provider}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--forge-space-3)' }}>{event.model}</td>
                  <td style={{ padding: 'var(--forge-space-3)', fontWeight: 'bold' }}>
                    ${(event.estimatedCostUsd ?? event.costUsd ?? 0).toFixed(4)}
                  </td>
                  <td style={{ padding: 'var(--forge-space-3)', color: 'var(--forge-color-text-muted)' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Export Options */}
      <div style={{ marginTop: 'var(--forge-space-8)', display: 'flex', gap: 'var(--forge-space-4)', flexWrap: 'wrap' }}>
        <a
          href={apiUrl('/api/costs?format=csv')}
          download="accesslink-costs.csv"
          className="btn btn-secondary"
        >
          Download CSV
        </a>
        <a
          href={apiUrl('/api/costs?format=report')}
          download="accesslink-costs.txt"
          className="btn btn-secondary"
        >
          Download Report
        </a>
      </div>
    </div>
  );
};
