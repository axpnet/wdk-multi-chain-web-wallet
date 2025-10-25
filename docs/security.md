# Security Model

Version: 1.01

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

## Best Practices

- Always keep an offline seed backup
- Use strong, unique passwords per wallet
- Prefer hardware wallets for significant funds
- Test flows on testnets before mainnet use

More details → ../SECURITY_GUIDE.md