import { ShieldCheck } from 'lucide-react';

type OnChainBadgeProps = {
  compact?: boolean;
  onChain?: boolean;
};

export function OnChainBadge({ compact = false, onChain = false }: OnChainBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium',
        onChain ? 'bg-emerald-50 text-emerald-800' : 'bg-[#0f4c5c]/8 text-[#0f4c5c]',
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]',
      ].join(' ')}
      title={
        onChain
          ? 'Verified on Monad blockchain'
          : 'Verification logged — enable Monad contract for on-chain anchor'
      }
    >
      <ShieldCheck className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {onChain ? 'On-Chain Verified' : 'Verified'}
    </span>
  );
}
