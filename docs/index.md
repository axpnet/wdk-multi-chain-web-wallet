# WDK Multi‑Wallet Docs

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