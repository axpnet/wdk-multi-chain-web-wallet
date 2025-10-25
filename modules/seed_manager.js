// modules/seed_manager.js - Seed generation, validation, and verification

import * as bip39 from 'bip39';
import { showNotification, ajaxAction } from './ui_utils.js';

// === SEED GENERATION ===

export async function generateSeed(entropy = 128) {
  try {
    const mnemonic = await ajaxAction(
      async () => bip39.generateMnemonic(entropy),
      {
        pendingMsg: 'Generazione seed...',
        successMsg: 'Seed generata',
        errorMsg: 'Errore generazione seed'
      }
    );
    return mnemonic;
  } catch (error) {
    console.error('Generate seed error:', error);
    throw error;
  }
}

// === SEED VALIDATION ===

export function validateSeed(mnemonic) {
  if (!mnemonic) return false;
  return bip39.validateMnemonic(mnemonic);
}

// === SEED UI DISPLAY ===

export function showGeneratedSeedUI(mnemonic, statusEl, onSaved) {
  const words = mnemonic.split(' ');
  const container = document.createElement('div');
  container.className = 'card-body';
  
  const grid = document.createElement('div');
  grid.className = 'seed-grid';
  words.forEach((w, i) => {
    const item = document.createElement('div');
    item.className = 'seed-word-item';
    item.innerHTML = `<div class="seed-index">${i + 1}</div><div class="seed-word">${w}</div>`;
    grid.appendChild(item);
  });
  
  const controls = document.createElement('div');
  controls.style.marginTop = '12px';
  controls.innerHTML = `
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-outline-primary" id="copySeedBtn">Copia seed</button>
      <button class="btn btn-primary" id="savedSeedBtn">Ho salvato in modo sicuro</button>
    </div>
    <div class="mt-2 text-muted small">Copia e conserva la seed in offline. Le parole sopra sono il tuo backup.</div>
  `;
  
  container.appendChild(grid);
  container.appendChild(controls);
  statusEl.innerHTML = '';
  statusEl.appendChild(container);
  
  // Attach button handlers
  const copySeedBtn = document.getElementById('copySeedBtn');
  copySeedBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      showNotification('success', 'Seed copiata negli appunti. Salvala offline.');
    } catch (e) {
      showNotification('warn', 'Copia fallita: usa copia manuale.');
    }
  };
  
  document.getElementById('savedSeedBtn').onclick = () => {
    if (onSaved) onSaved(mnemonic);
  };
}

// === SEED VERIFICATION UI ===

export function showSeedVerificationUI(expectedMnemonic, statusEl, onVerified, onCancel) {
  const container = document.createElement('div');
  container.className = 'card-body';
  container.innerHTML = `
    <h5>Verifica la tua Seed</h5>
    <div class="verify-hint small text-muted">Incolla la seed che hai salvato (verifica per procedere)</div>
    <textarea id="verifySeed" class="verify-area form-control" rows="3" placeholder="Incolla qui la seed..."></textarea>
    <div class="d-flex align-items-center justify-content-between mt-2">
      <div>
        <span class="badge rounded-pill bg-secondary" id="seedValidityBadge">In attesa…</span>
        <span class="small text-muted ms-2" id="seedWordHint"></span>
      </div>
      <div id="seedExtraHint" class="small text-muted"></div>
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;justify-content:center">
      <button class="btn btn-secondary" id="verifyCancel">Annulla</button>
      <button class="btn btn-primary" id="verifyDo">Verifica seed</button>
    </div>
  `;
  
  statusEl.innerHTML = '';
  statusEl.appendChild(container);
  
  const area = document.getElementById('verifySeed');
  const verifyDoEl = document.getElementById('verifyDo');
  const badgeEl = document.getElementById('seedValidityBadge');
  const hintEl = document.getElementById('seedWordHint');
  const extraEl = document.getElementById('seedExtraHint');
  const hasExpected = !!(expectedMnemonic && expectedMnemonic.trim());
  
  function normalize(s) {
    return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }
  
  function updateLiveStatus() {
    const v = normalize(area.value);
    const wordCount = v ? v.split(' ').filter(Boolean).length : 0;
    let valid = false;
    let matches = false;
    
    if (hasExpected) {
      const expected = normalize(expectedMnemonic);
      matches = v === expected;
      valid = matches; // per flusso generato, la validità è "corrisponde"
    } else {
      valid = validateSeed(v);
    }
    
    // Aggiorna badge
    if (badgeEl) {
      badgeEl.classList.remove('bg-secondary','bg-success','bg-danger','bg-warning');
      if (!v) {
        badgeEl.textContent = 'In attesa…';
        badgeEl.classList.add('bg-secondary');
      } else if (hasExpected) {
        if (matches) {
          badgeEl.textContent = 'Seed corretta';
          badgeEl.classList.add('bg-success');
        } else {
          badgeEl.textContent = 'Non corrisponde';
          badgeEl.classList.add('bg-warning');
        }
      } else {
        if (valid) {
          badgeEl.textContent = 'Seed valida';
          badgeEl.classList.add('bg-success');
        } else {
          badgeEl.textContent = 'Seed non valida';
          badgeEl.classList.add('bg-danger');
        }
      }
    }
    
    if (hintEl) {
      hintEl.textContent = wordCount ? `${wordCount} parole (12/15/18/21/24)` : '';
    }
    if (extraEl) {
      extraEl.textContent = (!v) ? '' : (hasExpected ? 'Deve corrispondere esattamente (spazi singoli, minuscole).' : 'Usa parole BIP39 valide separate da uno spazio.');
    }
    
    if (verifyDoEl) verifyDoEl.disabled = !valid;
    
    try {
      document.dispatchEvent(new CustomEvent('seed-validation-status', {
        detail: { valid, matchesExpected: matches, wordCount }
      }));
    } catch {}
  }
  
  // Prime update
  setTimeout(updateLiveStatus, 0);
  area.addEventListener('input', updateLiveStatus);
  
  document.getElementById('verifyCancel').onclick = () => {
    if (onCancel) onCancel();
    else {
      statusEl.innerHTML = `<div class="card-body"><p class="card-text">Operazione annullata. Puoi rigenerare la seed o inserire manualmente.</p></div>`;
    }
  };
  
  document.getElementById('verifyDo').onclick = () => {
    const vRaw = document.getElementById('verifySeed').value;
    const v = vRaw.trim().replace(/\s+/g, ' ').toLowerCase();
    const hasExpected = !!(expectedMnemonic && expectedMnemonic.trim());
    
    if (hasExpected) {
      const expected = expectedMnemonic.trim().replace(/\s+/g, ' ').toLowerCase();
      if (v === expected) {
        showNotification('success', 'Seed verificata con successo. Ora puoi inizializzare il wallet.');
        if (onVerified) onVerified(expectedMnemonic);
      } else {
        showNotification('error', 'Seed non corrisponde. Riprova.');
      }
    } else {
      // Modalità inserimento manuale: valida solo la correttezza del mnemonic
      const isValid = validateSeed(v);
      if (isValid) {
        showNotification('success', 'Seed valida. Ora puoi inizializzare il wallet.');
        if (onVerified) onVerified(v);
      } else {
        showNotification('error', 'Seed non valida. Controlla le parole e riprova.');
      }
    }
  };
}

// === SHOW SEED BUTTON (with confirmation) ===

export function appendShowSeedButton(container, getSeed) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-outline-danger ms-2';
  btn.textContent = 'Mostra seed (pericolo!)';
  btn.onclick = () => {
    const confirmShow = window.confirm(
      'Mostrare la seed in chiaro può compromettere la sicurezza. Procedere?'
    );
    if (confirmShow) {
      window.prompt('Seed (COPIA E CONSERVA IN LOCALE):', getSeed());
    }
  };
  container.appendChild(btn);
  return btn;
}
