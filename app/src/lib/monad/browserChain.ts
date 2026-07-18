import type { MonadChainStatus, VerificationRecord } from './types';
import {
  LOCAL_LEDGER_KEY,
  MONAD_CHAIN_ID,
  MONAD_CHAIN_ID_HEX,
  MONAD_CONTRACT_ABI,
  MONAD_CONTRACT_ADDRESS,
  MONAD_EXPLORER,
  MONAD_NETWORK_NAME,
  MONAD_RPC_URL,
} from './config';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEthereum(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

export function hasWalletProvider(): boolean {
  return Boolean(getEthereum());
}

export function readLocalLedger(): VerificationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VerificationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendLocalLedger(record: VerificationRecord): void {
  const next = [record, ...readLocalLedger()].slice(0, 100);
  localStorage.setItem(LOCAL_LEDGER_KEY, JSON.stringify(next));
}

export async function fetchBrowserMonadStatus(): Promise<MonadChainStatus> {
  const wallet = hasWalletProvider();
  let onChainRecordCount: number | undefined;

  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL, MONAD_CHAIN_ID);
    const contract = new ethers.Contract(
      MONAD_CONTRACT_ADDRESS,
      MONAD_CONTRACT_ABI,
      provider,
    );
    const count = await contract.getRecordCount();
    onChainRecordCount = Number(count);
  } catch {
    onChainRecordCount = undefined;
  }

  return {
    chainId: MONAD_CHAIN_ID,
    network: MONAD_NETWORK_NAME,
    rpcUrl: MONAD_RPC_URL,
    contractAddress: MONAD_CONTRACT_ADDRESS,
    writeEnabled: wallet,
    readEnabled: true,
    explorer: MONAD_EXPLORER,
    onChainRecordCount,
    ledgerRecordCount: readLocalLedger().length,
  };
}

async function ensureMonadChain(ethereum: EthereumProvider): Promise<void> {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== 4902) throw err;
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: MONAD_CHAIN_ID_HEX,
          chainName: MONAD_NETWORK_NAME,
          nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
          rpcUrls: [MONAD_RPC_URL],
          blockExplorerUrls: [MONAD_EXPLORER],
        },
      ],
    });
  }
}

export async function verifyWithWallet(input: {
  propertyId: string;
  propertyName: string;
  location: string;
  features?: string[];
  reportId?: string;
}): Promise<VerificationRecord> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error(
      'Connect a wallet (MetaMask or similar) on Monad testnet to write the on-chain anchor.',
    );
  }

  const { ethers } = await import('ethers');
  await ensureMonadChain(ethereum);

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new ethers.Contract(MONAD_CONTRACT_ADDRESS, MONAD_CONTRACT_ABI, signer);

  const features = input.features ?? [];
  const payload = JSON.stringify({
    title: input.propertyName,
    location: input.location,
    features: [...features].sort(),
  });
  const propertyHash = ethers.keccak256(ethers.toUtf8Bytes(payload));

  const submitTx = await contract.submitRecord(propertyHash, input.location);
  const submitReceipt = await submitTx.wait();
  const submitHash = submitReceipt?.hash || '';

  const count = await contract.getRecordCount();
  const idx = Number(count) - 1;
  let recordId = propertyHash;
  if (idx >= 0) {
    recordId = await contract.getRecordIdByIndex(idx);
  }

  const verifyTx = await contract.verifyRecord(recordId);
  const verifyReceipt = await verifyTx.wait();
  const txHash = verifyReceipt?.hash || submitHash;

  const now = new Date().toISOString();
  const record: VerificationRecord = {
    id: `vr-wallet-${Date.now().toString(36)}`,
    propertyId: input.propertyId,
    propertyName: input.propertyName,
    location: input.location,
    propertyHash,
    recordId: String(recordId),
    txHash,
    action: 'verify',
    verifiedBy: address,
    verifiedAt: now,
    onChain: true,
    reportId: input.reportId ?? null,
    note: 'Submitted and verified on Monad testnet via wallet',
  };

  appendLocalLedger(record);
  return record;
}
