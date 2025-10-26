# Security Model

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

## Overview

- Encryption: AES‑256‑GCM
- Key derivation: PBKDF2 (SHA‑256, 100k iterations)
- Random salt (16B) and IV (12B) per wallet
- Storage: encrypted payloads in localStorage under `wdk_wallets`
- No passwords stored; only encrypted seed + salt/iv
- Seed exists in memory only after unlock; cleared on reload/lock

## Security Actions

- Change password: decrypt with old password, re‑encrypt with new, persist
- Export backup: download encrypted `.wdk` file (per wallet)
- Import backup: select `.wdk`, provide password, wallet is added/updated
- Auto‑lock: choose a timeout that locks the app after inactivity
- Lock now: clears in‑memory secrets and returns to Login

## Livelli di sicurezza (★)

- Cifratura seed (AES‑256‑GCM): ★★★★★
- Derivazione chiavi (PBKDF2 100k/SHA‑256): ★★★★☆
- Dati a riposo (localStorage cifrato): ★★★☆☆
- Gestione memoria (seed volatile post‑unlock): ★★★★☆
- Password per‑wallet (isolate): ★★★★☆
- Cambio password (re‑encrypt on change): ★★★★☆
- Backup cifrato (.wdk): ★★★★☆
- Auto‑lock inattività: ★★★★☆
- Nessuna password salvata: ★★★★★
- Supply‑chain risk (dipendenze NPM): ★★☆☆☆
- Rischi rete (phishing/man‑in‑the‑browser): ★★☆☆☆
- PWA/Service Worker cache hardening: ★★★☆☆

Legenda: ★★★★★ molto forte · ★★★★☆ forte · ★★★☆☆ medio · ★★☆☆☆ base · ★☆☆☆☆ debole

## Best Practices

- Always keep an offline seed backup
- Use strong, unique passwords per wallet
- Prefer hardware wallets for significant funds
- Test flows on testnets before mainnet use

More details → ../SECURITY_GUIDE.md