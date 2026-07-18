import { useEffect, useState } from 'react';
import { ExternalLink, History } from 'lucide-react';
import { fetchVerificationHistory } from '../../lib/monad/client';
import { monadExplorerTxUrl, shortenHash } from '../../lib/monad/explorer';
import type { VerificationRecord } from '../../lib/monad/types';

type VerificationHistoryProps = {
  propertyId?: string;
  propertyName?: string;
  title?: string;
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function VerificationHistory({
  propertyId,
  propertyName,
  title = 'Verification history',
}: VerificationHistoryProps) {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [explorer, setExplorer] = useState('https://testnet.monadvision.com');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchVerificationHistory(propertyId)
      .then((data) => {
        if (cancelled) return;
        setRecords(data?.records ?? []);
        if (data?.status?.explorer) setExplorer(data.status.explorer);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8" aria-busy="true">
        <h2 className="text-[24px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-4 text-[15px] text-[#6e6e73]">Loading verification records…</p>
      </section>
    );
  }

  if (!records.length) {
    return (
      <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
        <h2 className="text-[24px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-4 text-[15px] text-[#6e6e73]">
          No verification transactions yet
          {propertyName ? ` for ${propertyName}` : ''}. Verified community reports appear here after
          Monad anchoring.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-[#0f4c5c]" aria-hidden />
        <h2 className="text-[24px] font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="mt-2 text-[14px] text-[#86868b]">
        Monad verification ledger — {records.length} record{records.length === 1 ? '' : 's'}
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#d2d2d7] text-[12px] uppercase tracking-wide text-[#86868b]">
              <th className="pb-3 pr-4 font-medium">When</th>
              <th className="pb-3 pr-4 font-medium">Action</th>
              <th className="pb-3 pr-4 font-medium">Property</th>
              <th className="pb-3 pr-4 font-medium">Transaction</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-[#f0f0f2] last:border-0">
                <td className="py-4 pr-4 align-top text-[#6e6e73]">{formatWhen(record.verifiedAt)}</td>
                <td className="py-4 pr-4 align-top capitalize text-[#1d1d1f]">{record.action}</td>
                <td className="py-4 pr-4 align-top">
                  <span className="font-medium text-[#1d1d1f]">{record.propertyName}</span>
                  <span className="mt-0.5 block text-[13px] text-[#86868b]">{record.location}</span>
                </td>
                <td className="py-4 pr-4 align-top">
                  {record.onChain && record.txHash ? (
                    <a
                      href={monadExplorerTxUrl(explorer, record.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[13px] text-[#0f4c5c] hover:underline"
                    >
                      {shortenHash(record.txHash)}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-[13px] text-[#86868b]">No tx — local only</span>
                  )}
                </td>
                <td className="py-4 align-top">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      record.onChain
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-[#f5f5f7] text-[#6e6e73]',
                    ].join(' ')}
                  >
                    {record.onChain ? 'On-chain' : 'Indexed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
