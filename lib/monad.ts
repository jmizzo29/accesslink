import { ethers } from 'ethers';

const CONTRACT_ABI = [
  'function submitRecord(bytes32 propertyHash, string memory location) public returns (bytes32)',
  'function verifyRecord(bytes32 recordId) public',
  'function getRecord(bytes32 recordId) public view returns (tuple(bytes32, string, uint256, address, bool))',
  'function getRecordCount() public view returns (uint256)',
];

export class MonadAccessLink {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor(rpcUrl: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
  }

  /**
   * Initialize contract instance with signer (for write operations)
   */
  async initWithSigner(privateKey: string) {
    const signer = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer);
  }

  /**
   * Initialize contract instance for read-only (no signer needed)
   */
  async initReadOnly() {
    this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.provider);
  }

  /**
   * Submit a property accessibility report to the blockchain
   */
  async submitRecord(propertyData: { title: string; location: string; features: string[] }): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initWithSigner first.');
    }

    try {
      // Hash the property data
      const hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'string', 'string[]'],
          [propertyData.title, propertyData.location, propertyData.features]
        )
      );

      const tx = await this.contract.submitRecord(hash, propertyData.location);
      const receipt = await tx.wait();

      return receipt?.transactionHash || '';
    } catch (error) {
      console.error('Failed to submit record:', error);
      throw error;
    }
  }

  /**
   * Verify a record (mark it as verified by community)
   */
  async verifyRecord(recordId: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initWithSigner first.');
    }

    try {
      const tx = await this.contract.verifyRecord(recordId);
      const receipt = await tx.wait();

      return receipt?.transactionHash || '';
    } catch (error) {
      console.error('Failed to verify record:', error);
      throw error;
    }
  }

  /**
   * Get a verified record from the blockchain
   */
  async getRecord(recordId: string): Promise<any> {
    if (!this.contract) {
      await this.initReadOnly();
    }

    try {
      const record = await (this.contract as ethers.Contract).getRecord(recordId);
      return {
        propertyHash: record[0],
        location: record[1],
        timestamp: record[2],
        verifiedBy: record[3],
        verified: record[4],
      };
    } catch (error) {
      console.error('Failed to get record:', error);
      return null;
    }
  }

  /**
   * Get total number of verified records
   */
  async getRecordCount(): Promise<number> {
    if (!this.contract) {
      await this.initReadOnly();
    }

    try {
      const count = await (this.contract as ethers.Contract).getRecordCount();
      return count.toNumber();
    } catch (error) {
      console.error('Failed to get record count:', error);
      return 0;
    }
  }

  /**
   * Generate a record hash from property data
   */
  static generatePropertyHash(title: string, location: string, features: string[]): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'string[]'],
        [title, location, features]
      )
    );
  }
}

// Export singleton for use across the app
let monadInstance: MonadAccessLink | null = null;

export function getMonadInstance(): MonadAccessLink {
  const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC || 'https://mainnet.monad.xyz';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

  if (!monadInstance) {
    monadInstance = new MonadAccessLink(rpcUrl, contractAddress);
  }

  return monadInstance;
}
