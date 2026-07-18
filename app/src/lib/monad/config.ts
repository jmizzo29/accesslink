/** Canonical Monad testnet deploy — matches deploy/monad-contract.json */

export const MONAD_CHAIN_ID = 10143;
export const MONAD_CHAIN_ID_HEX = '0x279f';
export const MONAD_NETWORK_NAME = 'Monad Testnet';
export const MONAD_RPC_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONAD_RPC) ||
  'https://testnet-rpc.monad.xyz';
export const MONAD_EXPLORER = 'https://testnet.monadvision.com';
export const MONAD_CONTRACT_ADDRESS =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTRACT_ADDRESS) ||
  '0x26a0383b3E81e0f81261ecE6aadB3aAC8022195E';

export const MONAD_CONTRACT_ABI = [
  'function submitRecord(bytes32 propertyHash, string memory location) public returns (bytes32)',
  'function verifyRecord(bytes32 recordId) public',
  'function getRecord(bytes32 recordId) public view returns (tuple(bytes32 propertyHash, string location, uint256 timestamp, address verifiedBy, bool verified))',
  'function getRecordCount() public view returns (uint256)',
  'function getRecordIdByIndex(uint256 index) public view returns (bytes32)',
] as const;

export const LOCAL_LEDGER_KEY = 'a4a-monad-ledger-v1';
