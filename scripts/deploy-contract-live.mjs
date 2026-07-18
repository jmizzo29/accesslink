/**
 * Compile AccessLinkVerified.sol and deploy to Monad testnet.
 * Usage: MONAD_PRIVATE_KEY=0x... node scripts/deploy-contract-live.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import { ethers } from 'ethers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RPC = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const CHAIN_ID = 10143;

function compileContract() {
  const sourcePath = join(ROOT, 'contracts', 'AccessLinkVerified.sol');
  const source = readFileSync(sourcePath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'AccessLinkVerified.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors || []).filter((e) => e.severity === 'error');
  if (errors.length) {
    throw new Error(errors.map((e) => e.formattedMessage).join('\n'));
  }

  const contract = output.contracts['AccessLinkVerified.sol']['AccessLinkVerified'];
  return { abi: contract.abi, bytecode: `0x${contract.evm.bytecode.object}` };
}

async function main() {
  const privateKey = process.env.MONAD_PRIVATE_KEY;
  if (!privateKey) {
    console.error('Set MONAD_PRIVATE_KEY to deploy.');
    process.exit(1);
  }

  console.log('Compiling AccessLinkVerified.sol…');
  const { abi, bytecode } = compileContract();

  const provider = new ethers.JsonRpcProvider(RPC, CHAIN_ID);
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} MON`);

  if (balance === 0n) {
    console.error('Wallet has zero MON. Fund via https://faucet.monad.xyz then retry.');
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log('Deploying to Monad testnet…');
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const outDir = join(ROOT, 'deploy');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const manifest = {
    contractAddress: address,
    chainId: CHAIN_ID,
    rpcUrl: RPC,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    explorer: `https://testnet.monadvision.com/address/${address}`,
  };

  writeFileSync(join(outDir, 'monad-contract.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(join(outDir, 'AccessLinkVerified.abi.json'), JSON.stringify(abi, null, 2));

  console.log('\nDeployed AccessLinkVerified');
  console.log(`  Address:   ${address}`);
  console.log(`  Explorer:  ${manifest.explorer}`);
  console.log(`  Manifest:  deploy/monad-contract.json`);
  console.log('\nSet on Vercel (restarto-site):');
  console.log(`  VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`  MONAD_PRIVATE_KEY=<same deployer key>`);
  console.log(`  MONAD_RPC_URL=${RPC}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
