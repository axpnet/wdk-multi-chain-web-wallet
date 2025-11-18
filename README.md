# 💼 WDK Multi‑Wallet (PWA)

[![Version](https://img.shields.io/badge/version-1.02-blue.svg)](#)
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
    <strong>Supported Blockchains (8 Chains)</strong>
  </p>
  <p>
    <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Ethereum" width="40" height="40" title="Ethereum"/>
    <img src="https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" alt="Polygon" width="40" height="40" title="Polygon"/>
    <img src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" alt="BSC" width="40" height="40" title="BNB Smart Chain"/>
    <img src="https://assets.coingecko.com/coins/images/25244/small/Optimism.png" alt="Optimism" width="40" height="40" title="Optimism"/>
    <img src="https://assets.coingecko.com/asset_platforms/images/131/standard/base.png" alt="Base" width="40" height="40" title="Base"/>
    <img src="https://assets.coingecko.com/asset_platforms/images/33/standard/AO_logomark.png" alt="Arbitrum" width="40" height="40" title="Arbitrum"/>
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
- **Advanced Seed Security**: Choose from 12, 15, 18, 21, or 24-word seed phrases with real-time security guidance
- Send/Receive modals with QR, dynamic gas denomination per chain
- Fiat countervalue (EUR/USD) with short cache (CoinGecko)
- **WalletConnect**: Connect to dApps and sign transactions securely

## 🔄 Recent Updates

### v1.02 - Multi-Chain Address Derivation Fix
- ✅ **Fixed web wallet address derivation** for all 8 supported chains
- ✅ **Added custom derivation functions** for Solana and TON chains in web environment
- ✅ **Enhanced crypto bundle** with `deriveSolanaAddress` and `deriveTonAddress` functions
- ✅ **Improved CORS handling** for RPC endpoints in development
- ✅ **Consistent address generation** between extension and web versions

**Supported Chains**: Ethereum, Polygon, BSC, Optimism, Base, Arbitrum, Solana, TON

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
# Portable build (path relativi - funziona in qualsiasi cartella)
npm run build:portable

# GitHub Pages build (path assoluti)
npm run build:github

# Preview locale
npm run preview
```

## 🏗️ Chrome Extension Build Process

The WDK Wallet can be built as a Chrome extension for enhanced security and native browser integration. The extension build process creates a Manifest V3 compliant extension with strict CSP policies.

### Extension Build Steps

```bash
# Build the extension for production
npm run build:extension

# This command performs the following operations:
# 1. Builds the main application with Vite in extension mode
# 2. Bundles the background script with esbuild
# 3. Creates crypto-secure.min.js with IIFE format for browser compatibility
# 4. Copies popup files (HTML, JS, CSS) to extension-light/
# 5. Downloads FontAwesome CSS and processes it for local use
# 6. Copies manifest.json and icon files
# 7. Includes local QRCode.js library for CSP compliance
```

### Extension Architecture

**Key Files:**
- `manifest.json`: Extension configuration with strict CSP policies
- `popup.html`: Main popup interface (350px width, responsive)
- `popup.js`: Core wallet logic with theme support and storage management
- `popup.css`: Styling with CSS custom properties for theming
- `background.js`: Service worker for persistent background tasks
- `content.js`: Content script for dApp interaction
- `injected.js`: Web-accessible script for WalletConnect bridge

**Real Cryptocurrency Icons:**
- Uses authentic CoinGecko icons for all supported blockchains (Ethereum, Polygon, BSC, Solana, TON, etc.)
- Optimized sizing for popup constraints (20x20px in chain selection, 24x24px in balance view)
- Graceful fallback handling if images fail to load
- CSP-compliant external image loading from trusted HTTPS CDN

**Security Features:**
- **Content Security Policy**: `script-src 'self' 'wasm-unsafe-eval'` prevents external script loading
- **Local Libraries**: All dependencies (QRCode, crypto functions) are bundled locally
- **Isolated Contexts**: Background script and content scripts run in separate contexts
- **Storage Encryption**: Wallet data encrypted with AES-256-GCM in chrome.storage.local

**Theme System:**
- CSS custom properties for light/dark mode switching
- `data-theme` attribute on document root controls theme application
- Auto-detection of system preference (prefers-color-scheme)
- User preference persistence in chrome.storage.local

### Extension Installation

1. **Build the extension:**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension-light/` folder

3. **Verify installation:**
   - Extension icon should appear in toolbar
   - Click to open popup and test wallet functionality
   - Check console for any CSP violations or errors

### Extension Limitations

- **CSP Restrictions**: No external CDN scripts (all libraries must be local)
- **Browser Compatibility**: Chrome/Edge only (Manifest V3 requirement)
- **Popup Size**: Fixed 350px width, responsive height
- **Storage**: chrome.storage.local (5MB limit per extension)
- **Network**: Host permissions required for blockchain API calls

### Troubleshooting Extension Builds

**CSP Violations:**
- Ensure all scripts are local (no CDN links)
- Check manifest.json CSP policy matches requirements
- Verify QRCode library is the browser-compatible version

**Build Errors:**
- Clear node_modules and reinstall if esbuild fails
- Check that all source files exist in correct locations
- Verify crypto-secure.min.js is generated correctly

**Runtime Errors:**
- Check console for "require is not defined" (use browser-compatible libraries)
- Verify cryptoLight is loaded before wallet operations
- Test theme switching and storage persistence

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
  - **Seed Security Options**: Professional-grade seed phrase lengths (12-24 words) with BIP39 compliance
    - ⚠️ 12 words (128-bit): Basic testing and small amounts
    - 🟡 15 words (160-bit): Standard personal use
    - 🟢 18 words (192-bit): Enhanced security for regular users
    - 🔵 21 words (224-bit): Professional-grade for businesses
    - 💎 24 words (256-bit): Maximum security for large sums and institutions
- UX
  - Centered, sharp modals; backdrop click-to-close; inner clicks safe
  - Topbar theme switching (Auto/Light/Dark)
  - "New Wallet" button to re‑enter the wizard
- Fiat
  - Currency selector EUR/USD
  - Price cache 60s via CoinGecko Simple API
- WalletConnect Integration
  - Connect to decentralized applications (dApps)
  - Secure transaction signing and approval
  - Support for Ethereum, Polygon, BSC, Optimism, Arbitrum, Base
  - Session management with connection status indicator
- Chains & tickers
  - Ethereum (ETH), Polygon (POL), BSC (BNB), Solana (SOL), TON (TON), Litecoin (LTC), Tron (TRX)
  - Bitcoin is present with browser limitations

## 🔐 Security model (overview)

- AES‑256‑GCM encryption with randomly generated salt (16B) and IV (12B)
- Keys derived via PBKDF2 (100k, SHA‑256)
- Per‑wallet encrypted payload stored in localStorage (`wdk_wallets`)
- No passwords stored; only encrypted payloads + salts/ivs
- Seed is kept in memory only after unlock and cleared on reload/lock

### 🔑 Address Derivation (BIP39/BIP44 Standard)

The wallet implements **industry-standard address derivation** compliant with BIP39 and BIP44 specifications:

- **Seed Generation**: Uses PBKDF2 with HMAC-SHA512, 2048 iterations, and "mnemonic" salt (standard BIP39)
- **HD Key Derivation**: Follows BIP32 hierarchical deterministic keys
- **Path Standards**:
  - Ethereum & EVM chains: `m/44'/60'/0'/0/0` (BIP44 + EIP-155)
  - Solana: `m/44'/501'/0'/0'` (SLIP44 registered)
  - TON: `m/44'/396'/0'/0/0` (SLIP44 registered)
- **Compatibility**: Addresses match exactly with MetaMask, Rabby, Trust Wallet, and other standards-compliant wallets
- **Verification**: Tested with official test vectors and cross-verified with multiple wallet implementations

**Example**: With seed phrase "spread tenant edit cave hollow oak snap antenna pelican when fold blossom lucky force able jump vague lamp comfort razor kick seed sentence boost", the Ethereum address is `0x4736e2E41F00d823261E481bd47b603C583547A6`.

See SECURITY_GUIDE.md for detailed guidelines and best practices.

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Unit tests
npm run test:run

# Test with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

See [Testing Guide](docs/testing.md) for detailed instructions.

## ⚙️ Configuration

- Chains and RPC options live in `config.js` and `chains/*.js`
- UI/theme tokens are in `style.css`
- Vite config in `vite.config.js`

### 🔗 WalletConnect Setup

To enable WalletConnect functionality:

1. **Create a WalletConnect Project:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Sign up/Sign in to your account
   - Create a new project
   - Copy your Project ID

2. **Configure the Project ID:**
   - Open `modules/walletconnect.js`
   - Replace `'your-project-id-here'` with your actual Project ID:
   ```javascript
   const WALLET_CONNECT_PROJECT_ID = 'your-actual-project-id';
   ```

3. **Supported Chains:**
   - Ethereum (Mainnet & Sepolia)
   - Polygon (Mainnet & Mumbai)
   - BSC (Mainnet & Testnet)
   - Optimism (Mainnet & Sepolia)
   - Arbitrum (Mainnet & Sepolia)
   - Base (Mainnet & Sepolia)

4. **How to Use:**
   - Click the WalletConnect button (🔗) in the topbar
   - The wallet will listen for connection requests from dApps
   - When a dApp requests connection, you'll see an approval modal
   - Approve transactions securely through the wallet interface

**Note:** WalletConnect requires the Project ID to be configured for production use. Without it, the feature will show initialization errors.

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
