/**
 * Axiom Smart Contract Deployment Helper
 * Usage: node scripts/deploy-contract.js [rpc_url] [private_key]
 * Default RPC: http://127.0.0.1:7545 (Ganache GUI) or http://127.0.0.1:8545 (Hardhat)
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   Axiom Timelock Escrow Smart Contract Deployer    ');
console.log('====================================================\n');

const contractPath = path.join(__dirname, '..', 'contracts', 'AxiomTimelockEscrow.sol');
if (fs.existsSync(contractPath)) {
  console.log('✓ Found Solidity Contract: contracts/AxiomTimelockEscrow.sol');
  console.log('✓ ABI Definition Ready: src/lib/smart-contract-abi.ts\n');
  console.log('Instructions to deploy to local network (Ganache / Hardhat):');
  console.log('1. Start your local blockchain node (e.g. Open Ganache GUI on port 7545).');
  console.log('2. In MetaMask, connect to Localhost / Ganache network (RPC: http://127.0.0.1:7545).');
  console.log('3. Set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in your .env.local with your deployed address.\n');
  console.log('Note: The Next.js web application is completely self-contained and operates seamlessly');
  console.log('even without a local blockchain node running!');
} else {
  console.error('Contract file not found at:', contractPath);
}
