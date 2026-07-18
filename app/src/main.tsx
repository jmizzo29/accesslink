import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../forge-identity.css';
import './styles.css';
import { BootErrorBoundary } from './components/BootErrorBoundary';
import { LEGACY_PORTFOLIO_BASE, PORTFOLIO_BASE } from './lib/constants';

function getRouterBasename(): string {
  const { pathname } = window.location;
  const markers = [
    `${PORTFOLIO_BASE}/app`,
    `${LEGACY_PORTFOLIO_BASE}/app`,
    PORTFOLIO_BASE,
    LEGACY_PORTFOLIO_BASE,
  ];
  for (const marker of markers) {
    if (pathname === marker || pathname.startsWith(`${marker}/`)) {
      return marker;
    }
  }
  return '/';
}

function showBootError(err: unknown) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  const message = err instanceof Error ? err.message : 'Unknown error';
  rootEl.innerHTML = [
    '<div style="margin:0;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#0f4c5c;background:#f5f5f7;min-height:100vh;box-sizing:border-box">',
    '<p style="margin:0 0 0.75rem;font-weight:600">Access4All could not start</p>',
    `<p style="margin:0 0 1rem;font-size:0.9rem;color:#6e6e73">${message.replace(/[<>&]/g, '')}</p>`,
    '<button type="button" id="a4a-err-reload" style="min-height:44px;padding:0.65rem 1.1rem;border:0;border-radius:999px;background:#0f4c5c;color:#fff;font:inherit;font-weight:600">Reload</button>',
    '</div>',
  ].join('');
  const btn = document.getElementById('a4a-err-reload');
  if (btn) {
    btn.onclick = () => {
      const u = new URL(window.location.href);
      u.searchParams.set('_r', String(Date.now()));
      window.location.replace(u.toString());
    };
  }
}

window.addEventListener('error', (ev) => {
  if (ev.message && !document.getElementById('a4a-boot') && document.getElementById('root')?.childElementCount === 0) {
    showBootError(ev.error ?? new Error(ev.message));
  }
});

window.addEventListener('unhandledrejection', (ev) => {
  if (!document.getElementById('a4a-boot') && document.getElementById('root')?.childElementCount === 0) {
    showBootError(ev.reason ?? new Error('Unhandled promise rejection'));
  }
});

try {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Missing #root');

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BootErrorBoundary>
        <BrowserRouter basename={getRouterBasename()}>
          <App />
        </BrowserRouter>
      </BootErrorBoundary>
    </React.StrictMode>,
  );

  document.getElementById('a4a-boot')?.remove();
} catch (err) {
  showBootError(err);
}
