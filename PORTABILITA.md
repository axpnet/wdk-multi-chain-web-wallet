# 🔄 Portabilità del Wallet - Guida Tecnica

## 🎯 Problema Risolto

Il wallet ora supporta **due modalità di build** per massima flessibilità:

### ❌ Problema Precedente
- Build hardcoded per `/wdk-multi-chain-web-wallet/`
- Funzionava solo in quella specifica cartella
- Deploy in `/lab/wdk-multi-chain-web-wallet/` → **FALLIVA** ❌
- Path assoluti `/wdk-multi-chain-web-wallet/assets/...`

### ✅ Soluzione Implementata
- **Build portabile** con path relativi `./assets/...`
- **Funziona in QUALSIASI cartella**
- Deploy in root, sottocartelle, ovunque → **FUNZIONA** ✅

---

## 🛠️ Come Funziona

### 1. Build Portabile (Default)
```bash
npm run build:portable
# oppure semplicemente
npm run build
```

**Genera:**
- Path relativi: `./assets/index-xxx.js`
- Funziona in: root, /wallet/, /lab/crypto/, ovunque!
- Ideale per: Aruba, hosting custom, distribuzioni

**Quando usare:**
- ✅ Deploy su Aruba (qualsiasi path)
- ✅ Distribuzione ZIP
- ✅ Server custom
- ✅ Testing locale in sottocartelle

### 2. Build GitHub Pages
```bash
npm run build:github
```

**Genera:**
- Path assoluti: `/wdk-multi-chain-web-wallet/assets/index-xxx.js`
- Funziona solo in: `/wdk-multi-chain-web-wallet/`
- Ideale per: GitHub Pages deployment automatico

**Quando usare:**
- ✅ GitHub Actions CI/CD
- ✅ Deploy automatico su GitHub Pages
- ❌ NON usare per Aruba o altre destinazioni

---

## 📁 Struttura Path

### Path Relativi (Portabile)
```html
<!-- index.html -->
<link rel="manifest" href="./assets/manifest-xxx.webmanifest">
<script src="./assets/index-xxx.js"></script>
```

**Comportamento:**
- In `https://www.axpdev.it/` → cerca `/assets/...`
- In `https://www.axpdev.it/wallet/` → cerca `/wallet/assets/...`
- In `https://www.axpdev.it/lab/wdk/` → cerca `/lab/wdk/assets/...`

### Path Assoluti (GitHub Pages)
```html
<!-- index.html -->
<link rel="manifest" href="/wdk-multi-chain-web-wallet/assets/manifest-xxx.webmanifest">
<script src="/wdk-multi-chain-web-wallet/assets/index-xxx.js"></script>
```

**Comportamento:**
- Funziona SOLO se installato in `/wdk-multi-chain-web-wallet/`
- Altri path → 404 Not Found

---

## 🚀 Deployment

### Aruba (Portabile)
```bash
# 1. Build portabile
npm run build:portable

# 2. Crea ZIP
Compress-Archive -Path "dist\*" -DestinationPath "Desktop\wdk-wallet-portable.zip" -Force

# 3. Upload su Aruba in QUALSIASI cartella
# - www.axpdev.it/
# - www.axpdev.it/wallet/
# - www.axpdev.it/lab/wdk/
# Funziona ovunque!
```

### GitHub Pages (Automatico)
```bash
# Push su main → GitHub Actions fa tutto
git push origin main

# Workflow usa automaticamente:
# npm run build:github
```

---

## ⚙️ Configurazione Tecnica

### vite.config.js
```javascript
export default defineConfig({
  // Path relativo di default, sovrascrivibile con BASE_PATH env var
  base: process.env.BASE_PATH || './',
  
  // ... resto config
});
```

### package.json
```json
{
  "scripts": {
    "build": "vite build",                    // Default: portabile
    "build:portable": "vite build",           // Esplicito: portabile
    "build:github": "BASE_PATH=/wdk-multi-chain-web-wallet/ vite build", // GitHub Pages
    "build:electron": "vite build --base=./"  // Electron (sempre portabile)
  }
}
```

### GitHub Workflow (.github/workflows/ci.yml)
```yaml
- name: 🏗️ Build for production
  run: npm run build:github  # Usa path assoluto per GitHub Pages
```

---

## 🔍 Verifica Build

### Controllare Path Generati
```powershell
# Aprire dist/index.html e cercare:
Get-Content "dist\index.html" | Select-String -Pattern 'src=|href='
```

**Path relativi (portabile):**
```
href="./assets/manifest-xxx.webmanifest"
src="./assets/index-xxx.js"
```

**Path assoluti (GitHub Pages):**
```
href="/wdk-multi-chain-web-wallet/assets/manifest-xxx.webmanifest"
src="/wdk-multi-chain-web-wallet/assets/index-xxx.js"
```

---

## 🧪 Testing Locale

### Testare Build Portabile in Sottocartelle
```bash
# 1. Build portabile
npm run build:portable

# 2. Simula sottocartella locale
# Crea: C:\test-wallet\sottocartella\dist\
mkdir C:\test-wallet\sottocartella
Copy-Item -Recurse dist\* C:\test-wallet\sottocartella\

# 3. Serve con qualsiasi server
# http://localhost:8000/sottocartella/
# Funziona!
```

---

## 📊 Comparazione

| Feature | Build Portabile | Build GitHub Pages |
|---------|----------------|-------------------|
| **Command** | `npm run build:portable` | `npm run build:github` |
| **Base Path** | `./` (relativo) | `/wdk-multi-chain-web-wallet/` (assoluto) |
| **Funziona in root** | ✅ Sì | ❌ No |
| **Funziona in /wallet/** | ✅ Sì | ❌ No |
| **Funziona in /lab/wdk/** | ✅ Sì | ❌ No |
| **Funziona in /wdk-multi-chain-web-wallet/** | ✅ Sì | ✅ Sì |
| **Richiede config server** | ❌ No | ✅ Sì (path specifico) |
| **Distribuzione ZIP** | ✅ Ideale | ❌ Non portabile |
| **GitHub Pages** | ⚠️ Funziona ma subpath non ottimale | ✅ Ottimizzato |
| **Electron** | ✅ Funziona | ❌ Path assoluto non adatto |

---

## 💡 Best Practices

### ✅ DO - Usa Build Portabile per:
- Deploy su Aruba hosting
- Distribuzione pacchetti ZIP
- Server custom o Apache
- Testing locale in sottocartelle
- Electron desktop app

### ❌ DON'T - NON usare Build GitHub Pages per:
- Upload manuale su server
- Cartelle diverse da `/wdk-multi-chain-web-wallet/`
- Distribuzione ZIP
- Electron

### ⚡ Automation
GitHub Actions **usa automaticamente** `build:github` per deploy su GitHub Pages.

---

## 🐛 Troubleshooting

### Problema: "Assets non caricano in /lab/wdk/"
**Causa:** Build con path assoluti `/wdk-multi-chain-web-wallet/`  
**Soluzione:** Rebuild con `npm run build:portable`

### Problema: "GitHub Pages mostra 404"
**Causa:** Workflow usa build portabile invece di build:github  
**Soluzione:** Verificare che CI workflow usi `npm run build:github`

### Problema: "DevTools mostra 404 per /assets/..."
**Causa:** Path assoluti con base path errato  
**Soluzione:** 
1. Verifica: `Get-Content dist\index.html | Select-String 'src='`
2. Se vedi `/wdk-multi-chain-web-wallet/` ma sei in `/lab/` → rebuild con `build:portable`

---

## 📚 Risorse

- [Vite Base Option Docs](https://vitejs.dev/config/shared-options.html#base)
- [Deployment Guide](./DEPLOY_ARUBA.md)
- [CI/CD Workflows](./.github/WORKFLOWS.md)

---

**🎯 Regola d'oro:** Quando in dubbio, usa `build:portable` - funziona ovunque!
