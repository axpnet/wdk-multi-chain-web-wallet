# 🚀 Deploy su Aruba - WDK Wallet

Guida completa per caricare il wallet su **qualsiasi cartella** del tuo hosting Aruba.

## ✨ Portabilità Totale

✅ Il wallet funziona in **qualsiasi cartella o sottocartella**:
- `www.axpdev.it/` (root)
- `www.axpdev.it/wallet/`
- `www.axpdev.it/apps/crypto/wdk/`
- Qualsiasi path, senza bisogno di ricompilare!

Il sistema rileva automaticamente il percorso a runtime.

## 📦 Contenuto del pacchetto

La cartella `dist/` contiene:
- ✅ Tutti i file HTML, CSS, JS ottimizzati e minificati
- ✅ `.htaccess` configurato per Apache (compatibile Aruba)
- ✅ Manifest PWA e Service Worker
- ✅ **Path relativi** che funzionano in qualsiasi cartella

### 🛠️ Build del pacchetto

Per creare il pacchetto portabile:
```bash
npm run build:portable
```

Questo genera `dist/` con path relativi (`./assets/...`) invece di assoluti.

---

## 🔐 Accesso FTP Aruba

### Credenziali (da pannello Aruba):
- **Host FTP:** ftp.axpdev.it (o IP fornito da Aruba)
- **Username:** (username del tuo account Aruba)
- **Password:** (password FTP)
- **Porta:** 21 (standard) o 22 (SFTP se disponibile)

---

## 📤 Metodo 1: Upload via FileZilla (Consigliato)

### 1. Scarica FileZilla
Se non ce l'hai: https://filezilla-project.org/download.php?type=client

### 2. Connettiti al server
1. Apri FileZilla
2. In alto inserisci:
   - **Host:** ftp.axpdev.it
   - **Nome utente:** (tuo username)
   - **Password:** (tua password)
   - **Porta:** 21
3. Clicca **Connessione rapida**

### 3. Naviga alla cartella corretta
Nel pannello remoto (destra), naviga dove vuoi installare il wallet:

**Esempi:**
```
/www.axpdev.it/                              # Root del sito
/www.axpdev.it/wallet/                       # Sottocartella wallet
/www.axpdev.it/apps/crypto/                  # Qualsiasi percorso
```

**Crea la cartella desiderata** (se non esiste):
1. Tasto destro → **Crea cartella** → Nome: `wallet` (o altro nome)

### 4. Carica tutti i file
1. Nel pannello locale (sinistra), vai in:
   ```
   C:\Users\axpne\AXP-APPS\wallet-multichain\dist\
   ```

2. **Seleziona TUTTI i file** dentro `dist/`:
   - index.html
   - assets/ (cartella)
   - .htaccess
   - manifest-*.webmanifest
   - sw.js (se presente)

3. **Trascina** tutto nel pannello remoto (nella cartella desiderata, es. `/www.axpdev.it/wallet/`)

4. Attendi il completamento del trasferimento (~ 2-5 minuti)

### 5. Verifica permessi (importante!)
1. Nel pannello remoto, seleziona tutti i file
2. Tasto destro → **Permessi file**
3. Imposta:
   - File: `644` (rw-r--r--)
   - Cartelle: `755` (rwxr-xr-x)
4. Spunta **Ricorsivo** per applicare a sottocartelle
5. Clicca **OK**

---

## 📤 Metodo 2: Upload via Pannello Aruba

### 1. Accedi al pannello
1. Vai su: https://admin.aruba.it
2. Login con le tue credenziali
3. Vai in **File Manager Web** o **Gestione File**

### 2. Naviga e crea cartella
1. Vai in `/www.axpdev.it/`
2. Crea la cartella desiderata, es. `wallet` (o il nome che preferisci)
3. Entra nella cartella

### 3. Carica ZIP (più veloce)
1. Prima, crea uno ZIP di tutto il contenuto di `dist/` (già fatto):
   - ZIP pronto: `wdk-wallet-portable.zip` sul Desktop

2. Nel pannello Aruba, clicca **Carica file**
3. Seleziona `wdk-wallet-portable.zip`
4. Dopo l'upload, **Estrai** lo ZIP direttamente sul server
5. Elimina il file ZIP dal server (facoltativo, per pulizia)

---

## ✅ Verifica Deploy

### 1. Testa l'URL
Apri il browser e vai dove hai caricato il wallet:

**Esempi:**
```
https://www.axpdev.it/                    # Se caricato in root
https://www.axpdev.it/wallet/             # Se in sottocartella wallet
https://www.axpdev.it/wdk-multi-chain-web-wallet/  # O qualsiasi altro path
```

(o `http://` se non hai SSL)

### 2. Checklist di controllo

✅ **Homepage carica correttamente**
- Vedi il logo briefcase e il titolo "WDK Multi-Wallet"
- Vedi le icone delle blockchain (Ethereum, Polygon, BSC, Solana, TON)

✅ **Assets caricano**
- Apri DevTools (F12) → Tab **Network**
- Ricarica la pagina (Ctrl+R)
- Verifica che tutti i file CSS/JS si caricano senza errori 404

✅ **PWA funziona**
- In Chrome/Edge, dovresti vedere l'icona "Installa" nella barra degli indirizzi

✅ **Console senza errori critici**
- DevTools → Tab **Console**
- Verifica che non ci siano errori rossi (warning gialli sono OK)

### 3. Test funzionale rapido
1. Clicca su "Inizia" o "Crea Wallet"
2. Segui il wizard di setup
3. Genera una seed phrase di test
4. Verifica che il wizard completi

---

## 🛠️ Troubleshooting

### ❌ Errore 404 - Pagina non trovata
**Causa:** Path errato o file non caricati
**Soluzione:**
- Verifica che i file siano in `/www.axpdev.it/wdk-multi-chain-web-wallet/`
- Controlla che `index.html` sia presente

### ❌ CSS/JS non caricano (pagina senza stile)
**Causa:** Path degli asset errati
**Soluzione:**
- Verifica DevTools → Network → vedi quali file danno 404
- Assicurati che la cartella `assets/` sia stata caricata

### ❌ Errore 500 - Internal Server Error
**Causa:** `.htaccess` con direttive non supportate
**Soluzione:**
1. Rinomina `.htaccess` in `.htaccess.bak` temporaneamente
2. Testa se il sito carica
3. Se carica, apri `.htaccess` e commenta le sezioni problematiche (solitamente `mod_headers`)

### ❌ Redirect loop o errori di routing
**Causa:** Conflitto con `.htaccess` esistente nella root
**Soluzione:**
- Il wallet usa `.htaccess` auto-rilevante, non serve configurare `RewriteBase`
- Se hai `.htaccess` nella root che interferisce, assicurati non abbia regole che catturano tutte le richieste

### ❌ PWA non si installa
**Causa:** Serve HTTPS
**Soluzione:**
- Attiva SSL/TLS nel pannello Aruba (certificato Let's Encrypt gratuito)
- Decommentare la sezione FORCE HTTPS in `.htaccess`

---

## 🔒 Attivare HTTPS (Consigliato)

### 1. Pannello Aruba
1. Vai in **Gestione SSL/TLS**
2. Seleziona **Let's Encrypt** (gratuito)
3. Attiva per `www.axpdev.it`
4. Attendi propagazione (~5-30 minuti)

### 2. Aggiorna .htaccess
Decommenta queste righe in `.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## 📊 Performance e Cache

Dopo il deploy, testa le performance:
1. Vai su: https://pagespeed.web.dev/
2. Inserisci: `https://www.axpdev.it/wdk-multi-chain-web-wallet/`
3. Analizza il report

L'`.htaccess` già include:
- ✅ GZIP compression
- ✅ Browser caching ottimizzato
- ✅ Security headers

---

## 🔄 Aggiornamenti futuri

Per aggiornare il wallet:

### Metodo rapido (sovrascrittura)
```bash
# 1. Nuova build
npm run build

# 2. Carica e sovrascrivi tutti i file in dist/ su FTP
```

### Metodo sicuro (backup)
1. Nel FTP, rinomina la cartella esistente:
   `wdk-multi-chain-web-wallet` → `wdk-multi-chain-web-wallet-OLD`

2. Carica la nuova versione in `wdk-multi-chain-web-wallet`

3. Testa tutto

4. Se OK, elimina `wdk-multi-chain-web-wallet-OLD`

---

## 📞 Supporto Aruba

Se riscontri problemi tecnici lato server:
- **Email:** hosting@staff.aruba.it
- **Ticket:** Pannello Aruba → Supporto
- **Telefono:** 0575 0505 (lun-ven 9-18)

---

## ✅ Checklist finale

Prima di considerare il deploy completo:

- [ ] Tutti i file caricati via FTP
- [ ] Permessi corretti (644 file, 755 cartelle)
- [ ] Homepage accessibile all'URL corretto
- [ ] Console browser senza errori critici
- [ ] CSS e JS caricano correttamente
- [ ] Wizard wallet funziona
- [ ] PWA installabile (se HTTPS attivo)
- [ ] Performance accettabili (PageSpeed)

---

**Deploy preparato da:** GitHub Copilot  
**Data:** 26 Ottobre 2025  
**Versione wallet:** 1.0.1 Beta (Portable)  
**URL esempio:** https://www.axpdev.it/[tua-cartella]/
