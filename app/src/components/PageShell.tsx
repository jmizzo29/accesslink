import type { ReactNode } from 'react';
import { AppNav } from './AppNav';
import { SiteFooter } from './SiteFooter';

type PageShellProps = {
  children: ReactNode;
  variant?: 'app' | 'hero';
  mainClassName?: string;
  hideFooter?: boolean;
};

export function PageShell({
  children,
  variant = 'app',
  mainClassName = '',
  hideFooter = false,
}: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--cream)] text-[var(--ink)] antialiased">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {variant !== 'hero' && <AppNav variant="app" />}
      <main id="main-content" className={`flex-1 ${mainClassName}`.trim()} tabIndex={-1}>
        {children}
      </main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
