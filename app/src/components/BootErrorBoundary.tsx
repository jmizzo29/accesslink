import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class BootErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[Access4All] render error:', error);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error.message.replace(/[<>&]/g, '');
      return (
        <div
          style={{
            margin: 0,
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#0f4c5c',
            background: '#f5f5f7',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>Access4All could not load</p>
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#6e6e73' }}>{message}</p>
          <button
            type="button"
            style={{
              minHeight: 44,
              padding: '0.65rem 1.1rem',
              border: 0,
              borderRadius: 999,
              background: '#0f4c5c',
              color: '#fff',
              font: 'inherit',
              fontWeight: 600,
            }}
            onClick={() => {
              const u = new URL(window.location.href);
              u.searchParams.set('_r', String(Date.now()));
              window.location.replace(u.toString());
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
