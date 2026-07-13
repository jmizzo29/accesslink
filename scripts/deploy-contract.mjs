import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

const CONTRACT_ABI = [
  "function submitRecord(bytes32 propertyHash, string memory location) public returns (bytes32)",
  "function verifyRecord(bytes32 recordId) public",
  "function getRecord(bytes32 recordId) public view returns (tuple(bytes32 propertyHash, string location, uint256 timestamp, address verifiedBy, bool verified) record)",
  "function getRecordCount() public view returns (uint256)",
];

async function deployContract() {
  try {
    // Get RPC URL and private key from environment
    const rpcUrl = process.env.MONAD_RPC_URL || 'https://mainnet.monad.xyz';
    const privateKey = process.env.MONAD_PRIVATE_KEY;

    if (!privateKey) {
      console.error('❌ Error: MONAD_PRIVATE_KEY environment variable not set');
      console.log('Please set the MONAD_PRIVATE_KEY to deploy the contract.');
      process.exit(1);
    }

    // Connect to Monad
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    console.log(`🔗 Connected to Monad RPC: ${rpcUrl}`);
    console.log(`📝 Deploying from: ${signer.address}`);

    // Read the compiled contract
    const contractPath = path.join(process.cwd(), 'contracts', 'AccessLinkVerified.sol');
    if (!fs.existsSync(contractPath)) {
      console.log('⚠️  Note: Contract deployment requires solc. Using ABI for now.');
      console.log(`Contract file: ${contractPath}`);
      return;
    }

    // For hackathon: output contract details
    const contractDetails = {
      name: 'AccessLinkVerified',
      chainId: 10143, // Monad testnet/mainnet
      abi: CONTRACT_ABI,
      deploymentTime: new Date().toISOString(),
      deployerAddress: signer.address,
      status: 'ready_for_deployment',
    };

    const outputPath = path.join(process.cwd(), '.env.local.example');
    fs.writeFileSync(
      outputPath,
      `# Copy this to .env.local after deploying the contract\n\nNEXT_PUBLIC_MONAD_RPC=https://mainnet.monad.xyz\nNEXT_PUBLIC_CONTRACT_ADDRESS=0x...\nMONAD_PRIVATE_KEY=${privateKey}\n`
    );

    console.log('\n✅ Contract deployment configuration ready!');
    console.log(`   Deployer: ${signer.address}`);
    console.log(`   Chain: Monad (ID: 10143)`);
    console.log(`   ABI Methods: ${CONTRACT_ABI.length}`);
    console.log(`\n📄 Details saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployContract();
