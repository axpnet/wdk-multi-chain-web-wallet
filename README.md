# DEPRECATED — This project has been replaced by Rusby Wallet

> **This repository is no longer maintained.**
> The project has been rewritten from scratch in pure Rust with a new architecture.

## Successor: Rusby Wallet

**Rusby** is the successor to WDK Multi-Wallet, rewritten entirely in Rust with Leptos (WebAssembly):

- **Pure Rust** — zero JavaScript, native crypto compiled to WASM
- **11 chains** — EVM (ETH, Polygon, BSC, Optimism, Base, Arbitrum) + Solana + TON + Bitcoin + Cosmos Hub + Osmosis
- **Native security** — AES-256-GCM, PBKDF2 100k iterations, all in Rust
- **Multi-target** — Chrome Extension + Web App + Desktop (Tauri)
- **Performance** — optimized WASM binary, no JS runtime

See: **[github.com/axpnet/rusby-wallet](https://github.com/axpnet/rusby-wallet)**

---

<details>
<summary>Original README (archive)</summary>

## WDK Multi-Wallet (PWA) — v1.02

Lightweight multi-chain crypto wallet built with Vite + Vanilla JS.

### Supported Chains
Ethereum, Polygon, BSC, Optimism, Base, Arbitrum, Solana, TON

### Features
- Multi-wallet with per-wallet passwords
- AES-256-GCM + PBKDF2 encryption
- PWA installable
- Chrome Extension (Manifest V3)
- WalletConnect v2
- Fiat countervalue (CoinGecko)

### Security
- AES-256-GCM with random salt (16B) and IV (12B)
- PBKDF2 (100k iterations, SHA-256)
- Seed kept in memory only, cleared on lock/reload

### Why it was replaced
- JavaScript crypto dependencies are fragile and difficult to audit
- Code duplication between extension and web app
- Balance fetching and transactions were mock implementations
- Architecture grew organically and became difficult to maintain

</details>

---

## License

MIT (c) 2025 — axpdev
