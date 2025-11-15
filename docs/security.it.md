La sicurezza dei tuoi fondi è la **priorità assoluta**. Questa guida ti insegna come proteggere il tuo wallet e gestire le criptovalute in modo sicuro.

## 📋 Indice

- [Livelli di Sicurezza](#livelli-di-sicurezza)
- [Seed Phrase](#seed-phrase)
- [Password](#password)
- [Storage Locale](#storage-locale)
- [Best Practices](#best-practices)
- [Scenari di Rischio](#scenari-di-rischio)

---

## ⭐ Livelli di Sicurezza

WDK Wallet implementa **multiple layer di sicurezza** per proteggere i tuoi asset:

### **★★★★★ Crittografia**
- **AES-256** per seed phrase e chiavi private
- **PBKDF2** con 100.000 iterazioni per key derivation
- **Nessun dato in chiaro** salvato su disco

### **★★★★☆ Isolation**
- Storage **completamente locale** (niente cloud)
- **Nessun server** di terze parti
- Dati **isolati per dominio** (browser sandbox)

### **★★★☆☆ Auto-lock**
- Blocco automatico dopo **inattività**
- Richiesta password per operazioni sensibili
- Timeout configurabile

### **★★☆☆☆ Backup**
- Seed phrase **salvata dall'utente** offline
- Nessun backup automatico cloud
- Responsabilità utente per recovery

---

## 🔑 Seed Phrase

### **Cos'è?**
La **seed phrase** (o mnemonic) è una sequenza di 12 parole che rappresenta la chiave master del tuo wallet. Da questa vengono derivati tutti gli indirizzi per tutte le blockchain.

### **Importanza Critica**
- 🔴 **Con la seed, hai accesso TOTALE** al wallet
- 🔴 **Persa la seed = Fondi persi DEFINITIVAMENTE**
- 🔴 **Se qualcuno la ottiene = Furto immediato**

### **Come Proteggerla**

#### ✅ **DO - Fai Così:**
1. **Scrivi su carta** (a mano, leggibile)
2. Conserva in **luoghi fisici sicuri multipli**:
   - Cassaforte in casa
   - Cassetta di sicurezza in banca
   - Da persona fidata (separata in 2 parti)
3. **Incidi su metallo** per protezione da fuoco/acqua
4. **Non digitalizzare mai** (no foto, no cloud, no email)
5. Verifica periodicamente che sia **ancora leggibile**

#### ❌ **DON'T - Non Fare Mai:**
1. ❌ Salvare su computer, smartphone, tablet
2. ❌ Fotografare con cellulare
3. ❌ Inviare via email, WhatsApp, Telegram
4. ❌ Salvare su cloud (Google Drive, Dropbox, iCloud)
5. ❌ Condividere con chiunque (nemmeno "supporto tecnico")
6. ❌ Digitare su siti web sospetti

### **Seed Compromise**
Se sospetti che la tua seed sia stata compromessa:
1. 🚨 **Crea IMMEDIATAMENTE un nuovo wallet**
2. 🚨 **Trasferisci TUTTI i fondi** al nuovo wallet
3. 🚨 **Abbandona il vecchio wallet**

---

## 🔐 Password

### **Scopo**
La password **cripta la seed phrase** prima di salvarla localmente nel browser. Senza password, i dati salvati sono inutilizzabili.

### **Requisiti Minimi**
- Minimo **12 caratteri**
- Mix di maiuscole, minuscole, numeri, simboli
- **Non riutilizzare** password di altri servizi
- **Non usare** parole del dizionario

### **Password Forte - Esempi**
✅ `My$ecur3W@ll3t2025!`  
✅ `Tr4ding&S@v1ngs#PWA`  
❌ `password123`  
❌ `bitcoin2025`  

### **Password Manager**
- ✅ Usa un **password manager** (Bitwarden, 1Password, KeePass)
- ✅ Abilita **2FA** sul password manager
- ✅ Fai backup regolari del database del password manager

### **Password Dimenticata?**
- Se dimentichi la password → **usa la seed phrase** per reimportare
- La seed è il **backup universale** del wallet
- Password cambiabile in qualsiasi momento con la seed

---

## 💾 Storage Locale

### **Come Funziona**
WDK Wallet usa:
- **localStorage** per metadata (nome wallet, ultimo accesso)
- **indexedDB** per dati cifrati (seed, chiavi private)

### **Sicurezza Browser**
- Dati **isolati per origin** (dominio + protocollo + porta)
- **Sandbox** del browser impedisce accesso ad altre app
- **HTTPS** obbligatorio per sicurezza trasporto

### **Cosa è Salvato**
- ✅ Seed phrase **CIFRATA** con AES-256
- ✅ Nome wallet (metadata pubblico)
- ✅ Timestamp ultimo accesso
- ❌ **MAI** salvata seed in chiaro
- ❌ **MAI** salvata password

### **Rischi**
- 🔴 **Malware** sul PC può leggere localStorage/indexedDB
- 🔴 **Keylogger** può catturare la password
- 🔴 **Clear browser data** cancella il wallet (serve seed per recupero)

### **Mitigazione**
- ✅ Usa **antivirus aggiornato**
- ✅ Evita **estensioni browser sospette**
- ✅ Fai backup della **seed phrase**
- ✅ Non usare su **PC pubblici** o non fidati

---

## ✅ Best Practices

### **🔒 Sicurezza Operativa**

#### **Generale**
- ✅ Usa **dispositivo personale fidato**
- ✅ Mantieni **OS aggiornato** (Windows/Mac/Linux)
- ✅ Usa **browser aggiornato** (Chrome, Brave, Firefox)
- ✅ Abilita **firewall**
- ✅ Usa **antivirus attivo**

#### **Network**
- ✅ Usa **rete WiFi privata** (casa)
- ❌ Evita **WiFi pubblici** (bar, aeroporti)
- ✅ Usa **VPN** se necessario
- ❌ Mai transazioni su reti non fidate

#### **Transazioni**
- ✅ **Verifica sempre** l'indirizzo destinatario (copia intero, non digitare)
- ✅ Inizia con **piccoli importi** per testare
- ✅ Controlla **fee di rete** prima di confermare
- ✅ Salva **hash transazione** per tracking

### **💼 Gestione Multi-Wallet**

- ✅ Wallet **separati** per scopi diversi:
  - **Cold wallet**: Risparmio a lungo termine (raramente usato)
  - **Hot wallet**: Operazioni quotidiane (importo limitato)
  - **Trading wallet**: Scambi su exchange
- ✅ Mai tenere **tutti i fondi** in un unico wallet
- ✅ Usa wallet **hardware** (Ledger, Trezor) per grandi somme

### **🔄 Backup & Recovery**

- ✅ Backup della **seed phrase** in almeno **2 luoghi fisici**
- ✅ Test di **recovery** periodico (importa in wallet temporaneo)
- ✅ Piano di **successione** (come famiglia accede in caso emergenza)
- ✅ Documentazione chiara (non tecnica) per eredi

---

## ⚠️ Scenari di Rischio

### **1. Phishing**

**Attacco:**
- Email/SMS fake che sembra legittimo
- Link a sito clonato che chiede seed phrase
- "Supporto tecnico" che richiede accesso

**Difesa:**
- ✅ Verifica sempre **URL** del sito (https://axpnet.github.io/...)
- ✅ Nessun supporto **mai** chiede la seed
- ✅ Non cliccare link sospetti in email
- ✅ Digita URL manualmente nel browser

### **2. Malware**

**Attacco:**
- Keylogger cattura password
- Screen recorder registra seed durante setup
- Clipboard hijacker modifica indirizzo copiato

**Difesa:**
- ✅ Antivirus aggiornato sempre attivo
- ✅ Non scaricare software da fonti non verificate
- ✅ Scansione periodica sistema
- ✅ Verifica **sempre** indirizzo incollato prima di inviare

### **3. Social Engineering**

**Attacco:**
- "Supporto tecnico" su Telegram/Discord
- "Giveaway" che chiede seed per "verificare wallet"
- Urgenza falsa ("il tuo wallet sta per essere bloccato")

**Difesa:**
- ✅ **Mai condividere** la seed con NESSUNO
- ✅ Nessun "supporto" legittimo chiede la seed
- ✅ Non fidarsi di messaggi non richiesti
- ✅ Verifica identità su canali ufficiali

### **4. Physical Theft**

**Attacco:**
- Furto dispositivo con wallet sbloccato
- Accesso fisico a seed phrase cartacea

**Difesa:**
- ✅ Blocco automatico wallet dopo inattività
- ✅ Seed in **cassaforte** o **cassetta sicurezza**
- ✅ Crittografia completa del disco (BitLocker, FileVault)
- ✅ Password di accesso al dispositivo

### **5. Browser Extension Compromise**

**Attacco:**
- Estensione malware legge localStorage
- Fake update di estensione legittima

**Difesa:**
- ✅ Installa solo estensioni da **store ufficiali**
- ✅ Verifica **developer** e **recensioni**
- ✅ Disabilita estensioni non necessarie
- ✅ Usa **profili browser separati** (uno per crypto)

---

## 🚨 In Caso di Emergenza

### **Wallet Compromesso**

1. **STOP** - Non toccare il wallet compromesso
2. **CREA** nuovo wallet con nuova seed
3. **TRASFERISCI** tutti i fondi al nuovo wallet (priorità massima)
4. **ABBANDONA** il vecchio wallet
5. **ANALIZZA** come è avvenuto il compromise
6. **PREVIENI** cambiando pratiche di sicurezza

### **Seed Persa**

- 🔴 **Fondi irrecuperabili** se:
  - Non hai backup seed
  - Non hai accesso al wallet attivo
- 🟡 **Fondi recuperabili** se:
  - Hai backup seed in altro luogo
  - Wallet ancora accessibile (trasferisci immediatamente)

### **Password Dimenticata**

- 🟢 **Recuperabile** con seed phrase:
  1. Click "Importa Wallet"
  2. Inserisci seed phrase
  3. Scegli nuova password
  4. ✅ Wallet recuperato

---

## 📚 Risorse Aggiuntive

### **Approfondimenti**
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 HD Wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [OWASP Crypto Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

### **Tools di Verifica**
- [Have I Been Pwned](https://haveibeenpwned.com/) - Verifica email/password
- [VirusTotal](https://www.virustotal.com/) - Scansione file/URL
- [Blockchain Explorers](https://etherscan.io/) - Verifica transazioni

### **Community**
- 💬 [GitHub Discussions](https://github.com/axpnet/wdk-multi-chain-web-wallet/discussions)
- 🐛 [Report Security Issues](mailto:info@axpdev.it)

---

## ⚖️ Disclaimer

**WDK Wallet è software open source fornito "as-is" senza garanzie.**

- ✅ Tu sei **l'unico responsabile** della sicurezza dei tuoi fondi
- ✅ Gli sviluppatori **non hanno accesso** alle tue seed/password
- ✅ Fai **sempre backup** della seed phrase
- ✅ Usa **importi piccoli** per test iniziali
- ✅ Leggi la **licenza** del software

---

**🔐 La sicurezza è un processo continuo, non un evento singolo.**

Rimani informato, aggiorna le tue pratiche, proteggi i tuoi asset.

---

**© 2025 axpdev** — Sviluppo sicuro per il Web3
