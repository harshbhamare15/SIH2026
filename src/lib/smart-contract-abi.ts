/**
 * AxiomTimelockEscrow Smart Contract ABI & Interface Definition
 * Connects Next.js client-side Web3 (MetaMask) and server-side RPC to the on-chain Timelock Escrow.
 */

export const AXIOM_TIMELOCK_ESCROW_ADDRESS = 
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const AXIOM_TIMELOCK_ESCROW_ABI = [
  // Constructor
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "tenderId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "closingTimestamp", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "authority", "type": "address" }
    ],
    "name": "TenderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "tenderId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "applicationId", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "bidHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "bidderWallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "submittedTimestamp", "type": "uint256" }
    ],
    "name": "SealedBidSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "tenderId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "applicationId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "networkKeyShare", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "releasedTimestamp", "type": "uint256" }
    ],
    "name": "NetworkKeyReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "applicationId", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "bidHash", "type": "bytes32" },
      { "indexed": false, "internalType": "bool", "name": "isValid", "type": "bool" }
    ],
    "name": "BidIntegrityVerified",
    "type": "event"
  },
  // Functions
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_tenderId", "type": "bytes32" },
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "uint256", "name": "_closingTimestamp", "type": "uint256" }
    ],
    "name": "createTender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_tenderId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "_applicationId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "_bidHash", "type": "bytes32" },
      { "internalType": "string", "name": "_networkKeyShare", "type": "string" }
    ],
    "name": "submitSealedBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_tenderId", "type": "bytes32" }
    ],
    "name": "getApplicationCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_tenderId", "type": "bytes32" }
    ],
    "name": "isDeadlinePassed",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_tenderId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "_applicationId", "type": "bytes32" }
    ],
    "name": "requestNetworkKeyRelease",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_applicationId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "_computedBidHash", "type": "bytes32" }
    ],
    "name": "verifyBidIntegrity",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
