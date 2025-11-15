# 🚀 Quick Start Guide - Wallet MultiChain

## Avvio Rapido

### 1. Installa Dipendenze (già fatto ✅)
```bash
npm install
```

### 2. Avvia Dev Server
```bash
npm run dev
```
Apri browser su: **http://localhost:3000**

---

## 🎯 Primo Utilizzo – Multi‑Wallet + Sicurezza

All'avvio, se esistono wallet salvati, vedi la schermata di login: scegli il wallet e inserisci la password. Per crearne uno nuovo usa il bottone **"Nuovo Wallet"**.

### Step 1: Setup Wallet
1. Inserisci nome wallet (es. Personale, Trading, Risparmi)
2. Scegli password forte (minimo 8 caratteri) e conferma

### Step 2: Genera Seed
1. Clicca **"Genera seed"**
2. IMPORTANTE: copia le 12 parole su carta/offline
3. Clicca **"💾 Salva Seed (Sicuro)"**
4. Conferma di averla salvata in modo sicuro

### Step 3: Verifica Seed
1. Incolla le parole
2. Il badge live diventa verde “Seed corretta”
3. Clicca **"Verifica seed"**

### Step 4: Inizializza Wallet
1. Seleziona blockchain (es. Ethereum, Solana)
2. Clicca **"Inizializza"**
3. Vedi la tabella con indirizzi e bilanci
4. Clicca **"� Avvia il Wallet"**: la seed viene salvata criptata e si apre il pannello

### Step 5: Usa il Wallet
1. Seleziona la chain dal dropdown
2. Usa 📤 Send o 📥 Receive
3. In testa trovi il selettore valuta (EUR/USD) e il controvalore sotto al saldo

Nel pannello:
- 🔐 **Sicurezza**: cambio password, export/import backup, auto‑lock
- 🔄 **Nuovo Wallet**: riapre il wizard per creare un altro wallet

---

## 📋 Comandi Utili

```bash
# Sviluppo
npm run dev          # Avvia dev server (porta 3000)

# Build
npm run build        # Build produzione
npm run preview      # Testa build locale

# Code Quality
npm run lint         # Controlla errori ESLint
npm run format       # Formatta codice con Prettier

# Pulizia
npm run clean        # Rimuovi cache Vite
```

---

## 🔑 Funzionalità Principali

### Ricevi Fondi
1. Clicca 📥 **Receive**
2. Seleziona chain
3. Clicca **"Mostra QR"**
4. Scansiona QR o copia indirizzo

### Invia Fondi (⚠️ Usa Testnet!)
1. Clicca 📤 **Send**
2. Seleziona chain o usa quella attiva
3. Inserisci destinatario e importo
4. Conferma

La label dell'unità gas nel modal segue la chain (ETH, BNB, POL, …).

---

## 🎨 Tema

Bottoni in alto:
- **Auto**: segue sistema
- **Light**: tema chiaro
- **Dark**: tema scuro

---

## 🛠️ Debug Console

```javascript
// Versione app
window.WDK_DEBUG.version

// Chains disponibili
window.WDK_DEBUG.chains

// Reset completo (attenzione!)
window.WDK_DEBUG.reset()

// Stato wallet
window.walletState
window._walletResults
```

---

## 🌐 Blockchain Supportate

✅ **Ethereum** — ETH  
✅ **Polygon** — POL  
✅ **BSC** — BNB  
✅ **Solana** — SOL  
✅ **TON** — TON  
✅ **Litecoin** — LTC  
✅ **Tron** — TRX  
⚠️ **Bitcoin** — BTC (limitazioni in browser)

---

## ⚠️ Sicurezza (per‑wallet)

- Ogni wallet ha la sua password (AES‑256‑GCM + PBKDF2 100k)
- Usa **Sicurezza** per cambiare password, esportare/importare backup e impostare **auto‑lock**
- Tieni sempre un backup cartaceo della seed

---

## 🐛 Problemi Comuni

### “Errore RPC” o saldo 0
- Gli RPC pubblici possono avere downtime; ricarica o configura un RPC privato in `config.js`

### “Seed non valida”
- Controlla ordine e spazi; devono essere 12 parole esatte

### Build lento
- Normale al primo build (cache Vite). Usa `npm run clean` se necessario

---

## 📚 File Importanti

| File | Descrizione |
|------|-------------|
| `main.js` | Entry point applicazione |
| `config.js` | Configurazione chains |
| `vite.config.js` | Build configuration |
| `modules/wizard.js` | Wizard 4 step (multi‑wallet) |
| `modules/wallet_ui.js` | Pannello wallet e modali |
| `modules/secure_storage.js` | Crittografia/auto‑lock helpers |
| `modules/wallet_manager.js` | Gestione multi‑wallet (storage) |
| `modules/transactions.js` | Send/Receive |
| `modules/price_service.js` | Prezzi fiat con cache |
| `chains/*.js` | Implementazioni blockchain |

---

## 🚀 Deploy Produzione

### Build
```bash
npm run build
```

### Deploy su Vercel/Netlify
1. Framework preset: **Vite**
2. Build command: `npm run build`
3. Output directory: `dist`

### Deploy su GitHub Pages
```bash
# Aggiungi in vite.config.js:
# base: '/nome-repo/'

npm run build
# Carica cartella dist/ su gh-pages branch
```

---

## 💡 Tips

1. Seed 24 parole > 12 parole (più sicurezza)
2. Multi‑account: modifica derivation path se necessario
3. RPC custom: Infura/Alchemy ecc. per affidabilità
4. Ticker Polygon = **POL**; fiat EUR/USD selezionabile in header

---

## 📞 Aiuto

Consulta anche:
1. `SECURITY_GUIDE.md`
2. `ADVANCED_FEATURES.md`
3. `REVIEW.md`

**Buon divertimento con WDK Wallet! 💼✨**
