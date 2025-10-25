# Getting Started

Version: 1.01

## Prerequisites

- Node.js 18+

## Install & Run

```sh
npm install
npm run dev
```
Open http://localhost:3000.

Build for production:

```sh
npm run build
npm run preview
```

## First Run

- If no wallets exist: a 4‑step wizard guides you through Setup → Seed → Verify → Initialize.
- If wallets exist: you’ll see the Login screen; select a wallet and enter its password.

## Key UI Elements

- Chain selector: updates balance label and gas unit (ETH/BNB/POL/…)
- Fiat selector: EUR/USD with 60s cache (CoinGecko)
- Security modal: change password, export/import encrypted backup (.wdk), auto‑lock, lock now
- New Wallet: start the wizard to add another wallet

## Links

- README → ../README.md
- Security Model → ./security.md
- Quick Start (detailed) → ../QUICK_START.md