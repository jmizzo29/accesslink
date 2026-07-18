import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { PublicCostsPage } from './pages/PublicCostsPage';
import { AdminCostsPage } from './pages/AdminCostsPage';
import { DemoPage } from './pages/DemoPage';
import { JudgeBriefPage } from './pages/JudgeBriefPage';
import { MonadActivityPage } from './pages/MonadActivityPage';
import { ContributePage } from './pages/ContributePage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AppNav } from './components/AppNav';

export default function App() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1d1d1f]">
      <Toaster position="bottom-center" richColors closeButton />
      <div className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/activity" element={<MonadActivityPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/judge" element={<JudgeBriefPage />} />
            <Route path="/costs" element={<PublicCostsPage />} />
            <Route path="/monitoring/costs" element={<AdminCostsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <AppNav variant="app" />
      <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">Page not found</h1>
        <p className="mt-4 text-[17px] text-[#6e6e73]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0f4c5c] px-8 text-[17px] font-medium text-white transition-colors hover:bg-[#0a3540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c]"
        >
          Back to Access4All
        </Link>
      </div>
    </div>
  );
}
