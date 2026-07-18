import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../api-base';

const STORAGE_KEY = 'access4all-cost-admin';

export function useCostAdmin() {
  const [unlocked, setUnlocked] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAdminKey(stored);
      setUnlocked(true);
    }
  }, []);

  const unlock = useCallback(async (key: string): Promise<boolean> => {
    try {
      const verifyRes = await fetch(apiUrl('/api/costs/verify-admin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!verifyRes.ok) return false;
      const data = (await verifyRes.json()) as { ok?: boolean };
      if (!data.ok) return false;
      sessionStorage.setItem(STORAGE_KEY, key);
      setAdminKey(key);
      setUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey(null);
    setUnlocked(false);
  }, []);

  return { unlocked, adminKey, unlock, lock };
}
