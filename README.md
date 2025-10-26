# 💼 WDK Multi‑Wallet (PWA)

[![Version](https://img.shields.io/badge/version-1.01-blue.svg)](#) 
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](#)
[![CI/CD](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://axpnet.github.io/wdk-multi-chain-web-wallet/)
[![Pre-release](https://img.shields.io/github/v/release/axpnet/wdk-multi-chain-web-wallet?include_prereleases&label=beta)](https://github.com/axpnet/wdk-multi-chain-web-wallet/releases)

<div align="center">
  <strong>Languages / Lingue:</strong>
  <a href="/README.md">English</a> ·
  <a href="docs/getting-started.it.md">Italiano – Guida rapida</a> ·
  <a href="docs/security.it.md">Sicurezza (IT)</a>
</div>

<div align="center">
  <p>
    <strong>Supported Blockchains</strong>
  </p>
  <p>
    <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Ethereum" width="40" height="40" title="Ethereum"/>
    <img src="https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" alt="Polygon" width="40" height="40" title="Polygon"/>
    <img src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" alt="BSC" width="40" height="40" title="BNB Smart Chain"/>
    <img src="https://assets.coingecko.com/coins/images/4128/small/solana.png" alt="Solana" width="40" height="40" title="Solana"/>
    <img src="https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png" alt="TON" width="40" height="40" title="TON"/>
  </p>
</div>

A lightweight, multi‑chain crypto wallet built with Vite + Vanilla JS. It runs fully in the browser, supports multiple named wallets (each with its own password), shows live fiat values, and ships as a PWA.

## ✨ Highlights

- Multi‑wallet: create and manage multiple wallets with per‑wallet passwords
- Secure storage: AES‑256‑GCM + PBKDF2 (100k) encryption in the browser
- Login screen: select a saved wallet and unlock with password
- Wizard onboarding (4 steps): Setup → Seed → Verify → Initialize
- Send/Receive modals with QR, dynamic gas denomination per chain
- Fiat countervalue (EUR/USD) with short cache (CoinGecko)

## � Supported Platforms & Devices

Coming soon. Inserisci gli screenshot in `docs/screenshots/` e rimuovi i commenti HTML qui sotto per mostrare la galleria.

<!--
<p align="center">
  <img src="docs/screenshots/home.png" width="45%" alt="Home"/>
  <img src="docs/screenshots/wizard.png" width="45%" alt="Onboarding Wizard"/>
</p>

<p align="center">
  <img src="docs/screenshots/send.png" width="45%" alt="Send Modal"/>
  <img src="docs/screenshots/dark-mode.png" width="45%" alt="Dark Mode & Chain Icons"/>
</p>
-->

- Web browsers: Chrome, Edge, Firefox, Safari (desktop & mobile)
- PWA installabile: Windows, macOS, Linux, Android, iOS (con limiti PWA su iOS)
- Desktop nativo (Electron): Windows (.exe), macOS (.dmg), Linux (.AppImage/.deb)
- Mobile nativo (opzionale via Capacitor): Android/iOS

Lingue/Docs:
- English README (this page)
- Documentazione in Italiano: vedi sezione Docs sotto e i file in `docs/*.it.md`

## �🧭 Project structure

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

## 🌐 Deployment & Installation

This wallet is **extremely versatile** and can run in multiple environments:

### 📱 As a Web App (Live Demo)

**👉 [https://axpnet.github.io/wdk-multi-chain-web-wallet/](https://axpnet.github.io/wdk-multi-chain-web-wallet/)**

- Access directly from any modern browser
- No installation required
- Works on desktop and mobile
- Fully responsive design

### 💾 As a Progressive Web App (PWA)

**Install like a native app:**

**Desktop:**
- **Windows/Linux**: Chrome/Edge → Click "Install" icon in address bar
- **macOS**: Chrome/Safari → "Add to Dock" or "Install"

**Mobile:**
- **Android**: Chrome → Menu → "Add to Home screen"
- **iOS**: Safari → Share → "Add to Home Screen"

**Benefits:**
- 📲 App icon on your device
- 🚀 Launches in standalone window (no browser UI)
- ⚡ Faster loading with service worker
- 📡 Basic offline functionality

### 🖥️ Self-Hosting Options

#### Option 1: Static Hosting (Recommended)

Deploy on any static hosting platform:

**Free Options:**
```bash
# 1. Build the app
npm run build

# 2. Deploy dist/ folder to:
```

- **GitHub Pages** (already configured) ✅
- **Netlify**: Drag & drop `dist/` folder or connect GitHub repo
- **Vercel**: `npx vercel --prod`
- **Cloudflare Pages**: Connect repo, build command: `npm run build`, output: `dist`
- **Firebase Hosting**: `firebase deploy`

**Paid Hosting:**
- Traditional web hosting (Aruba, SiteGround, etc.)
- VPS with Nginx/Apache
- Any host supporting static HTML/CSS/JS

**Requirements:**
- ✅ Static file hosting (HTML/CSS/JS)
- ✅ HTTPS recommended (required for some PWA features)
- ❌ NO server-side runtime needed (no PHP/Node.js/database)

#### Option 2: Local/Intranet Deployment

**For private networks or offline use:**

```bash
# After building
npm run build

# Serve locally with:
npx serve dist -l 3001
# or
python -m http.server 8000 --directory dist

# Access at:
# http://localhost:3001
# or from network: http://192.168.1.100:3001
```

**Use cases:**
- Company intranet
- Air-gapped environments (maximum security)
- Local testing
- Offline wallet access

#### Option 3: Domain Configuration

**Custom domain setup (e.g., `wallet.yourdomain.com`):**

1. **DNS Configuration:**
   ```
   Type: CNAME
   Name: wallet
   Value: yourusername.github.io (or hosting provider)
   ```

2. **HTTPS Setup:**
   - GitHub Pages: Enable HTTPS in repo settings
   - Netlify/Vercel: Automatic HTTPS
   - Self-hosted: Use Let's Encrypt (certbot)

3. **Nginx Example** (VPS):
   ```nginx
   server {
       listen 80;
       server_name wallet.yourdomain.com;
       root /var/www/wallet/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### 📦 Desktop App (Electron)

Run as a native desktop application or build installers:

```bash
# Dev: launches Vite + Electron with live reload
npm run electron:dev

# Build production web assets with correct base for Electron
npm run build:electron

# Package installers for all platforms (on their respective OSes)
npm run electron:build

# Or target a specific OS
npm run electron:build:win   # Windows (.exe via NSIS)
npm run electron:build:mac   # macOS (.dmg)
npm run electron:build:linux # Linux (.AppImage, .deb)
```

Outputs will be in the `dist/` and `dist_electron/` folders depending on target. Common artifacts: `.exe` (Windows), `.dmg` (macOS), `.AppImage`/`.deb` (Linux).

Benefits:
- Native OS integration
- Offline-first
- No browser required
- Distributable executable

### 📱 Mobile App (Capacitor)

**Convert to native Android/iOS app:**

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Add platforms
npx cap add android
npx cap add ios

# Build and run
npm run build
npx cap sync
npx cap open android  # or ios
```

**Publish to:**
- Google Play Store (Android)
- Apple App Store (iOS)

### 🔒 Security Considerations by Deployment

| Deployment Type | Security Level | Best For |
|----------------|----------------|----------|
| **GitHub Pages** | ⭐⭐⭐⭐ | Public demo, open source |
| **Self-hosted HTTPS** | ⭐⭐⭐⭐⭐ | Full control, custom domain |
| **Local/Offline** | ⭐⭐⭐⭐⭐ | Maximum privacy, air-gapped |
| **PWA Installed** | ⭐⭐⭐⭐ | Convenience + security |
| **Electron Desktop** | ⭐⭐⭐⭐⭐ | Native integration |

**Key Points:**
- 🔐 All encryption happens **client-side** (in your browser)
- 🚫 Seed phrase **never leaves your device**
- 🌐 HTTPS protects against man-in-the-middle attacks
- 💾 Offline use = zero network exposure

### ⚙️ Browser Compatibility

**Supported:**
- ✅ Chrome/Edge 90+ (Chromium-based)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Not Supported:**
- ❌ Internet Explorer 11

**Mobile:**
- ✅ Android 5.0+ (Chrome)
- ✅ iOS 11.3+ (Safari, limited PWA)

### 📊 Deployment Checklist

**Before going live:**
- [ ] Update version in `package.json` and README badges
- [ ] Test on target platform (desktop/mobile)
- [ ] Verify HTTPS is enabled
- [ ] Check PWA manifest and icons
- [ ] Test offline functionality
- [ ] Review security settings
- [ ] Update documentation links
- [ ] Create GitHub release tag

**Recommended:**
- [ ] Enable GitHub Pages via repo settings
- [ ] Configure custom domain (optional)
- [ ] Set up CI/CD for auto-deployment
- [ ] Monitor with Google Analytics (optional)

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

## ⚙️ CI/CD e Automazioni

Per mantenere il README focalizzato sul prodotto, la documentazione completa dei workflow GitHub Actions è stata spostata in una pagina dedicata. Trovi dettagli, stato e istruzioni qui:

- Documentazione CI/CD: [.github/WORKFLOWS.md](.github/WORKFLOWS.md) (GitHub Actions Workflows)
- Tab "Actions" del repository: https://github.com/axpnet/wdk-multi-chain-web-wallet/actions

Nel README manteniamo solo i badge di stato per un colpo d'occhio.

## 🙌 Credits & Acknowledgments

- © axpdev — info@axpdev.it
- Powered by Vite, Web Crypto API, CoinGecko Simple Price API, and Bootstrap
- Built with GitHub Copilot

## 🛡️ Disclaimer

This project is for educational purposes. Use at your own risk. Always keep an offline seed backup and test on testnets before interacting with mainnet funds.

## 🤝 Contributing

PRs welcome. Please:
- Keep changes focused and documented
- Respect the current modular structure
- Avoid introducing heavy dependencies without discussion

## 📄 License

MIT (c) 2025
