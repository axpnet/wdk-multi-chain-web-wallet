# Getting Started

Version: 1.01

<div align="center">
  <p>
    <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Ethereum" width="40" height="40" title="Ethereum"/>
    <img src="https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" alt="Polygon" width="40" height="40" title="Polygon"/>
    <img src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" alt="BSC" width="40" height="40" title="BNB Smart Chain"/>
    <img src="https://assets.coingecko.com/coins/images/4128/small/solana.png" alt="Solana" width="40" height="40" title="Solana"/>
    <img src="https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png" alt="TON" width="40" height="40" title="TON"/>
  </p>
</div>

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