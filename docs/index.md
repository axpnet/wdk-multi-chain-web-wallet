# WDK Multi‑Wallet Docs

Version: 1.01

A lightweight, multi‑chain crypto wallet (browser‑only, PWA) with multiple named wallets, secure per‑wallet encryption, and live fiat values.

- Getting Started → ./getting-started.md
- Security Model → ./security.md
- Project README → ../README.md

## Features

- Multi‑wallet with per‑wallet passwords
- AES‑256‑GCM + PBKDF2 (100k) encryption
- Send/Receive with QR, dynamic gas per chain
- Fiat countervalue (EUR/USD) cached via CoinGecko
- PWA installable; offline‑friendly basics

## Supported chains

- Ethereum (ETH), Polygon (POL), BSC (BNB), Solana (SOL), TON (TON), Litecoin (LTC), Tron (TRX)
- Bitcoin included with browser‑environment limitations

## Credits

© axpdev — info@axpdev.it
Powered by Vite, Web Crypto API, CoinGecko Simple Price API, and Bootstrap.
Built with GitHub Copilot.