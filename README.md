# 💼 WDK Multi‑Wallet (PWA)

[![Version](https://img.shields.io/badge/version-1.01-blue.svg)](#) 
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](#)
[![CI/CD](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://axpnet.github.io/wdk-multi-chain-web-wallet/)

A lightweight, multi‑chain crypto wallet built with Vite + Vanilla JS. It runs fully in the browser, supports multiple named wallets (each with its own password), shows live fiat values, and ships as a PWA.

## ✨ Highlights

- Multi‑wallet: create and manage multiple wallets with per‑wallet passwords
- Secure storage: AES‑256‑GCM + PBKDF2 (100k) encryption in the browser
- Login screen: select a saved wallet and unlock with password
- Wizard onboarding (4 steps): Setup → Seed → Verify → Initialize
- Send/Receive modals with QR, dynamic gas denomination per chain
- Fiat countervalue (EUR/USD) with short cache (CoinGecko)
- PWA ready: installable and offline‑friendly basics
- Clean UI with toasts, modals, centered dialogs

## 🧭 Project structure

```
wallet-multichain/
  chains/                 # Chain integrations (EVM/Solana/TON/LTC/TRON/etc.)
  modules/
    login_screen.js       # Wallet list + unlock prompt
    price_service.js      # Fiat prices w/ cache + currency preference
    secure_storage.js     # Crypto helpers, auto‑lock utilities
    seed_manager.js       # Seed generate/verify UI helpers
    transactions.js       # Send/Receive flows (modals)
    ui_utils.js           # Toasts, modal, theme, helpers
    wallet_init.js        # Initialize addresses/balances across chains
    wallet_manager.js     # localStorage persistence for multi‑wallet
    wallet_ui.js          # Main wallet panel + security/settings dialogs
  ADVANCED_FEATURES.md
  QUICK_START.md
  REVIEW.md
  SECURITY_GUIDE.md
  config.js
  index.html
  main.js
  manifest.webmanifest
  style.css
  sw.js
  vite.config.js
```

## 🚀 Getting started

Prereqs: Node 18+ recommended.

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

Build for production:

```bash
npm run build
npm run preview  # optional local preview of dist/
```

## 🧩 Features in detail

- Multi‑wallet
  - Named wallets with independent encryption (salt + iv per wallet)
  - Login screen on startup if wallets exist; wizard if none
- Security
  - Change password (re‑encrypt seed)
  - Export/Import encrypted backup (.wdk)
  - Auto‑lock timeout selection (persisted), quick "Lock now"
- UX
  - Centered, sharp modals; backdrop click-to-close; inner clicks safe
  - Topbar theme switching (Auto/Light/Dark)
  - “New Wallet” button to re‑enter the wizard
- Fiat
  - Currency selector EUR/USD
  - Price cache 60s via CoinGecko Simple API
- Chains & tickers
  - Ethereum (ETH), Polygon (POL), BSC (BNB), Solana (SOL), TON (TON), Litecoin (LTC), Tron (TRX)
  - Bitcoin is present with browser limitations

## 🔐 Security model (overview)

- AES‑256‑GCM encryption with randomly generated salt (16B) and IV (12B)
- Keys derived via PBKDF2 (100k, SHA‑256)
- Per‑wallet encrypted payload stored in localStorage (`wdk_wallets`)
- No passwords stored; only encrypted payloads + salts/ivs
- Seed is kept in memory only after unlock and cleared on reload/lock

See SECURITY_GUIDE.md for detailed guidelines and best practices.

## ⚙️ Configuration

- Chains and RPC options live in `config.js` and `chains/*.js`
- UI/theme tokens are in `style.css`
- Vite config in `vite.config.js`

## 📦 PWA

- `manifest.webmanifest` and `sw.js` included
- "Install App" CTA appears when install prompt is available

## 🔍 Troubleshooting

- RPC timeouts / socket errors: try different RPC endpoints, or reload
- Prices not showing: CoinGecko may rate‑limit; values resume after cache refresh
- Modals misaligned: ensure CSS variables are present (see style.css) and no external overrides

## 📚 Documentation

- QUICK_START.md – updated quick guide with multi‑wallet flow
- SECURITY_GUIDE.md – security rationale, do’s and don’ts
- ADVANCED_FEATURES.md – deeper dives, checklists, roadmap
- REVIEW.md – broader design/UX notes

Online docs (GitHub Pages-ready):
- docs/index.md – Product overview + links
- docs/security.md – Security model summary (AES‑256‑GCM, PBKDF2, storage)
- docs/getting-started.md – Short setup with links to Quick Start

## � Credits & Acknowledgments

- © axpdev — info@axpdev.it
- Powered by Vite, Web Crypto API, CoinGecko Simple Price API, and Bootstrap
- Built with GitHub Copilot

## �🛡️ Disclaimer

This project is for educational purposes. Use at your own risk. Always keep an offline seed backup and test on testnets before interacting with mainnet funds.

## 🤝 Contributing

PRs welcome. Please:
- Keep changes focused and documented
- Respect the current modular structure
- Avoid introducing heavy dependencies without discussion

## 📄 License

MIT (c) 2025
