export function monadExplorerTxUrl(explorerBase: string, txHash: string): string {
  const base = explorerBase.replace(/\/$/, '');
  return `${base}/tx/${txHash}`;
}

export function monadExplorerAddressUrl(explorerBase: string, address: string): string {
  const base = explorerBase.replace(/\/$/, '');
  return `${base}/address/${address}`;
}

export function shortenHash(value: string, head = 6, tail = 4): string {
  if (!value || value.length <= head + tail + 2) return value;
  return `${value.slice(0, head + 2)}…${value.slice(-tail)}`;
}
