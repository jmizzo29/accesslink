import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { PublicCostsPage } from './pages/PublicCostsPage';
import { AdminCostsPage } from './pages/AdminCostsPage';
import { ContributePage } from './pages/ContributePage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PageShell } from './components/PageShell';

export default function App() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--cream)] text-[var(--ink)]">
      <Toaster position="bottom-center" richColors closeButton />
      <div className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/costs" element={<PublicCostsPage />} />
            <Route path="/monitoring/costs" element={<AdminCostsPage />} />
            <Route path="/activity" element={<Navigate to="/" replace />} />
            <Route path="/demo" element={<Navigate to="/search" replace />} />
            <Route path="/judge" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
        <h1 className="font-display text-[32px] font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-[17px] text-[var(--muted)]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--teal)] px-8 text-[17px] font-medium text-white hover:bg-[var(--teal-deep)]"
        >
          Back to Access4All
        </Link>
      </div>
    </PageShell>
  );
}
