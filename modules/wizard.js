// modules/wizard.js - Wizard step-by-step navigation with multi-wallet support

import { generateSeed, showGeneratedSeedUI, showSeedVerificationUI } from './seed_manager.js';
import { showInitializationPanel } from './wallet_init.js';
import { renderWalletReadyPanel } from './wallet_ui.js';
import { encryptData } from './secure_storage.js';
import { createWallet } from './wallet_manager.js';
import { showNotification } from './ui_utils.js';

// Wizard state
let wizardEl = null;
let wizardContentEl = null;
let wizardStepsEls = null;
let currentWizardStep = 0;
let seedPhrase = '';
let isManualSeedEntry = false;
let walletInitialized = false;
let walletName = '';
let walletPassword = '';

// === HELPER: GET OR CREATE STATUS ELEMENT ===

function getOrCreateStatusEl() {
  let statusEl = document.getElementById('app')?.querySelector('.card');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'card bg-light mt-3';
    const appEl = document.getElementById('app');
    if (!appEl) return null;
    
    // Insert after wizard if exists, otherwise append
    const wizard = document.querySelector('.wizard');
    if (wizard && wizard.nextSibling) {
      appEl.insertBefore(statusEl, wizard.nextSibling);
    } else {
      appEl.appendChild(statusEl);
    }
  }
  return statusEl;
}

// === CREATE WIZARD ===

export function createWizard(container) {
  if (!wizardEl) {
    wizardEl = document.createElement('div');
    wizardEl.className = 'wizard';
    wizardEl.innerHTML = `
      <div class="wizard-steps">
        <div class="wizard-step active" data-step="0">
          <div class="step-bullet">1</div>
          <div class="step-label">Setup</div>
        </div>
        <div class="wizard-step" data-step="1">
          <div class="step-bullet">2</div>
          <div class="step-label">Seed</div>
        </div>
        <div class="wizard-step" data-step="2">
          <div class="step-bullet">3</div>
          <div class="step-label">Verifica</div>
        </div>
        <div class="wizard-step" data-step="3">
          <div class="step-bullet">4</div>
          <div class="step-label">Inizializza</div>
        </div>
      </div>
      <div class="wizard-content"></div>
      <div class="wizard-controls"></div>
    `;
  }
  
  container.appendChild(wizardEl);
  wizardContentEl = wizardEl.querySelector('.wizard-content');
  wizardStepsEls = Array.from(wizardEl.querySelectorAll('.wizard-step'));
  
  wizardEl.style.display = 'block';
  wizardEl.classList.remove('hidden');
  
  updateWizardStep(0);
  console.log('✅ Wizard creato e visibile.');
}

// === UPDATE WIZARD STEP ===

export function updateWizardStep(step) {
  currentWizardStep = step;
  
  // Update step indicators
  wizardStepsEls.forEach(el => {
    const s = Number(el.getAttribute('data-step'));
    if (s === step) el.classList.add('active');
    else el.classList.remove('active');
  });
  
  // Update content area
  wizardContentEl.innerHTML = '';
  const content = document.createElement('div');
  
  if (step === 0) {
    renderStep0(content);
  } else if (step === 1) {
    renderStep1(content);
  } else if (step === 2) {
    renderStep2(content);
  } else if (step === 3) {
    renderStep3(content);
  }
  
  wizardContentEl.appendChild(content);
  
  if (wizardEl) {
    wizardEl.style.display = 'block';
    wizardEl.classList.remove('hidden');
  }
}

// === STEP 0: WALLET NAME & PASSWORD ===

function renderStep0(content) {
  content.innerHTML = `
    <div style="max-width:520px;margin:0 auto">
      <div class="text-center mb-4">
        <strong style="font-size:1.1rem">Crea il Tuo Wallet</strong>
        <div class="small text-muted mt-2">Scegli un nome e una password per proteggere il tuo wallet</div>
      </div>
      
      <div class="mb-3">
        <label class="form-label" style="font-weight:600">Nome Wallet</label>
        <input type="text" class="form-control" id="walletNameInput" 
               placeholder="es. Wallet Personale, Trading, Risparmi..."
               maxlength="50">
        <small class="text-muted">Ti aiuterà a identificare il wallet se ne creerai altri</small>
      </div>
      
      <div class="mb-3">
        <label class="form-label" style="font-weight:600">Password</label>
        <input type="password" class="form-control" id="walletPasswordInput" 
               placeholder="Crea una password sicura"
               autocomplete="new-password">
        <small class="text-muted">Servirà per criptare e proteggere la seed</small>
      </div>
      
      <div class="mb-3">
        <label class="form-label" style="font-weight:600">Conferma Password</label>
        <input type="password" class="form-control" id="walletPasswordConfirm" 
               placeholder="Ripeti la password"
               autocomplete="new-password">
        <small id="passwordMatchFeedback" class="text-muted"></small>
      </div>
      
      <div class="alert alert-info" style="font-size:0.875rem">
        <strong>💡 Suggerimento:</strong> La password cripta la seed prima di salvarla. 
        Non dimenticarla, sarà necessaria ad ogni accesso!
      </div>
    </div>
  `;
  
  const controls = wizardEl.querySelector('.wizard-controls');
  controls.innerHTML = `
    <button class="btn btn-primary" id="wizContinueSetup">Continua →</button>
  `;
  
  setTimeout(() => {
    const nameInput = document.getElementById('walletNameInput');
    const passwordInput = document.getElementById('walletPasswordInput');
    const confirmInput = document.getElementById('walletPasswordConfirm');
    const continueBtn = document.getElementById('wizContinueSetup');
    const feedback = document.getElementById('passwordMatchFeedback');
    
    nameInput?.focus();
    
    // Real-time password match validation
    const checkPasswordMatch = () => {
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      
      if (!confirm) {
        feedback.textContent = '';
        feedback.className = 'text-muted';
        return;
      }
      
      if (password === confirm) {
        feedback.textContent = '✓ Le password corrispondono';
        feedback.className = 'text-success';
      } else {
        feedback.textContent = '✗ Le password non corrispondono';
        feedback.className = 'text-danger';
      }
    };
    
    passwordInput?.addEventListener('input', checkPasswordMatch);
    confirmInput?.addEventListener('input', checkPasswordMatch);
    
    continueBtn.onclick = () => {
      const name = nameInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      
      // Validation
      if (!name) {
        showNotification('Inserisci un nome per il wallet', 'warning');
        nameInput.focus();
        return;
      }
      
      if (name.length < 3) {
        showNotification('Il nome deve avere almeno 3 caratteri', 'warning');
        nameInput.focus();
        return;
      }
      
      if (!password) {
        showNotification('Inserisci una password', 'warning');
        passwordInput.focus();
        return;
      }
      
      if (password.length < 8) {
        showNotification('La password deve avere almeno 8 caratteri', 'warning');
        passwordInput.focus();
        return;
      }
      
      if (password !== confirm) {
        showNotification('Le password non corrispondono', 'error');
        confirmInput.value = '';
        confirmInput.focus();
        return;
      }
      
      // Save to wizard state
      walletName = name;
      walletPassword = password;
      
      showNotification(`Wallet "${name}" configurato!`, 'success');
      updateWizardStep(1);
    };
    
    // Enter key listeners
    [nameInput, passwordInput, confirmInput].forEach(input => {
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          continueBtn.click();
        }
      });
    });
  }, 100);
}

// === STEP 1: GENERATE/IMPORT SEED ===

function renderStep1(content) {
  content.innerHTML = `
    <div style="max-width:720px;margin:0 auto;text-align:center">
      <strong>Step 2 - Genera o importa la seed</strong>
      <div class="small text-muted mt-2">
        Wallet: <strong>${walletName}</strong> - Protetto con password
      </div>
    </div>
  `;
  
  const controls = wizardEl.querySelector('.wizard-controls');
  controls.innerHTML = `
    <button class="btn btn-outline-secondary" id="wizBackToSetup">← Indietro</button>
    <button class="btn btn-outline-primary" id="wizGen">Genera seed</button>
    <button class="btn btn-secondary" id="wizInsert">Inserisci seed manuale</button>
  `;
  
  setTimeout(() => {
    const backBtn = document.getElementById('wizBackToSetup');
    backBtn.onclick = () => {
      updateWizardStep(0);
    };
    
    const genBtn = document.getElementById('wizGen');
    if (genBtn) {
      genBtn.onclick = async () => {
        isManualSeedEntry = false;
        const statusEl = getOrCreateStatusEl();
        if (statusEl) {
          try {
            const mnemonic = await generateSeed(128);
            seedPhrase = mnemonic;
            
            controls.innerHTML = `
              <button class="btn btn-outline-secondary" id="wizBackFromSeed">Indietro</button>
            `;
            
            showGeneratedSeedUI(mnemonic, statusEl, () => {
              updateWizardStep(2);
            });
            
            setTimeout(() => {
              const backBtn2 = document.getElementById('wizBackFromSeed');
              if (backBtn2) {
                backBtn2.onclick = () => {
                  seedPhrase = '';
                  const statusEl = getOrCreateStatusEl();
                  if (statusEl) {
                    statusEl.innerHTML = '<div class="card-body"><p class="card-text">Pronto per generare seed e inizializzare wallet multi-chain!</p></div>';
                  }
                  updateWizardStep(1);
                };
              }
            }, 100);
            
          } catch (err) {
            console.error(err);
            showNotification('Errore nella generazione seed', 'error');
          }
        }
      };
    }
    
    const insertBtn = document.getElementById('wizInsert');
    if (insertBtn) {
      insertBtn.onclick = () => {
        isManualSeedEntry = true;
        updateWizardStep(2);
      };
    }
  }, 100);
}

// === STEP 2: VERIFY ===

function renderStep2(content) {
  content.innerHTML = `
    <div style="max-width:720px;margin:0 auto;text-align:center">
      <strong>Step 3 - Verifica la seed</strong>
      <div class="small text-muted mt-2">Incolla la seed che hai salvato per verificare che sia corretta.</div>
    </div>
  `;
  
  const controls = wizardEl.querySelector('.wizard-controls');
  controls.innerHTML = `
    <button class="btn btn-outline-secondary" id="wizBack">Indietro</button>
    <button class="btn btn-primary" id="wizVerify">Verifica seed</button>
  `;
  
  // Nascondi subito la seed se visibile e mostra la textarea
  const statusEl = getOrCreateStatusEl();
  if (statusEl) {
    const expected = isManualSeedEntry ? '' : (seedPhrase || '');
    showSeedVerificationUI(
      expected,
      statusEl,
      (verified) => {
        // Dopo la verifica, vai allo Step 3 (Inizializza)
        seedPhrase = verified;
        updateWizardStep(3);
      },
      () => updateWizardStep(1)
    );
  }
  
  setTimeout(() => {
    const backBtn = document.getElementById('wizBack');
    if (backBtn) {
      backBtn.onclick = () => {
        // Pulisci status e torna allo step 1
        const statusEl = getOrCreateStatusEl();
        if (statusEl) {
          statusEl.innerHTML = '<div class="card-body"><p class="card-text">Pronto per generare seed e inizializzare wallet multi-chain!</p></div>';
        }
        isManualSeedEntry = false;
        updateWizardStep(1);
      };
    }
    
    const verifyBtn = document.getElementById('wizVerify');
    if (verifyBtn) {
      verifyBtn.onclick = () => {
        // Trigger verifica manualmente (il form è già visibile)
        const verifySeed = document.getElementById('verifySeed');
        const verifyDoBtn = document.getElementById('verifyDo');
        if (verifyDoBtn) {
          verifyDoBtn.click();
        }
      };

      // Aggiorna stato del bottone in base alla validazione live
      const syncVerifyState = (valid) => {
        try {
          const internalBtn = document.getElementById('verifyDo');
          if (internalBtn) verifyBtn.disabled = internalBtn.disabled;
          else verifyBtn.disabled = !valid;
        } catch { /* noop */ }
      };
      // Ascolta evento di validazione live
      const handler = (ev) => {
        const valid = !!(ev && ev.detail && ev.detail.valid);
        syncVerifyState(valid);
      };
      document.addEventListener('seed-validation-status', handler);
      // Prime sync
      setTimeout(() => syncVerifyState(false), 0);
    }
  }, 0);
}

// === STEP 3: INITIALIZE ===

function renderStep3(content) {
  content.innerHTML = `
    <div style="max-width:720px;margin:0 auto;text-align:center">
      <strong>Step 4 - Inizializza il wallet</strong>
      <div class="small text-muted mt-2">Seleziona le blockchain su cui vuoi creare il wallet.</div>
    </div>
  `;
  
  const controls = wizardEl.querySelector('.wizard-controls');
  controls.innerHTML = `
    <button class="btn btn-outline-secondary" id="wizBack2">Indietro</button>
    <button class="btn btn-primary" id="wizInit">Inizializza</button>
  `;
  
  // Nascondi textarea seed e mostra subito il form di inizializzazione
  const statusEl = getOrCreateStatusEl();
  if (statusEl && seedPhrase) {
    showInitializationPanel(statusEl, seedPhrase, (results) => {
      // Dopo l'inizializzazione, mostra la tabella dei risultati
      // e aggiungi un pulsante "Avvia il Wallet"
      walletInitialized = true;
      
      // NASCONDI wizard-steps e wizard-controls dopo l'inizializzazione
      const wizSteps = wizardEl?.querySelector('.wizard-steps');
      const wizControls = wizardEl?.querySelector('.wizard-controls');
      if (wizSteps) wizSteps.style.display = 'none';
      if (wizControls) wizControls.style.display = 'none';
      
      setTimeout(() => {
        addOpenWalletButton(statusEl);
      }, 300);
    });
  }
  
  setTimeout(() => {
    const backBtn = document.getElementById('wizBack2');
    if (backBtn) {
      backBtn.onclick = () => {
        // Torna allo step 2
        walletInitialized = false;
        updateWizardStep(2);
      };
    }
    
    const initBtn = document.getElementById('wizInit');
    if (initBtn) {
      initBtn.onclick = () => {
        // Trigger inizializzazione manualmente (il form è già visibile)
        const initNowBtn = document.getElementById('initNow');
        if (initNowBtn) {
          initNowBtn.click();
        }
      };
    }
  }, 0);
}

// === ADD OPEN WALLET BUTTON ===

function addOpenWalletButton(statusEl) {
  if (!statusEl) return;
  
  // Rimuovi eventuali pulsanti esistenti
  const existingBtn = document.getElementById('openWalletFromResults');
  if (existingBtn) existingBtn.remove();
  
  // Aggiungi pulsante "Avvia il Wallet" dopo la tabella
  const btn = document.createElement('div');
  btn.id = 'openWalletFromResults';
  btn.className = 'text-center mt-4';
  btn.innerHTML = `
    <button class="btn btn-lg btn-primary d-inline-flex align-items-center gap-2" id="openWalletBtn">
      <i data-feather="arrow-right-circle"></i>
      <span>Avvia il Wallet</span>
    </button>
  `;
  
  statusEl.appendChild(btn);
  
  // Replace feather icons
  if (window.feather && typeof window.feather.replace === 'function') {
    window.feather.replace();
  }
  
  setTimeout(() => {
    const openBtn = document.getElementById('openWalletBtn');
    if (openBtn) {
      openBtn.onclick = () => {
        openWalletPanel();
      };
    }
  }, 0);
}

// === OPEN WALLET PANEL ===

export async function openWalletPanel() {
  // Se abbiamo nome wallet e password, salva automaticamente
  if (walletName && walletPassword && seedPhrase) {
    console.log('💾 Inizio salvataggio wallet:', { walletName, hasSeed: !!seedPhrase, hasPassword: !!walletPassword });
    
    try {
      showNotification('Salvataggio wallet in corso...', 'info');
      
      const { encryptedData, salt, iv } = await encryptData(seedPhrase, walletPassword);
      console.log('✅ Seed criptata correttamente');
      
      const wallet = createWallet(walletName, encryptedData, salt, iv);
      
      if (wallet) {
        // Store in global state
        window._currentWalletId = wallet.id;
        window._currentWalletName = wallet.name;
        window._currentSeed = seedPhrase;
        
        console.log('✅ Wallet salvato con successo:', wallet);
        showNotification(`Wallet "${wallet.name}" salvato con successo!`, 'success');
      } else {
        throw new Error('createWallet returned null');
      }
    } catch (error) {
      console.error('❌ Errore salvataggio wallet:', error);
      showNotification('Errore nel salvataggio del wallet', 'error');
      return; // Non procedere se il salvataggio fallisce
    }
  } else {
    console.warn('⚠️ Impossibile salvare wallet - dati mancanti:', {
      hasName: !!walletName,
      hasPassword: !!walletPassword,
      hasSeed: !!seedPhrase
    });
  }
  
  // Nascondi wizard e status card
  if (wizardEl) wizardEl.style.display = 'none';
  const statusEl = getOrCreateStatusEl();
  if (statusEl) statusEl.style.display = 'none';
  const wizControls = document.querySelector('.wizard-controls');
  if (wizControls) wizControls.style.display = 'none';
  
  // Renderizza il pannello wallet
  renderWalletReadyPanel();
  
  // Scroll to top per vedere il wallet
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    // Fallback silenzioso
  }
  
  console.log('✅ Wallet panel aperto');
}

// === EXPORT SEED PHRASE (for other modules) ===

export function getSeedPhrase() {
  return seedPhrase;
}

export function setSeedPhrase(seed) {
  seedPhrase = seed;
}

export function getCurrentStep() {
  return currentWizardStep;
}

export function getWalletName() {
  return walletName;
}

export function getWalletPassword() {
  return walletPassword;
}

export function setWalletInfo(name, password) {
  walletName = name;
  walletPassword = password;
}
