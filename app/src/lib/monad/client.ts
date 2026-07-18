import { apiUrl } from '../api-base';
import {
  appendLocalLedger,
  fetchBrowserMonadStatus,
  hasWalletProvider,
  readLocalLedger,
  verifyWithWallet,
} from './browserChain';
import type { MonadChainStatus, VerificationHistoryResponse, VerificationRecord } from './types';

export async function fetchMonadStatus(): Promise<MonadChainStatus | null> {
  try {
    const res = await fetch(apiUrl('/api/monad/status'));
    if (res.ok) {
      const apiStatus = (await res.json()) as MonadChainStatus;
      const browser = await fetchBrowserMonadStatus();
      return {
        ...apiStatus,
        writeEnabled: Boolean(apiStatus.writeEnabled || browser.writeEnabled),
        onChainRecordCount: apiStatus.onChainRecordCount ?? browser.onChainRecordCount,
        ledgerRecordCount: Math.max(
          apiStatus.ledgerRecordCount ?? 0,
          browser.ledgerRecordCount ?? 0,
        ),
      };
    }
  } catch {
    /* fall through */
  }

  try {
    return await fetchBrowserMonadStatus();
  } catch {
    return null;
  }
}

export async function fetchVerificationHistory(
  propertyId?: string,
): Promise<VerificationHistoryResponse | null> {
  const local = readLocalLedger().filter((r) =>
    propertyId ? r.propertyId === propertyId : true,
  );
  let apiRecords: VerificationRecord[] = [];
  let status: MonadChainStatus | null = null;

  try {
    const query = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : '';
    const res = await fetch(apiUrl(`/api/monad/history${query}`));
    if (res.ok) {
      const data = (await res.json()) as VerificationHistoryResponse;
      apiRecords = data.records ?? [];
      status = data.status;
    }
  } catch {
    /* local only */
  }

  if (!status) {
    status = await fetchMonadStatus();
  }

  if (!status && !apiRecords.length && !local.length) {
    return null;
  }

  const byId = new Map<string, VerificationRecord>();
  for (const r of [...apiRecords, ...local]) {
    byId.set(r.id, r);
  }
  const records = [...byId.values()].sort(
    (a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime(),
  );

  return {
    records,
    total: records.length,
    propertyId: propertyId ?? null,
    status: status ?? (await fetchBrowserMonadStatus()),
  };
}

export async function verifyListingOnMonad(input: {
  propertyId: string;
  propertyName: string;
  location: string;
  features?: string[];
  reportId?: string;
}): Promise<{ record: VerificationRecord; mode: 'server' | 'wallet' | 'local' } | null> {
  try {
    const res = await fetch(apiUrl('/api/monad/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as { record: VerificationRecord };
      if (data.record?.onChain) {
        appendLocalLedger(data.record);
        return { record: data.record, mode: 'server' };
      }
    }
  } catch {
    /* try wallet */
  }

  if (hasWalletProvider()) {
    const record = await verifyWithWallet(input);
    return { record, mode: 'wallet' };
  }

  const now = new Date().toISOString();
  const record: VerificationRecord = {
    id: `vr-local-${Date.now().toString(36)}`,
    propertyId: input.propertyId,
    propertyName: input.propertyName,
    location: input.location,
    propertyHash: '',
    recordId: '',
    txHash: '',
    action: 'verify',
    verifiedBy: 'local',
    verifiedAt: now,
    onChain: false,
    reportId: input.reportId ?? null,
    note: 'Logged locally only — connect a Monad testnet wallet to anchor on-chain.',
  };
  appendLocalLedger(record);
  return { record, mode: 'local' };
}

/** Demo one-click: Harborview sample → wallet or local, never a fake chain hash. */
export async function runDemoVerify(): Promise<{
  record: VerificationRecord;
  mode: 'server' | 'wallet' | 'local';
}> {
  try {
    const res = await fetch(apiUrl('/api/demo/verify'), { method: 'POST' });
    if (res.ok) {
      const data = (await res.json()) as { record: VerificationRecord };
      if (data.record?.onChain) {
        appendLocalLedger(data.record);
        return { record: data.record, mode: 'server' };
      }
    }
  } catch {
    /* wallet / local */
  }

  const result = await verifyListingOnMonad({
    propertyId: 'prop-001',
    propertyName: 'Harborview Accessible Hotel',
    location: 'New York, NY',
    features: ['rollInShower', 'elevator', 'wheelchairRamp', 'wideDoorways'],
  });
  if (!result) throw new Error('Demo verification failed');
  return result;
}
