# 🆕 Nuove Funzionalità di Sicurezza - WDK Wallet

## Panoramica

Abbiamo aggiunto funzionalità avanzate di sicurezza per proteggere meglio le tue seed e migliorare l'esperienza d'uso del wallet.

---

## 🔑 1. Cambio Password

### Cosa fa
Permette di cambiare la password di crittografia della seed salvata senza doverla re-inserire.

### Come usare

1. Apri il wallet
2. Click su **"🔐 Sicurezza"** (in basso nel pannello wallet)
3. Click su **"🔑 Cambia Password"**
4. Inserisci:
   - Password attuale
   - Nuova password (minimo 8 caratteri)
   - Conferma nuova password
5. Click **"Cambia Password"**

### Processo tecnico

```
1. Decripta seed con password vecchia
2. Cripta seed con password nuova
3. Salva nuova versione criptata
4. Elimina vecchia versione
```

### Sicurezza

- ✅ La seed non viene mai esposta in chiaro durante il cambio
- ✅ Se la password vecchia è errata, l'operazione fallisce
- ✅ La nuova password deve rispettare gli stessi requisiti (8+ caratteri)

### Casi d'uso

- Password compromessa
- Password troppo debole
- Condivisione dispositivo (cambia password periodicamente)
- Migrazione a password manager

---

## 💾 2. Export/Import Seed Criptata

### Cosa fa
Esporta la seed criptata come file `.wdk` per backup esterni o trasferimento su altri dispositivi.

### Export

1. Click **"🔐 Sicurezza"** → **"💾 Gestisci Backup"**
2. Click **"📥 Esporta Seed Criptata"**
3. Viene scaricato file: `wdk-wallet-backup-[timestamp].wdk`

**Cosa contiene il file:**
```json
{
  "version": "1.0",
  "type": "wdk-encrypted-seed",
  "exported": 1729900000000,
  "original": 1729800000000,
  "encrypted": "base64_encrypted_data..."
}
```

### Import

1. Click **"🔐 Sicurezza"** → **"💾 Gestisci Backup"**
2. Click **"Scegli file"** e seleziona file `.wdk`
3. Click **"📤 Importa Seed Criptata"**
4. La seed criptata viene caricata in localStorage

**Importante:**
- ⚠️ Serve comunque la password per decriptare
- ⚠️ L'import sovrascrive la seed attuale (se presente)
- ✅ Puoi usare lo stesso file su più dispositivi

### Sicurezza

- ✅ File contiene solo seed **criptata**
- ✅ Impossibile decriptare senza password
- ✅ Salt e IV unici per ogni export
- ⚠️ Proteggi il file: non caricarlo su servizi cloud pubblici non sicuri

### Casi d'uso

**Backup sicuro:**
- Salva `.wdk` su USB criptata
- Salva su cloud criptato (Google Drive con crittografia client-side)
- Stampa QR code del file per backup cartaceo

**Multi-dispositivo:**
- Esporta da PC
- Importa su laptop
- Stessa password funziona su entrambi

**Disaster recovery:**
- Se perdi localStorage (cancelli browser), reimporti il file
- Se dimentichi password ma hai backup cartaceo seed, ricominci da zero

---

## 🕐 3. Auto-Lock / Timeout

### Cosa fa
Blocca automaticamente il wallet dopo un periodo di inattività per proteggere da accessi non autorizzati.

### Configurazione

1. Click **"🔐 Sicurezza"**
2. Sezione **"Auto-Lock"**
3. Seleziona timeout:
   - Disabilitato
   - 5 minuti
   - 15 minuti (default)
   - 30 minuti
   - 1 ora

### Come funziona

**Tracciamento attività:**
- Movimento mouse
- Pressione tasti
- Scroll
- Touch (mobile)

**Al timeout:**
1. Pannello wallet nascosto
2. Overlay di blocco mostrato
3. Seed cachata cancellata dalla memoria
4. Timer resettato

**Per sbloccare:**
1. Inserisci password
2. Seed viene decriptata
3. Pannello wallet mostrato
4. Timer riavviato

### Lock manuale

Puoi bloccare il wallet manualmente:
- Click **"🔒 Blocca Ora"** nelle impostazioni sicurezza

### Sicurezza

- ✅ Seed non resta in memoria quando bloccato
- ✅ Overlay non rimovibile senza password
- ✅ Timer si resetta ad ogni attività
- ⚠️ Se chiudi/ricarichi pagina, devi re-autenticare

### Casi d'uso

- Lavoro in open space
- Dispositivo condiviso
- Pause caffè/pranzo
- Paranoia di sicurezza (buona cosa!)

---

## 📤 4. Fix Send Button - Chain Attiva

### Cosa fa
Quando hai una chain selezionata nel wallet, cliccando "Invia" si apre direttamente il form di invio per quella chain (non il picker).

### Prima (problema)

1. Selezioni "Polygon" nel dropdown
2. Click "Invia"
3. Mostra picker: "Quale chain?"
4. Devi ri-selezionare "Polygon"

### Dopo (fix)

1. Selezioni "Polygon" nel dropdown
2. Click "Invia"
3. Form di invio aperto direttamente per Polygon
4. Gas price e ticker già corretti

### Dettagli tecnici

```javascript
export function showSendPicker() {
  // Se esiste chain attiva, salta picker
  const activeChain = window._activeChain;
  const walletState = window.walletState || {};
  
  if (activeChain && walletState[activeChain]) {
    showSendForm(activeChain);
    return;
  }
  
  // Altrimenti mostra picker...
}
```

### UX migliorata

- ⚡ 1 click in meno
- ✅ Meno errori (chain già selezionata)
- ✅ Gas price già corretto per chain
- ✅ Ticker corretto (ETH, MATIC, BNB, etc.)

---

## 🎯 Workflow Completo Consigliato

### Setup iniziale

1. **Genera seed** (Step 1)
2. **Copia su carta** (backup offline)
3. **Salva seed criptata** (💾 pulsante verde)
4. **Export backup .wdk** (🔐 Sicurezza → Gestisci Backup)
5. **Salva .wdk su USB** o cloud criptato
6. **Configura auto-lock** (15 minuti raccomandato)

### Uso quotidiano

1. **Carica seed salvata** (🔓 pulsante verde)
2. **Wallet si apre** (auto-inizializzazione)
3. **Seleziona chain** nel dropdown
4. **Click Invia** → form aperto per quella chain
5. **Inattività >15min** → wallet si blocca
6. **Inserisci password** → sblocco

### Manutenzione periodica

**Ogni mese:**
- Verifica backup cartaceo leggibile
- Testa recovery da .wdk file

**Ogni 3 mesi:**
- Cambia password se usi dispositivo condiviso
- Re-export .wdk con nuova password

**Ogni 6 mesi:**
- Aggiorna backup su USB/cloud
- Verifica integrità file .wdk

---

## 🔒 Matrice Sicurezza vs Comodità

| Configurazione | Sicurezza | Comodità | Raccomandato per |
|----------------|-----------|----------|------------------|
| **Nessuna password salvata** | ⭐⭐⭐⭐⭐ | ⭐ | Paranoici, cold storage |
| **Password + Auto-lock 5min** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Lavoro pubblico, dispositivo condiviso |
| **Password + Auto-lock 15min** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Uso quotidiano (RACCOMANDATO)** |
| **Password + Auto-lock 1h** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Casa, dispositivo personale |
| **Password + No lock** | ⭐⭐ | ⭐⭐⭐⭐⭐ | Solo per test/sviluppo |

---

## 🆘 FAQ & Troubleshooting

### Ho dimenticato la password

**Soluzione:**
1. Usa backup cartaceo seed
2. Click "Inserisci seed manuale"
3. Incolla seed
4. Procedi con nuova password
5. Re-export .wdk con nuova password

### File .wdk non si importa

**Verifica:**
- File è valido JSON?
- Contiene campo `"type": "wdk-encrypted-seed"`?
- File non corrotto?

**Soluzione:**
1. Apri file con editor testo
2. Verifica formato JSON valido
3. Se corrotto, usa backup cartaceo

### Wallet si blocca troppo spesso

**Soluzione:**
1. Aumenta timeout (30min o 1h)
2. Disabilita auto-lock se necessario
3. Considera rischi sicurezza

### Cambio password fallisce

**Cause comuni:**
- Password vecchia errata
- Nuova password <8 caratteri
- File .wdk corrotto

**Soluzione:**
1. Verifica password vecchia
2. Riprova con password più lunga
3. Se persiste, usa recovery da backup

### Export .wdk non scarica

**Browser restrictions:**
- Alcuni browser bloccano download automatici
- Verifica permessi download

**Soluzione:**
1. Controlla console errori
2. Abilita download in impostazioni browser
3. Prova browser diverso

---

## 🔬 Dettagli Tecnici Avanzati

### Formato file .wdk

```typescript
interface WDKBackupFile {
  version: string;        // "1.0"
  type: string;          // "wdk-encrypted-seed"
  exported: number;      // Unix timestamp export
  original: number;      // Unix timestamp creazione originale
  encrypted: string;     // Base64(salt + iv + encrypted_data)
}
```

### Struttura encrypted data

```
[16 bytes salt][12 bytes IV][N bytes AES-GCM ciphertext]
```

### Parametri crittografici

```javascript
{
  algorithm: "AES-GCM",
  keyLength: 256,
  kdf: "PBKDF2",
  iterations: 100000,
  hash: "SHA-256",
  saltLength: 16,
  ivLength: 12
}
```

### Storage keys

```javascript
localStorage.setItem('wdk_wallet_encrypted_seed', encrypted);
localStorage.setItem('wdk_wallet_metadata', metadata);
```

### Auto-lock events

```javascript
const events = [
  'mousedown',
  'keydown', 
  'scroll',
  'touchstart'
];
```

---

## 📊 Test Checklist

### Cambio Password

- [ ] Cambio con password corretta funziona
- [ ] Cambio con password errata fallisce
- [ ] Nuova password <8 char viene rifiutata
- [ ] Password non corrispondenti vengono rifiutate
- [ ] Dopo cambio, caricamento con vecchia password fallisce
- [ ] Dopo cambio, caricamento con nuova password funziona

### Export/Import

- [ ] Export crea file .wdk
- [ ] File contiene tutti campi richiesti
- [ ] Import file valido funziona
- [ ] Import file corrotto fallisce
- [ ] Import sovrascrive seed esistente
- [ ] Dopo import, password originale funziona

### Auto-Lock

- [ ] Timeout default è 15 minuti
- [ ] Cambio timeout salva correttamente
- [ ] Lock manuale funziona
- [ ] Sblocco con password corretta funziona
- [ ] Sblocco con password errata fallisce
- [ ] Attività utente resetta timer
- [ ] Dopo lock, seed non in memoria

### Send Button

- [ ] Senza chain selezionata: mostra picker
- [ ] Con chain selezionata: apre form diretto
- [ ] Gas price corretto per chain
- [ ] Ticker corretto per chain
- [ ] Cambio chain aggiorna pulsante

---

## 🚀 Roadmap Future

### In considerazione

- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] Multi-signature support
- [ ] Timeout progressivo (aumenta dopo tentativi falliti)
- [ ] Session management multi-tab
- [ ] Encrypted cloud sync (E2E)
- [ ] Recovery kit generator (PDF con istruzioni)
- [ ] Shamir Secret Sharing integration
- [ ] Hardware wallet integration (Ledger/Trezor)

---

**Nota:** Tutte le funzionalità sono state testate su Chrome/Edge/Firefox. Safari può avere limitazioni su Web Crypto API.
