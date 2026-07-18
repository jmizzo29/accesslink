import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { verifyListingOnMonad } from '../../lib/monad/client';
import { monadExplorerTxUrl } from '../../lib/monad/explorer';
import type { Listing } from '../../lib/listings/types';
import type { MonadChainStatus } from '../../lib/monad/types';

type AnchorVerifyButtonProps = {
  listing: Listing;
  status?: MonadChainStatus | null;
  className?: string;
};

export function AnchorVerifyButton({ listing, status, className }: AnchorVerifyButtonProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const features = Object.entries(listing.accessibility)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const result = await verifyListingOnMonad({
        propertyId: listing.id,
        propertyName: listing.name,
        location: listing.location,
        features,
      });
      if (!result?.record) {
        toast.error('Could not anchor verification.');
        return;
      }
      const { record, mode } = result;
      if (record.onChain && record.txHash) {
        const explorer = status?.explorer || 'https://testnet.monadvision.com';
        toast.success(
          mode === 'wallet' ? 'Anchored via your wallet on Monad testnet' : 'Anchored on Monad testnet',
          {
            action: {
              label: 'View tx',
              onClick: () => window.open(monadExplorerTxUrl(explorer, record.txHash), '_blank'),
            },
          },
        );
      } else {
        toast.message('Saved locally — not on-chain yet', {
          description:
            'Install MetaMask (or another wallet), switch to Monad testnet, then tap Anchor again for a real tx.',
        });
      }
      navigate('/activity');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Anchor failed');
    } finally {
      setBusy(false);
    }
  }, [listing, navigate, status]);

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className={
        className ??
        'inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0f4c5c] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#0a3540] disabled:opacity-60'
      }
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Anchoring…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" aria-hidden />
          Anchor this verification on Monad
        </>
      )}
    </button>
  );
}
