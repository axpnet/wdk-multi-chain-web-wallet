# 🚀 Guida Introduttiva - WDK Wallet

Benvenuto in **WDK Wallet**, il tuo wallet multi-chain professionale per gestire criptovalute su diverse blockchain.

## 📋 Indice

- [Primo Avvio](#primo-avvio)
- [Creazione Wallet](#creazione-wallet)
- [Importazione Wallet Esistente](#importazione-wallet-esistente)
- [Gestione Multi-Wallet](#gestione-multi-wallet)
- [Operazioni Base](#operazioni-base)

---

## 🎯 Primo Avvio

Al primo accesso, WDK Wallet ti guiderà attraverso un setup guidato in 4 step:

### **Step 1: Setup**
- Scegli un **nome** per il tuo wallet (es. "Wallet Personale", "Trading", "Risparmi")
- Imposta una **password sicura** per proteggere la tua seed phrase
- La password cripta i dati prima di salvarli localmente

### **Step 2: Seed Phrase**
- Il sistema genera una **seed phrase di 12 parole**
- Questa è la chiave master del tuo wallet
- ⚠️ **Salvala in un posto sicuro e offline!**
- Non condividerla mai con nessuno

### **Step 3: Verifica**
- Dovrai reinserire alcune parole della seed per confermare
- Questo assicura che tu l'abbia salvata correttamente

### **Step 4: Inizializzazione**
- Il wallet deriva automaticamente gli indirizzi per tutte le blockchain supportate
- Puoi iniziare subito a ricevere fondi!

---

## 💼 Creazione Wallet

### **Nuovo Wallet**
1. Clicca su **"Crea Nuovo Wallet"** dalla schermata iniziale
2. Inserisci nome e password
3. Salva la seed phrase generata (12 parole)
4. Verifica la seed phrase
5. ✅ Wallet pronto!

### **Caratteristiche**
- Seed phrase **BIP39** compatibile
- Derivazione **HD (Hierarchical Deterministic)**
- Standard **BIP44** per multi-chain
- Crittografia **AES-256** per storage locale

---

## 📥 Importazione Wallet Esistente

### **Da Seed Phrase**
1. Seleziona **"Importa Wallet"**
2. Inserisci la tua seed phrase esistente (12 o 24 parole)
3. Scegli nome e password
4. ✅ Wallet importato con tutti gli indirizzi derivati

### **Compatibilità**
WDK Wallet supporta seed phrase generate da:
- MetaMask
- Trust Wallet
- Ledger
- Trezor
- Altri wallet BIP39/BIP44 compatibili

---

## 🗂️ Gestione Multi-Wallet

### **Crea Più Wallet**
- Puoi avere **wallet multipli** nella stessa app
- Ogni wallet ha la sua seed phrase unica
- Utile per separare fondi (personale, business, trading)

### **Switch tra Wallet**
1. Clicca sul **nome del wallet** nella topbar
2. Seleziona il wallet desiderato
3. Inserisci la password del wallet selezionato

### **Sicurezza Multi-Wallet**
- Ogni wallet è **crittografato separatamente**
- Password indipendenti per ogni wallet
- Metadata minimo salvato (solo nome e timestamp)

---

## 🔧 Operazioni Base

### **📤 Inviare Criptovalute**

1. **Seleziona la blockchain**
   - Usa il selettore chain in alto a destra
   - Esempio: Ethereum, Polygon, BSC, Solana, ecc.

2. **Clicca "Invia"**
   - Si apre il picker per selezionare la chain (se non già selezionata)
   
3. **Compila il form**
   - **Indirizzo destinatario**: Incolla o scansiona QR
   - **Importo**: Inserisci l'ammontare da inviare
   - Il sistema calcola automaticamente le **fee** di rete

4. **Conferma e invia**
   - Verifica i dettagli
   - Conferma la transazione
   - Attendi la conferma sulla blockchain

### **📥 Ricevere Criptovalute**

1. **Clicca "Ricevi"**
   - Si apre il picker per selezionare la chain

2. **Scegli la blockchain**
   - Seleziona la chain su cui vuoi ricevere fondi

3. **Condividi l'indirizzo**
   - Mostra il **QR code** al mittente
   - Oppure **copia l'indirizzo** manualmente
   - L'indirizzo è specifico per la blockchain selezionata

4. **Attendi la transazione**
   - Il saldo si aggiorna automaticamente dopo la conferma

### **💱 Visualizzazione Multi-Chain**

- **Saldo principale**: Mostra il valore totale in valuta fiat
- **Selettore chain**: Switch rapido tra blockchain
- **Prezzi live**: Aggiornamento automatico da CoinGecko
- **Conversione fiat**: Supporto per EUR, USD, ecc.

---

## 🔒 Sicurezza

### **Best Practices**
- ✅ Usa una **password forte** (min. 12 caratteri)
- ✅ Salva la **seed phrase offline** (carta, metallo)
- ✅ **Non condividere** mai la seed con nessuno
- ✅ Abilita il **blocco automatico** dopo inattività
- ✅ Fai **backup regolari** della seed

### **Protezione dei Dati**
- Seed phrase **mai salvata** in chiaro
- Crittografia **AES-256** con PBKDF2
- Storage **locale** (niente server)
- **Nessun tracking** o analytics

### **Recupero**
- Se perdi la password → **usa la seed phrase**
- Se perdi la seed → **fondi irrecuperabili** ⚠️
- Conserva sempre la seed in **luoghi sicuri multipli**

---

## 🌐 Blockchain Supportate

- **Ethereum** (ETH)
- **Polygon** (MATIC)
- **Binance Smart Chain** (BNB)
- **Solana** (SOL)
- **Bitcoin** (BTC)
- **Litecoin** (LTC)
- **TON** (Telegram Open Network)
- **TRON** (TRX)

Ogni blockchain ha il suo indirizzo derivato dalla stessa seed phrase.

---

## 📱 PWA (Progressive Web App)

WDK Wallet è una PWA, il che significa:
- ✅ **Installabile** come app nativa
- ✅ **Funziona offline** (dopo prima visita)
- ✅ **Aggiornamenti automatici**
- ✅ **Nessun app store** richiesto

### Installazione
1. Apri il wallet nel browser
2. Clicca sull'icona **"Installa"** nella topbar
3. Conferma l'installazione
4. L'app apparirà nel menu start / home screen

---

## 🆘 Supporto

### Problemi Comuni

**"Non riesco ad accedere"**
- Verifica di aver inserito la password corretta
- Controlla che il nome wallet sia esatto
- Prova a reimportare usando la seed phrase

**"Saldo non aggiornato"**
- Controlla la connessione internet
- Verifica di aver selezionato la chain corretta
- Aggiorna la pagina (Ctrl+R)

**"Transazione bloccata"**
- Controlla le fee di rete (potrebbero essere insufficienti)
- Verifica lo stato su un block explorer
- Alcune chain richiedono più conferme

### Contatti
- 📧 Email: info@axpdev.it
- 🐛 Issues: [GitHub Issues](https://github.com/axpnet/wdk-multi-chain-web-wallet/issues)
- 📚 Docs: [Documentazione completa](https://github.com/axpnet/wdk-multi-chain-web-wallet/blob/main/docs/)

---

## 🎓 Prossimi Passi

1. ✅ Leggi la [Guida alla Sicurezza](./security.it.md)
2. ✅ Esplora le [Funzionalità Avanzate](../ADVANCED_FEATURES.md)
3. ✅ Contribuisci su [GitHub](https://github.com/axpnet/wdk-multi-chain-web-wallet)

---

**© 2025 axpdev** — Wallet multi-chain open source e sicuro
