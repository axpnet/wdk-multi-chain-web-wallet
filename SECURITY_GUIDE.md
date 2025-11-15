# 🔐 Guida alla Sicurezza delle Seed - WDK Wallet

## Problema: Come memorizzare le seed in modo sicuro?

Quando usi un wallet, devi inserire la seed ogni volta che vuoi accedere. Esistono diverse soluzioni, ognuna con pro e contro in termini di **sicurezza** e **comodità**.

---

## ✅ Soluzione Implementata: Storage Locale Criptato

### Come funziona

1. **Scegli una password forte** (minimo 8 caratteri, meglio 16+)
2. La seed viene criptata usando **AES-256-GCM** con **PBKDF2** (100.000 iterazioni)
3. La seed criptata viene salvata in `localStorage` del browser
4. All'apertura del wallet, inserisci la password per decriptare la seed

### Sicurezza

- ✅ **AES-256-GCM**: standard militare, stesso usato da banche e governi
- ✅ **PBKDF2 con 100k iterazioni**: rende praticamente impossibile il brute-force
- ✅ **Salt casuale**: ogni seed criptata è unica anche con stessa password
- ✅ **Nessuna password salvata**: solo la seed criptata è memorizzata
- ⚠️ **Vulnerabile se**: qualcuno ha accesso fisico al tuo PC E conosce la tua password
- ⚠️ **Backup importante**: se dimentichi la password, perdi l'accesso (usa backup offline!)

### Pro e Contro

**Pro:**
- Non devi riscrivere la seed ogni volta
- Password è più facile da ricordare di 12-24 parole
- Sicurezza molto alta se password è forte
- Funziona offline, nessun server esterno

**Contro:**
- Devi ricordare/salvare la password
- Se cancelli i dati del browser, perdi la seed criptata
- Vulnerabile se il PC viene compromesso da malware con keylogger

---

## 🔒 Altre Opzioni di Sicurezza (non implementate)

### 1. Hardware Wallet (Massima Sicurezza)

**Dispositivi:** Ledger, Trezor, Keystone

**Pro:**
- Seed mai esposta al computer
- Protezione da malware e keylogger
- Backup fisico sicuro
- Standard dell'industria

**Contro:**
- Costo: €50-200+
- Devi portare il dispositivo con te
- Richiede integrazione hardware (non sempre supportato in browser)

**Raccomandazione:** ⭐⭐⭐⭐⭐ Se gestisci importi significativi (>€1000)

---

### 2. Browser Extension Wallet (Metamask, Phantom, etc.)

**Pro:**
- UX ottimizzata per crypto
- Seed gestita dall'estensione
- Sicurezza delegata a team specializzato
- Supporto multi-chain

**Contro:**
- Devi fidarti dell'estensione
- Rischio phishing se installi estensioni fake
- Ancora vulnerabile se PC compromesso

**Raccomandazione:** ⭐⭐⭐⭐ Buona per uso quotidiano, non per storage a lungo termine

---

### 3. Cloud Encrypted Storage (Google Drive, iCloud con crittografia)

**Come funziona:**
- Cripti la seed localmente
- Carichi il file criptato su cloud
- Scarichi e decripti quando serve

**Pro:**
- Backup automatico
- Accessibile da più dispositivi
- Non perdi la seed se cancelli browser

**Contro:**
- Rischio se account cloud viene compromesso
- Devi gestire password e backup
- Dipendenza da servizio cloud

**Raccomandazione:** ⭐⭐⭐ OK come backup secondario

---

### 4. Biometric Authentication (Face ID / Touch ID)

**Pro:**
- Massima comodità
- Password non necessaria
- Difficile da rubare

**Contro:**
- Supporto browser limitato (Web Authentication API)
- Rischio se biometria viene compromessa
- Difficile implementare fallback sicuro

**Raccomandazione:** ⭐⭐⭐ Promettente, ma supporto ancora limitato

---

### 5. Paper Wallet (Offline puro)

**Pro:**
- Massima sicurezza da attacchi digitali
- Nessun rischio malware
- Backup fisico permanente

**Contro:**
- Devi scrivere/copiare seed ogni volta
- Rischio errore di battitura
- Scomodo per uso frequente
- Vulnerabile a danni fisici (fuoco, acqua, perdita)

**Raccomandazione:** ⭐⭐⭐⭐ Eccellente per cold storage, non per uso quotidiano

---

## 🎯 Strategia Consigliata: Multi-Layer Security

Per massimizzare sicurezza E comodità:

### Setup Ideale

1. **Generazione seed**: Crea seed in ambiente sicuro (PC pulito, offline se possibile)

2. **Backup primario**: Scrivi seed su carta, mettila in cassaforte/posto sicuro
   - Considera metallo inciso per resistenza a fuoco/acqua
   - Opzionale: dividi in parti (Shamir Secret Sharing)

3. **Uso quotidiano**:
   - **Piccoli importi (<€500)**: Storage locale criptato (nostra soluzione)
   - **Medi importi (€500-5000)**: Browser extension + storage locale come backup
   - **Grandi importi (>€5000)**: Hardware wallet obbligatorio

4. **Password management**: Usa un password manager (1Password, Bitwarden) per la password di decriptazione
   - La password del wallet va nel password manager
   - Il password manager ha la sua master password (che NON salvi da nessuna parte, la memorizzi)

---

## 🚨 Cosa NON fare MAI

❌ **NON salvare la seed in chiaro** (file .txt, note, email)
❌ **NON fare screenshot della seed**
❌ **NON condividere la seed con nessuno** (nemmeno "supporto tecnico")
❌ **NON usare password deboli** (123456, password, nome+anno)
❌ **NON salvare seed su servizi cloud non criptati** (Dropbox, Google Docs in chiaro)
❌ **NON usare la stessa password per wallet e altri servizi**

---

## 💡 Best Practices

✅ Usa password manager professionale
✅ Abilita 2FA dove possibile
✅ Mantieni software/OS aggiornato
✅ Usa antivirus/anti-malware
✅ Verifica sempre gli URL (anti-phishing)
✅ Testa il recovery PRIMA di depositare fondi
✅ Considera assicurazione crypto per importi molto alti
✅ Backup multipli in luoghi fisici diversi

---

## 📊 Comparazione Rapida

| Metodo | Sicurezza | Comodità | Costo | Raccomandato per |
|--------|-----------|----------|-------|------------------|
| **Storage Locale Criptato** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis | Uso quotidiano, piccoli importi |
| **Hardware Wallet** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | €€€ | Storage a lungo termine, grandi importi |
| **Browser Extension** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis | Uso frequente, medi importi |
| **Paper Wallet** | ⭐⭐⭐⭐⭐ | ⭐ | Gratis | Cold storage, backup |
| **Cloud Encrypted** | ⭐⭐⭐ | ⭐⭐⭐⭐ | €/Gratis | Backup secondario |

---

## 🔧 Come usare il Sistema Implementato (Multi‑Wallet)

### Salvataggio Seed

1. Wizard → Step 1 (Setup) imposta nome e password del wallet
2. Step 2 (Genera): copia/scrivi la seed su carta (backup offline)
3. Clicca "💾 Salva Seed (Sicuro)" e conferma
4. Alla fine di Step 4 clicca "🚀 Avvia il Wallet": la seed viene salvata criptata nel wallet appena creato

### Accesso/Unlock

1. All'avvio, scegli un wallet dall'elenco
2. Inserisci la password → seed decriptata in memoria solo per la sessione
3. Il pannello si apre e puoi operare

### Cambio Password

1. Pannello → "🔐 Sicurezza"
2. "� Cambia Password" → inserisci password attuale e nuova (min 8)
3. La seed viene re‑crittata e salvata per il wallet corrente

### Backup/Restore

1. Pannello → "🔐 Sicurezza" → sezione Backup
2. Esporta: scarica file `.wdk` con seed criptata del wallet attivo
3. Importa: scegli file `.wdk` e sovrascrivi i dati del wallet attivo
   - Nota: la password necessaria resta quella con cui è stato creato il backup

### Rimozione/Reset

Usa "🔄 Nuovo Wallet" per avviare il wizard e creare un wallet aggiuntivo. Per rimuovere un wallet specifico puoi implementare (o chiedere) la funzione di eliminazione sicura; al momento i wallet sono memorizzati in `localStorage` sotto la chiave `wdk_wallets`.

---

## 🆘 Scenari di Emergenza

### Ho dimenticato la password
- **Soluzione**: Usa il backup cartaceo della seed
- Inserisci manualmente la seed come "seed manuale"
- Re-imposta una nuova password

### Ho perso il backup cartaceo ma ricordo la password
- Carica seed con password
- SUBITO crea nuovo backup cartaceo
- Considera metallo inciso per backup permanente

### Ho perso sia password che backup cartaceo
- ❌ **Impossibile recuperare**
- Questo è il motivo per cui il backup offline è CRITICO

### Temo che il mio PC sia compromesso
1. **STOP**: Non usare il wallet da quel PC
2. Usa backup cartaceo su PC pulito/nuovo
3. Crea NUOVO wallet con nuova seed
4. Trasferisci fondi al nuovo wallet
5. Considera il vecchio wallet compromesso

---

## 📚 Risorse Aggiuntive

- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Ledger Academy - Crypto Security](https://www.ledger.com/academy)

---

**Ricorda:** La sicurezza è un processo, non un prodotto. Nessun sistema è sicuro al 100%, ma seguendo queste best practices minimizzi drasticamente i rischi.
