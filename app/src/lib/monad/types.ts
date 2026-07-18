export type MonadChainStatus = {
  chainId: number;
  network: string;
  rpcUrl: string;
  contractAddress: string | null;
  writeEnabled: boolean;
  readEnabled: boolean;
  explorer: string;
  onChainRecordCount?: number;
  ledgerRecordCount?: number;
};

export type VerificationRecord = {
  id: string;
  propertyId: string;
  propertyName: string;
  location: string;
  propertyHash: string;
  recordId: string;
  txHash: string;
  action: 'submit' | 'verify';
  verifiedBy: string;
  verifiedAt: string;
  onChain: boolean;
  reportId?: string | null;
  note?: string;
};

export type VerificationHistoryResponse = {
  records: VerificationRecord[];
  total: number;
  propertyId: string | null;
  status: MonadChainStatus;
};
