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
    if (!ok) setError('That access key did not match. Try again.');
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--sand)] bg-[var(--paper)] p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal-soft)] text-[var(--teal)]">
        <Lock className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="mt-6 font-display text-[28px] font-semibold tracking-tight">Internal cost view</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
        Detailed spend logs stay behind a key. Travelers see the public How we work page.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[13px] font-medium text-[var(--muted)]">Access key</span>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
            required
          />
        </label>
        {error && (
          <p className="text-[14px] text-red-800" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[var(--teal)] py-3.5 text-[17px] font-medium text-white hover:bg-[var(--teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Checking…' : 'Open cost view'}
        </button>
      </form>
    </div>
  );
}
