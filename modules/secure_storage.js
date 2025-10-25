// modules/secure_storage.js - Secure seed storage with encryption

import { showNotification } from './ui_utils.js';

// === ENCRYPTION HELPERS ===

/**
 * Deriva una chiave crittografica da una password usando PBKDF2
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // OWASP raccomanda minimo 100k
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cripta una stringa usando AES-GCM
 * @param {string} data - Data to encrypt
 * @param {password} password - Password for encryption
 * @returns {Object} {encryptedData, salt, iv} all in base64
 */
export async function encryptData(data, password) {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(data)
    );
    
    // Return separate components for multi-wallet structure
    return {
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv))
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Errore durante la crittografia');
  }
}

/**
 * Decripta una stringa usando AES-GCM
 * @param {string} encryptedData - Encrypted data (base64)
 * @param {string} password - Password for decryption
 * @param {string} saltBase64 - Salt (base64)
 * @param {string} ivBase64 - IV (base64)
 * @returns {string} Decrypted data
 */
export async function decryptData(encryptedData, password, saltBase64, ivBase64) {
  try {
    const decoder = new TextDecoder();
    
    // Decode from base64
    const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    
    const key = await deriveKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null; // Return null on error instead of throwing
  }
}

// === STORAGE MANAGER ===

const STORAGE_KEY = 'wdk_wallet_encrypted_seed';
const STORAGE_METADATA_KEY = 'wdk_wallet_metadata';

/**
 * Salva la seed in modo sicuro con crittografia
 */
export async function saveEncryptedSeed(seed, password) {
  if (!seed || !password) {
    throw new Error('Seed e password sono obbligatori');
  }
  
  if (password.length < 8) {
    throw new Error('La password deve essere almeno 8 caratteri');
  }
  
  try {
    const encrypted = await encryptData(seed, password);
    
    // Salva in localStorage
    localStorage.setItem(STORAGE_KEY, encrypted);
    
    // Salva metadata (NON la password!)
    const metadata = {
      timestamp: Date.now(),
      version: '1.0',
      hasEncryptedSeed: true
    };
    localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(metadata));
    
    console.log('✅ Seed salvata in modo sicuro (encrypted)');
    showNotification('success', 'Seed salvata in modo sicuro');
    return true;
  } catch (error) {
    console.error('Save error:', error);
    showNotification('error', error.message || 'Errore durante il salvataggio');
    return false;
  }
}

/**
 * Carica e decripta la seed
 */
export async function loadEncryptedSeed(password) {
  if (!password) {
    throw new Error('Password richiesta');
  }
  
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      throw new Error('Nessuna seed salvata trovata');
    }
    
    const seed = await decryptData(encrypted, password);
    console.log('✅ Seed caricata e decriptata con successo');
    return seed;
  } catch (error) {
    console.error('Load error:', error);
    throw error;
  }
}

/**
 * Verifica se esiste una seed salvata
 */
export function hasStoredSeed() {
  const metadata = localStorage.getItem(STORAGE_METADATA_KEY);
  if (!metadata) return false;
  
  try {
    const data = JSON.parse(metadata);
    return data.hasEncryptedSeed === true;
  } catch {
    return false;
  }
}

/**
 * Cancella la seed salvata
 */
export function clearStoredSeed() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_METADATA_KEY);
  console.log('✅ Seed cancellata dallo storage');
  showNotification('info', 'Seed rimossa dallo storage locale');
}

/**
 * Ottieni metadata della seed salvata
 */
export function getStorageMetadata() {
  const metadata = localStorage.getItem(STORAGE_METADATA_KEY);
  if (!metadata) return null;
  
  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

/**
 * Cambia la password di una seed già salvata
 */
export async function changePassword(oldPassword, newPassword) {
  if (!oldPassword || !newPassword) {
    throw new Error('Vecchia e nuova password sono obbligatorie');
  }
  
  if (newPassword.length < 8) {
    throw new Error('La nuova password deve essere almeno 8 caratteri');
  }
  
  try {
    // Carica seed con vecchia password
    const seed = await loadEncryptedSeed(oldPassword);
    
    // Salva con nuova password
    const success = await saveEncryptedSeed(seed, newPassword);
    
    if (success) {
      console.log('✅ Password cambiata con successo');
      showNotification('success', 'Password cambiata con successo');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Change password error:', error);
    showNotification('error', error.message || 'Errore cambio password');
    throw error;
  }
}

/**
 * Esporta la seed criptata come file .wdk
 */
export async function exportEncryptedSeed() {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      throw new Error('Nessuna seed salvata da esportare');
    }
    
    const metadata = getStorageMetadata();
    
    // Crea oggetto esportazione con metadata
    const exportData = {
      version: '1.0',
      type: 'wdk-encrypted-seed',
      exported: Date.now(),
      original: metadata?.timestamp || Date.now(),
      encrypted: encrypted
    };
    
    // Converti in JSON
    const json = JSON.stringify(exportData, null, 2);
    
    // Crea blob e download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wdk-wallet-backup-${Date.now()}.wdk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Seed criptata esportata');
    showNotification('success', 'Backup seed esportato con successo');
    return true;
  } catch (error) {
    console.error('Export error:', error);
    showNotification('error', error.message || 'Errore export seed');
    return false;
  }
}

/**
 * Importa seed criptata da file .wdk
 */
export async function importEncryptedSeed(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const json = e.target.result;
        const data = JSON.parse(json);
        
        // Valida formato
        if (data.type !== 'wdk-encrypted-seed' || !data.encrypted) {
          throw new Error('File non valido o corrotto');
        }
        
        // Salva seed criptata
        localStorage.setItem(STORAGE_KEY, data.encrypted);
        
        // Salva metadata
        const metadata = {
          timestamp: data.original || data.exported,
          version: data.version || '1.0',
          hasEncryptedSeed: true,
          imported: Date.now()
        };
        localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(metadata));
        
        console.log('✅ Seed criptata importata');
        showNotification('success', 'Backup seed importato con successo');
        resolve(true);
      } catch (error) {
        console.error('Import error:', error);
        showNotification('error', error.message || 'Errore import seed');
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Errore lettura file'));
    };
    
    reader.readAsText(file);
  });
}

// === UI HELPERS ===

/**
 * Mostra dialog per salvare la seed
 */
export async function showSaveSeedDialog(seed) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        🔐 Salva Seed in Modo Sicuro
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-info">
          <strong>Sicurezza:</strong> La tua seed verrà criptata con AES-256-GCM usando la password che scegli.
          Nessuno potrà accedere alla seed senza questa password.
        </div>
        
        <div class="mb-3">
          <label class="form-label">Password (minimo 8 caratteri)</label>
          <input type="password" id="savePassword" class="form-control" placeholder="Scegli una password forte" autocomplete="new-password">
          <div class="small text-muted mt-1">Usa lettere, numeri e simboli per una password sicura</div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Conferma Password</label>
          <input type="password" id="savePasswordConfirm" class="form-control" placeholder="Ripeti la password" autocomplete="new-password">
        </div>
        
        <div class="alert alert-warning">
          <strong>⚠️ Importante:</strong> Se dimentichi questa password, non potrai più recuperare la seed. 
          Conserva la password in un luogo sicuro (es. password manager).
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="cancelSave">Annulla</button>
        <button class="btn btn-primary" id="confirmSave">💾 Salva Seed</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const closeModal = () => {
      backdrop.remove();
    };
    
    document.getElementById('cancelSave').onclick = () => {
      closeModal();
      resolve(false);
    };
    
    document.getElementById('confirmSave').onclick = async () => {
      const pwd = document.getElementById('savePassword').value;
      const pwdConfirm = document.getElementById('savePasswordConfirm').value;
      
      if (!pwd || pwd.length < 8) {
        showNotification('error', 'La password deve essere almeno 8 caratteri');
        return;
      }
      
      if (pwd !== pwdConfirm) {
        showNotification('error', 'Le password non corrispondono');
        return;
      }
      
      const success = await saveEncryptedSeed(seed, pwd);
      closeModal();
      resolve(success);
    };
    
    // Focus sul primo input
    setTimeout(() => {
      const input = document.getElementById('savePassword');
      if (input) input.focus();
    }, 100);
  });
}

/**
 * Mostra dialog per caricare la seed
 */
export async function showLoadSeedDialog() {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';
    
    const metadata = getStorageMetadata();
    const savedDate = metadata ? new Date(metadata.timestamp).toLocaleString('it-IT') : 'N/A';
    
    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        🔓 Carica Seed Salvata
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-info">
          Seed salvata il: <strong>${savedDate}</strong>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" id="loadPassword" class="form-control" placeholder="Inserisci la password" autocomplete="current-password">
          <div class="small text-muted mt-1">La password che hai usato per salvare la seed</div>
        </div>
        
        <div class="alert alert-warning">
          Se hai dimenticato la password, dovrai usare il backup offline della seed.
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="cancelLoad">Annulla</button>
        <button class="btn btn-primary" id="confirmLoad">🔓 Carica Seed</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const closeModal = () => {
      backdrop.remove();
    };
    
    document.getElementById('cancelLoad').onclick = () => {
      closeModal();
      resolve(null);
    };
    
    document.getElementById('confirmLoad').onclick = async () => {
      const pwd = document.getElementById('loadPassword').value;
      
      if (!pwd) {
        showNotification('error', 'Inserisci la password');
        return;
      }
      
      try {
        const seed = await loadEncryptedSeed(pwd);
        showNotification('success', 'Seed caricata con successo');
        closeModal();
        resolve(seed);
      } catch (error) {
        showNotification('error', error.message || 'Errore caricamento seed');
      }
    };
    
    // Focus sul primo input
    setTimeout(() => {
      const input = document.getElementById('loadPassword');
      if (input) input.focus();
    }, 100);
    
    // Enter per confermare
    document.getElementById('loadPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('confirmLoad').click();
      }
    });
  });
}

/**
 * Mostra dialog per cambiare password
 */
export async function showChangePasswordDialog() {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        🔑 Cambia Password
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-info">
          Puoi cambiare la password di crittografia della seed salvata.
        </div>
        
        <div class="mb-3">
          <label class="form-label">Password Attuale</label>
          <input type="password" id="oldPassword" class="form-control" placeholder="Password attuale" autocomplete="current-password">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Nuova Password (minimo 8 caratteri)</label>
          <input type="password" id="newPassword" class="form-control" placeholder="Nuova password" autocomplete="new-password">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Conferma Nuova Password</label>
          <input type="password" id="newPasswordConfirm" class="form-control" placeholder="Ripeti nuova password" autocomplete="new-password">
        </div>
        
        <div class="alert alert-warning">
          Dopo il cambio, userai la nuova password per accedere al wallet.
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="cancelChange">Annulla</button>
        <button class="btn btn-primary" id="confirmChange">🔑 Cambia Password</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const closeModal = () => {
      backdrop.remove();
    };
    
    document.getElementById('cancelChange').onclick = () => {
      closeModal();
      resolve(false);
    };
    
    document.getElementById('confirmChange').onclick = async () => {
      const oldPwd = document.getElementById('oldPassword').value;
      const newPwd = document.getElementById('newPassword').value;
      const newPwdConfirm = document.getElementById('newPasswordConfirm').value;
      
      if (!oldPwd) {
        showNotification('error', 'Inserisci la password attuale');
        return;
      }
      
      if (!newPwd || newPwd.length < 8) {
        showNotification('error', 'La nuova password deve essere almeno 8 caratteri');
        return;
      }
      
      if (newPwd !== newPwdConfirm) {
        showNotification('error', 'Le nuove password non corrispondono');
        return;
      }
      
      try {
        await changePassword(oldPwd, newPwd);
        closeModal();
        resolve(true);
      } catch (error) {
        // Error già gestito in changePassword
      }
    };
    
    // Focus
    setTimeout(() => {
      const input = document.getElementById('oldPassword');
      if (input) input.focus();
    }, 100);
  });
}

/**
 * Mostra dialog per import/export seed
 */
export async function showBackupDialog() {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        💾 Backup Seed Criptata
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-info">
          Puoi esportare o importare la seed criptata come file di backup (.wdk).
        </div>
        
        <div class="mb-3">
          <h6>Esporta Backup</h6>
          <p class="small text-muted">Scarica la seed criptata come file. Conserva il file in un luogo sicuro (es. USB, cloud criptato).</p>
          <button class="btn btn-primary w-100" id="exportBtn">
            📥 Esporta Seed Criptata
          </button>
        </div>
        
        <hr>
        
        <div class="mb-3">
          <h6>Importa Backup</h6>
          <p class="small text-muted">Carica un file .wdk precedentemente esportato. Sovrascriverà la seed attuale se presente.</p>
          <input type="file" id="importFile" class="form-control" accept=".wdk,.json">
          <button class="btn btn-success w-100 mt-2" id="importBtn">
            📤 Importa Seed Criptata
          </button>
        </div>
        
        <div class="alert alert-warning">
          <strong>⚠️ Importante:</strong> Il file contiene la seed criptata. Serve comunque la password per decriptarla.
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="closeBackup">Chiudi</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const closeModal = () => {
      backdrop.remove();
    };
    
    document.getElementById('closeBackup').onclick = () => {
      closeModal();
      resolve();
    };
    
    document.getElementById('exportBtn').onclick = async () => {
      await exportEncryptedSeed();
    };
    
    document.getElementById('importBtn').onclick = async () => {
      const fileInput = document.getElementById('importFile');
      if (!fileInput.files || !fileInput.files[0]) {
        showNotification('error', 'Seleziona un file .wdk da importare');
        return;
      }
      
      try {
        await importEncryptedSeed(fileInput.files[0]);
        closeModal();
        resolve(true);
      } catch (error) {
        // Error già gestito
      }
    };
  });
}

// === AUTO-LOCK / TIMEOUT ===

let autoLockTimer = null;
let autoLockMinutes = (() => {
  const stored = localStorage.getItem('wdk_autolock_minutes');
  const n = stored != null ? parseInt(stored, 10) : 15;
  return Number.isFinite(n) ? n : 15;
})(); // Default: 15 minuti (overridden by stored value)
let isWalletLocked = false;
let cachedSeed = null;

/**
 * Imposta il timeout di auto-lock
 */
export function setAutoLockTimeout(minutes) {
  autoLockMinutes = minutes;
  resetAutoLockTimer();
}

/**
 * Ottieni il timeout corrente
 */
export function getAutoLockTimeout() {
  return autoLockMinutes;
}

/**
 * Reset del timer di auto-lock
 */
export function resetAutoLockTimer() {
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
  }
  
  if (autoLockMinutes > 0 && hasStoredSeed() && !isWalletLocked) {
    autoLockTimer = setTimeout(() => {
      lockWallet();
    }, autoLockMinutes * 60 * 1000);
  }
}

/**
 * Blocca il wallet
 */
export function lockWallet() {
  if (!hasStoredSeed()) return;
  
  isWalletLocked = true;
  cachedSeed = null;
  
  // Nascondi pannello wallet
  const walletPanel = document.querySelector('.wallet-panel');
  if (walletPanel) walletPanel.style.display = 'none';
  
  // Mostra overlay di blocco
  showLockOverlay();
  
  console.log('🔒 Wallet bloccato');
  showNotification('info', 'Wallet bloccato per inattività');
}

/**
 * Sblocca il wallet
 */
export async function unlockWallet(password) {
  if (!password) {
    throw new Error('Password richiesta');
  }
  
  try {
    const seed = await loadEncryptedSeed(password);
    cachedSeed = seed;
    isWalletLocked = false;
    
    // Nascondi overlay
    const overlay = document.getElementById('walletLockOverlay');
    if (overlay) overlay.remove();
    
    // Mostra pannello wallet
    const walletPanel = document.querySelector('.wallet-panel');
    if (walletPanel) walletPanel.style.display = 'block';
    
    // Reset timer
    resetAutoLockTimer();
    
    console.log('🔓 Wallet sbloccato');
    showNotification('success', 'Wallet sbloccato');
    
    return seed;
  } catch (error) {
    throw error;
  }
}

/**
 * Verifica se il wallet è bloccato
 */
export function isLocked() {
  return isWalletLocked;
}

/**
 * Ottieni seed cachata (se sbloccata)
 */
export function getCachedSeed() {
  return isWalletLocked ? null : cachedSeed;
}

/**
 * Mostra overlay di blocco
 */
function showLockOverlay() {
  // Rimuovi overlay esistente
  const existing = document.getElementById('walletLockOverlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'walletLockOverlay';
  overlay.className = 'wdk-modal-backdrop';
  overlay.style.zIndex = '9999';
  
  const lockBox = document.createElement('div');
  lockBox.className = 'wdk-modal';
  lockBox.style.maxWidth = '400px';
  lockBox.innerHTML = `
    <div style="text-align:center;padding:40px 24px">
      <div style="font-size:4rem;margin-bottom:20px">🔒</div>
      <h4 style="margin-bottom:12px">Wallet Bloccato</h4>
      <p class="text-muted small mb-4">Inserisci la password per sbloccare</p>
      
      <div class="mb-3">
        <input type="password" id="unlockPassword" class="form-control" placeholder="Password" autocomplete="current-password">
      </div>
      
      <button class="btn btn-primary w-100" id="unlockBtn">
        🔓 Sblocca Wallet
      </button>
      
      <div class="mt-3">
        <button class="btn btn-sm btn-outline-secondary" id="lockResetBtn">
          Usa seed manuale
        </button>
      </div>
    </div>
  `;
  
  overlay.appendChild(lockBox);
  document.body.appendChild(overlay);
  
  // Focus su input
  setTimeout(() => {
    const input = document.getElementById('unlockPassword');
    if (input) input.focus();
  }, 100);
  
  // Handler sblocco
  const unlockBtn = document.getElementById('unlockBtn');
  const unlockInput = document.getElementById('unlockPassword');
  
  const doUnlock = async () => {
    const pwd = unlockInput.value;
    if (!pwd) {
      showNotification('error', 'Inserisci la password');
      return;
    }
    
    try {
      await unlockWallet(pwd);
      // Overlay rimosso in unlockWallet
    } catch (error) {
      showNotification('error', error.message || 'Password errata');
      unlockInput.value = '';
      unlockInput.focus();
    }
  };
  
  unlockBtn.onclick = doUnlock;
  unlockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doUnlock();
  });
  
  // Reset wallet
  document.getElementById('lockResetBtn').onclick = () => {
    const confirm = window.confirm('Vuoi ricominciare da zero? Dovrai inserire la seed manualmente.');
    if (confirm) {
      location.reload();
    }
  };
}

/**
 * Inizializza il sistema di auto-lock
 */
export function initAutoLock() {
  if (!hasStoredSeed()) return;
  
  // Eventi per reset timer su attività utente
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, () => {
      if (!isWalletLocked) {
        resetAutoLockTimer();
      }
    }, { passive: true });
  });
  
  // Avvia timer iniziale
  resetAutoLockTimer();
  
  console.log(`🕐 Auto-lock attivo: ${autoLockMinutes} minuti`);
}
