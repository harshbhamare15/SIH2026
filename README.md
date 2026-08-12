# Axiom — Decentralized Sealed-Bid Public Procurement Platform

**Axiom** is a next-generation public e-procurement platform integrating cryptographic sealed-bid security, 2-of-2 secret sharing, decentralized timelock escrow, and real-time live auction capabilities.

---

## 🌟 Key Features

- **Decentralized Timelock Escrow (`AxiomTimelockEscrow.sol`)**: Guarantees that commercial bids remain locked on-chain and off-chain until the tender closing window officially expires.
- **Cryptographic Sealed-Bid Engine**: High-security AES-256-GCM symmetric encryption with 2-of-2 secret key splitting between local databases and network vaults.
- **Role-Based Portals**:
  - **Bidder Portal**: Registration, identity verification, active bid submission, and document sealing.
  - **Admin & Opener Console**: Multi-tier tender creation, corrigendum publishing, audit logging, and dual-key unsealing triggers.
- **Live Auction Arena**: Real-time dynamic bidding with automated countdown timers and leading-bid tracking.
- **Accessibility & Compliance**: Comprehensive accessibility suite (high-contrast mode, font scaling, screen reader access) adhering to GIGW & WCAG guidelines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or 20+)
- MySQL Database

### Installation & Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Configure your `.env.local` or `.env` file:
   ```env
   DATABASE_URL="mysql://root:password@127.0.0.1:3306/axiom"
   AXIOM_MASTER_KEY="your-32-byte-hex-key"
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   - Public Portal: [http://localhost:3000](http://localhost:3000)
   - User Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Admin Console: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS
- **Database**: MySQL with `mysql2` connection pooling
- **Smart Contracts**: Solidity (`AxiomTimelockEscrow.sol`)
- **Cryptography**: Node.js `crypto` (AES-256-GCM, HMAC-SHA256, Blind Indexing)

