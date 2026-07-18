import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';

type AdminGateProps = {
  onUnlock: (key: string) => Promise<boolean>;
};

export function AdminGate({ onUnlock }: AdminGateProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const ok = await onUnlock(key.trim());
    if (!ok) setError('Invalid operator key. Contact your Forge administrator.');
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#d2d2d7] bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f4c5c]/10 text-[#0f4c5c]">
        <Lock className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="mt-6 text-[28px] font-semibold tracking-tight">Internal operations</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
        Per-agent costs, token logs, and exports are restricted to authorized Forge operators.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[13px] font-medium text-[#6e6e73]">Operator key</span>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3.5 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
            required
          />
        </label>
        {error && (
          <p className="text-[14px] text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#0f4c5c] py-3.5 text-[17px] font-medium text-white hover:bg-[#0a3540] disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Unlock internal view'}
        </button>
      </form>
    </div>
  );
}
