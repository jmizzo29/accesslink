import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/AppNav';
import { VerificationHistory } from '../components/monad/VerificationHistory';
import { fetchMonadStatus } from '../lib/monad/client';
import type { MonadChainStatus } from '../lib/monad/types';

export function MonadActivityPage() {
  const [status, setStatus] = useState<MonadChainStatus | null>(null);

  useEffect(() => {
    fetchMonadStatus().then(setStatus);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[1080px] px-6 py-12 sm:px-8 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="text-[40px] font-semibold tracking-tight sm:text-[48px]">Monad activity</h1>
          <p className="mt-4 text-[19px] leading-relaxed text-[#6e6e73]">
            On-chain verification badges and a simple transaction history for community-verified
            accessibility reports.
          </p>
          {status && (
            <p className="mt-3 text-[13px] text-[#86868b]">
              Network: {status.network} (chain {status.chainId})
              {status.writeEnabled
                ? ' · Live on-chain writes (Monad testnet)'
                : ' · Ledger mode'}
              {status.ledgerRecordCount != null ? ` · ${status.ledgerRecordCount} records` : ''}
            </p>
          )}
        </header>

        <div className="mt-12">
          <VerificationHistory title="All verification transactions" />
        </div>

        <p className="mt-8 text-center text-[13px] text-[#86868b]">
          <Link to="/search" className="text-[#0f4c5c] hover:underline">
            Back to search
          </Link>
          {' · '}
          Verified reports are hashed and anchored via the AccessLinkVerified contract on Monad.
        </p>
      </div>
    </div>
  );
}
