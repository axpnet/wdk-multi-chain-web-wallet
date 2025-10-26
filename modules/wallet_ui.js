// modules/wallet_ui.js - Wallet UI panel and chain selector

import { getTickerForChain, abbreviateAddress, showNotification } from './ui_utils.js';
import { getPreferredCurrency, setPreferredCurrency, getPrices } from './price_service.js';
import { setAutoLockTimeout, getAutoLockTimeout, encryptData, decryptData } from './secure_storage.js';
import { logout, getAllWallets, getActiveWallet, updateWallet } from './wallet_manager.js';

// === CHAIN ICONS ===
const CHAIN_ICONS = {
  ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  polygon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  bsc: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  ton: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png'
};

// === RENDER WALLET PANEL ===

export function renderWalletReadyPanel() {
  const appEl = document.getElementById('app');
  if (!appEl) {
    console.error('❌ #app element not found');
    return;
  }
  
  // Get current wallet name
  const walletName = window._currentWalletName || 'Il Tuo Wallet';
  const hasMultipleWallets = getAllWallets().length > 1;
  
  // Remove existing panel if present
  const existing = document.querySelector('.wallet-panel');
  if (existing) existing.remove();
  
  const panel = document.createElement('div');
  panel.className = 'wallet-panel card';
  panel.style.marginTop = '20px';
  panel.style.padding = '24px';
  panel.style.borderRadius = '16px';
  panel.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
  
  panel.innerHTML = `
    <div class="wallet-header" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
        <div>
          <h4 style="margin:0;font-weight:700;cursor:${hasMultipleWallets ? 'pointer' : 'default'}" id="walletNameHeader">
            <i data-feather="briefcase" class="logo-icon" style="vertical-align:middle"></i> ${escapeHtml(walletName)} ${hasMultipleWallets ? '▼' : ''}
          </h4>
          <div class="small text-muted">Multi-chain wallet pronto all'uso</div>
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div id="chainSelectHolder"></div>
          <div id="currencySelectHolder"></div>
          <button class="btn btn-sm btn-outline-danger" id="logoutBtn" title="Logout">
            <i data-feather="power" style="vertical-align:middle"></i> Esci
          </button>
        </div>
      </div>
    </div>
    
    <div class="wallet-balance-section" style="background:linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);padding:32px;border-radius:12px;color:white;margin-bottom:20px;text-align:center">
      <img id="chainIcon" class="chain-icon-balance" src="" alt="" style="display:none;width:48px;height:48px;border-radius:50%;margin:0 auto 12px;object-fit:contain;">
      <div class="balance-label" style="font-size:0.875rem;opacity:0.9;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px" id="walletTicker">Saldo</div>
      <div class="wallet-balance" style="font-size:2.5rem;font-weight:700">--</div>
      <div class="wallet-fiat" id="walletFiat" style="margin-top:6px;font-size:1rem;opacity:0.95">&nbsp;</div>
      <div id="addressHolder" style="margin-top:12px;font-size:0.875rem;opacity:0.9"></div>
    </div>
    
    <div class="wallet-actions" style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap">
      <button class="wallet-action-btn btn btn-lg btn-primary send-action" onclick="window.showSendPicker()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 40px;border-radius:12px">
        <i data-feather="send" class="action-icon"></i>
        <span style="font-weight:600">Invia</span>
      </button>
      <button class="wallet-action-btn btn btn-lg btn-outline-primary" onclick="window.showReceivePicker()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 40px;border-radius:12px">
        <i data-feather="download" class="action-icon"></i>
        <span style="font-weight:600">Ricevi</span>
      </button>
    </div>
    
    <div style="margin-top:24px;text-align:center">
      <button class="btn btn-sm btn-outline-primary" id="securitySettingsBtn">
        <i data-feather="settings" style="vertical-align:middle"></i> Impostazioni
      </button>
      <button class="btn btn-sm btn-outline-danger ms-2" id="resetWalletBtn">
        <i data-feather="refresh-cw" style="vertical-align:middle"></i> Nuovo Wallet
      </button>
    </div>
  `;
  
  // Inserisci il pannello DOPO la topbar (non all'inizio di #app)
  const topbar = document.querySelector('.topbar');
  if (topbar && topbar.nextSibling) {
    appEl.insertBefore(panel, topbar.nextSibling);
  } else {
    appEl.appendChild(panel);
  }
  
  // Sicurezza extra: nascondi wizard/status se ancora visibili
  try {
    const wizard = document.querySelector('.wizard');
    const statusCard = document.querySelector('.card.bg-light');
    if (wizard) wizard.style.display = 'none';
    if (statusCard) statusCard.style.display = 'none';
    const wizControls = document.querySelector('.wizard-controls');
    if (wizControls) wizControls.style.display = 'none';
  } catch {}
  
  // Attach event handlers
  setTimeout(() => {
    // 'Impostazioni Wallet' rimosso: wizard richiamabile dal bottone 'Nuovo Wallet'
    
    const securityBtn = document.getElementById('securitySettingsBtn');
    if (securityBtn) {
      securityBtn.onclick = () => {
        showSecuritySettingsDialog();
      };
    }
    
    const resetWalletBtn = document.getElementById('resetWalletBtn');
    if (resetWalletBtn) {
      resetWalletBtn.onclick = () => {
        const confirm = window.confirm('Sei sicuro di voler creare un nuovo wallet? Questa azione ricomincerà il processo da zero.');
        if (!confirm) return;
        
        // Reset globale
        window.walletState = {};
        window._walletResults = [];
        
        // Rimuovi panel
        panel.remove();
        
        // Mostra wizard
        const wizard = document.querySelector('.wizard');
        if (wizard) wizard.style.display = 'block';
        
        // Reset status
        const statusCard = document.querySelector('.card.bg-light');
        if (statusCard) {
          statusCard.style.display = 'block';
          statusCard.innerHTML = '<div class="card-body"><p class="card-text">Pronto per generare seed e inizializzare wallet multi-chain!</p></div>';
        }
        
        // Ricarica la pagina per reset completo
        location.reload();
      };
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        const confirm = window.confirm('Vuoi uscire dal wallet? Dovrai inserire la password per accedere nuovamente.');
        if (!confirm) return;
        
        // Clear session data
        window._currentSeed = null;
        window._currentWalletId = null;
        window._currentWalletName = null;
        window.walletState = {};
        window._walletResults = [];
        
        // Logout
        logout();
        
        showNotification('Logout effettuato', 'success');
        
        // Reload to show login screen
        location.reload();
      };
    }
    
    // Wallet name header click (wallet switcher if multiple wallets)
    if (hasMultipleWallets) {
      const walletHeader = document.getElementById('walletNameHeader');
      if (walletHeader) {
        walletHeader.onclick = () => {
          showWalletSwitcher();
        };
      }
    }
  }, 100);
  
  // Initialize chain selector if results exist
  if (window._walletResults && window._walletResults.length > 0) {
    const chainNames = window._walletResults.map(r => r.chain);
    renderChainSelector(chainNames);
    updateWalletPanelBalances(window._walletResults);
    renderCurrencySelector();
    // Initial fiat update
    updateFiatDisplay();
  } else {
    console.warn('⚠️ No wallet results found, panel may not show correct data');
  }
  
  // PWA Install CTA rendering
  setupInstallCTA();
  
  console.log('✅ Wallet panel completamente renderizzato');

  // Replace icon placeholders with Feather SVGs (if feather loaded)
  try {
    if (window.feather && typeof window.feather.replace === 'function') {
      window.feather.replace();
    }
  } catch (e) { /* ignore */ }
  
  // Listen for network mode changes and refresh balances
  setupNetworkToggleListener();
}

// === NETWORK TOGGLE LISTENER ===

// Global handler to avoid duplicate listeners
let _networkToggleHandler = null;

function setupNetworkToggleListener() {
  // Remove old listener if exists to avoid duplicates
  if (_networkToggleHandler) {
    window.removeEventListener('network-mode-changed', _networkToggleHandler);
  }
  
  _networkToggleHandler = async (e) => {
    const newMode = e.detail.mode;
    const oldMode = newMode === 'testnet' ? 'mainnet' : 'testnet';
    
    console.log(`🔄 Network mode changed from ${oldMode} to ${newMode}`);
    
    // Re-initialize wallet with current seed and new network endpoints
    if (window._currentSeed && window._walletResults) {
      const fromLabel = oldMode === 'testnet' ? 'Testnet' : 'Mainnet';
      const toLabel = newMode === 'testnet' ? 'Testnet' : 'Mainnet';
      
      showNotification(`Cambio da ${fromLabel} a ${toLabel}...`, 'info');
      
      // Re-fetch balances with new RPC endpoints
      const { initializeWalletFromSeed } = await import('./wallet_init.js');
      await initializeWalletFromSeed(window._currentSeed);
    }
  };
  
  window.addEventListener('network-mode-changed', _networkToggleHandler);
}

function setupInstallCTA() {
  const holder = document.getElementById('installAppHolder');
  if (!holder) return;
  holder.innerHTML = '';
  
  const render = () => {
    holder.innerHTML = '';
    if (window._pwaInstallAvailable) {
      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'footer-link';
      btn.innerHTML = '<i data-feather="download" style="width:14px;height:14px;vertical-align:middle"></i> Installa App';
      btn.onclick = async (e) => {
        e.preventDefault();
        if (window.promptPWAInstall) {
          try { await window.promptPWAInstall(); } catch {}
        }
      };
      holder.appendChild(btn);
      
      // Replace feather icon
      if (window.feather && typeof window.feather.replace === 'function') {
        window.feather.replace();
      }
    } else {
      // Fallback: link guida installazione
      const a = document.createElement('a');
      a.href = 'https://support.google.com/chrome/answer/9658361?hl=it';
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'footer-link';
      a.textContent = 'Come installare';
      holder.appendChild(a);
    }
  };
  
  render();
  // Aggiorna quando cambia la disponibilità
  window.addEventListener('pwa-install-available', render);
  window.addEventListener('pwa-installed', render);
}

// === SECURITY SETTINGS DIALOG ===

function showSecuritySettingsDialog() {
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const activeWallet = getActiveWallet();
  const hasSeed = !!(activeWallet && activeWallet.encryptedSeed && activeWallet.salt && activeWallet.iv);
  const hasActiveWallet = window._walletResults && window._walletResults.length > 0;
  const currentTimeout = getAutoLockTimeout();
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '500px';
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="settings" class="modal-icon" style="vertical-align:middle"></i> Impostazioni
    </h5>
    <div class="wdk-modal-body">
      ${!hasSeed ? `
        <div class="alert alert-warning mb-3" style="font-size:0.875rem">
          ⚠️ Seed non salvata in questo wallet. Alcune funzioni sono disabilitate.
        </div>
      ` : ''}
      <div class="mb-4">
        <h6>Password</h6>
        <p class="small text-muted">Cambia la password di crittografia della seed</p>
        <button class="btn btn-outline-primary w-100" id="changePasswordBtn" ${!hasSeed ? 'disabled' : ''}>
          🔑 Cambia Password
        </button>
      </div>
      <hr>
      <div class="mb-4">
        <h6>Backup Seed Criptata</h6>
        <p class="small text-muted">Esporta o importa la seed criptata come file</p>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary flex-grow-1" id="exportBackupBtn" ${!hasSeed ? 'disabled' : ''}>📥 Esporta</button>
          <label class="btn btn-outline-success flex-grow-1 mb-0" for="importBackupInput" ${!hasSeed ? 'disabled' : ''}>📤 Importa</label>
          <input type="file" id="importBackupInput" accept=".wdk,.json" style="display:none">
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <h6>Auto-Lock</h6>
        <p class="small text-muted">Il wallet si blocca automaticamente dopo un periodo di inattività</p>
        <select class="form-select mb-2" id="autoLockSelect">
          <option value="0" ${currentTimeout === 0 ? 'selected' : ''}>Disabilitato</option>
          <option value="5" ${currentTimeout === 5 ? 'selected' : ''}>5 minuti</option>
          <option value="15" ${currentTimeout === 15 ? 'selected' : ''}>15 minuti</option>
          <option value="30" ${currentTimeout === 30 ? 'selected' : ''}>30 minuti</option>
          <option value="60" ${currentTimeout === 60 ? 'selected' : ''}>1 ora</option>
        </select>
        <button class="btn btn-outline-warning w-100" id="lockNowBtn">
          🔒 Blocca Ora
        </button>
      </div>
    </div>
    <div class="wdk-modal-actions">
      <button class="btn btn-secondary" id="closeSecurityBtn">Chiudi</button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  const closeModal = () => {
    backdrop.remove();
  };
  
  document.getElementById('closeSecurityBtn').onclick = closeModal;

  // Cambio password (multi-wallet)
  const changePwdBtn = document.getElementById('changePasswordBtn');
  if (changePwdBtn) {
    changePwdBtn.onclick = async () => {
      if (!activeWallet) return;
      const oldPwd = prompt('Password attuale');
      if (!oldPwd) return;
      const decrypted = await decryptData(activeWallet.encryptedSeed, oldPwd, activeWallet.salt, activeWallet.iv);
      if (!decrypted) {
        showNotification('error', 'Password attuale errata');
        return;
      }
      const newPwd = prompt('Nuova password (min 8)');
      if (!newPwd || newPwd.length < 8) {
        showNotification('error', 'La nuova password deve essere almeno 8 caratteri');
        return;
      }
      const confirmPwd = prompt('Conferma nuova password');
      if (newPwd !== confirmPwd) {
        showNotification('error', 'Le password non corrispondono');
        return;
      }
      const enc = await encryptData(decrypted, newPwd);
      const ok = updateWallet(activeWallet.id, { encryptedSeed: enc.encryptedData, salt: enc.salt, iv: enc.iv });
      if (ok) {
        showNotification('success', 'Password cambiata con successo');
        closeModal();
      } else {
        showNotification('error', 'Errore salvataggio nuova password');
      }
    };
  }

  // Backup export/import (multi-wallet)
  const exportBtn = document.getElementById('exportBackupBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      if (!activeWallet) return;
      const payload = {
        type: 'wdk-wallet-backup',
        exported: Date.now(),
        wallet: {
          id: activeWallet.id,
          name: activeWallet.name,
          encryptedSeed: activeWallet.encryptedSeed,
          salt: activeWallet.salt,
          iv: activeWallet.iv
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-backup-${activeWallet.name}.wdk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('success', 'Backup esportato');
    };
  }
  const importInput = document.getElementById('importBackupInput');
  if (importInput) {
    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file || !activeWallet) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const w = json.wallet || json; // accept both formats
        if (!w.encryptedSeed || !w.salt || !w.iv) throw new Error('Backup non valido');
        const ok = updateWallet(activeWallet.id, { encryptedSeed: w.encryptedSeed, salt: w.salt, iv: w.iv });
        if (ok) {
          showNotification('success', 'Backup importato');
          closeModal();
        } else {
          showNotification('error', 'Errore durante l\'import');
        }
      } catch (e) {
        showNotification('error', e.message || 'File non valido');
      }
    });
  }

  // Auto-lock timeout persist
  const autoLockSelect = document.getElementById('autoLockSelect');
  if (autoLockSelect) {
    autoLockSelect.addEventListener('change', () => {
      const minutes = parseInt(autoLockSelect.value, 10);
      setAutoLockTimeout(minutes);
      localStorage.setItem('wdk_autolock_minutes', String(minutes));
      if (minutes > 0) {
        showNotification('success', `Auto-lock impostato a ${minutes} minuti`);
      } else {
        showNotification('info', 'Auto-lock disabilitato');
      }
    });
  }

  // Lock now → show login screen again
  const lockNowBtn = document.getElementById('lockNowBtn');
  if (lockNowBtn) {
    lockNowBtn.onclick = () => {
      closeModal();
      window._currentSeed = null;
      location.reload();
    };
  }

  // Ensure modal icons are replaced
  try { if (window.feather && typeof window.feather.replace === 'function') window.feather.replace(); } catch (e) {}
}

// === RENDER CHAIN SELECTOR ===

export function renderChainSelector(chainsList) {
  const holder = document.getElementById('chainSelectHolder');
  if (!holder) {
    console.warn('⚠️ chainSelectHolder not found');
    return;
  }
  
  holder.innerHTML = '';
  if (!chainsList || chainsList.length === 0) {
    holder.innerHTML = '<div class="small text-muted">Nessuna chain disponibile</div>';
    return;
  }
  
  if (chainsList.length === 1) {
    const badge = document.createElement('div');
    badge.className = 'badge bg-primary';
    badge.style.fontSize = '1rem';
    badge.style.padding = '8px 16px';
    badge.textContent = chainsList[0].toUpperCase();
    holder.appendChild(badge);
    
    // Set active chain
    window._activeChain = chainsList[0];
    return;
  }
  
  const sel = document.createElement('select');
  sel.className = 'form-select';
  sel.style.width = '200px';
  sel.style.fontWeight = '600';
  sel.style.fontSize = '1rem';
  
  chainsList.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name.toUpperCase();
    sel.appendChild(opt);
  });
  
  holder.appendChild(sel);
  
  // Set initial active chain
  window._activeChain = sel.value || chainsList[0];
  
  // Update balance on chain change
  sel.addEventListener('change', () => {
    window._activeChain = sel.value;
    
    const wb = document.querySelector('.wallet-balance');
    const addrHolder = document.getElementById('addressHolder');
    const tickerEl = document.getElementById('walletTicker');
    const chainIcon = document.getElementById('chainIcon');
    
    if (window._walletResults) {
      const r = window._walletResults.find(x => x.chain === window._activeChain);
      if (r) {
        const balanceStr = r.balance || '0';
        const ticker = getTickerForChain(window._activeChain);
        
        if (wb) wb.textContent = `${balanceStr} ${ticker}`;
        if (tickerEl) tickerEl.textContent = `${ticker} Saldo`;
        
        // Update chain icon
        if (chainIcon && CHAIN_ICONS[window._activeChain]) {
          chainIcon.src = CHAIN_ICONS[window._activeChain];
          chainIcon.alt = `${window._activeChain} icon`;
          chainIcon.style.display = 'block';
        } else if (chainIcon) {
          chainIcon.style.display = 'none';
        }
        
        // Update abbreviated address
        if (addrHolder && r.address && r.address !== 'N/A') {
          addrHolder.textContent = `${abbreviateAddress(r.address)}`;
        } else if (addrHolder) {
          addrHolder.textContent = 'Indirizzo non disponibile';
        }
        // Update fiat display
        updateFiatDisplay();
      }
    }
  });
  
  // Trigger initial update
  setTimeout(() => sel.dispatchEvent(new Event('change')), 0);
}

// === UPDATE WALLET PANEL BALANCES ===

export function updateWalletPanelBalances(results) {
  const wb = document.querySelector('.wallet-balance');
  const tickerEl = document.getElementById('walletTicker');
  const addrHolder = document.getElementById('addressHolder');
  const chainIcon = document.getElementById('chainIcon');
  
  if (!wb) {
    console.warn('⚠️ wallet-balance element not found');
    return;
  }
  
  if (!results || !results.length) {
    wb.textContent = '--';
    if (tickerEl) tickerEl.textContent = 'Saldo';
    if (addrHolder) addrHolder.textContent = 'Nessun indirizzo';
    if (chainIcon) chainIcon.style.display = 'none';
    return;
  }
  
  // Show first chain balance as primary (or active chain if set)
  const activeChain = window._activeChain || results[0].chain;
  const primary = results.find(r => r.chain === activeChain) || results[0];
  const balanceStr = primary.balance || '0';
  const ticker = getTickerForChain(primary.chain);
  
  // Update chain icon
  if (chainIcon && CHAIN_ICONS[activeChain]) {
    chainIcon.src = CHAIN_ICONS[activeChain];
    chainIcon.alt = `${activeChain} icon`;
    chainIcon.style.display = 'block';
  } else if (chainIcon) {
    chainIcon.style.display = 'none';
  }
  
  wb.textContent = `${balanceStr} ${ticker}`;
  // Update fiat display after setting balance
  updateFiatDisplay();
  
  if (tickerEl) tickerEl.textContent = `${ticker} Saldo`;
  
  if (addrHolder && primary.address && primary.address !== 'N/A') {
    addrHolder.textContent = abbreviateAddress(primary.address);
  } else if (addrHolder) {
    addrHolder.textContent = 'Indirizzo non disponibile';
  }
  
  console.log(`✅ Balance aggiornato: ${balanceStr} ${ticker}`);
}

// === CURRENCY SELECTOR ===

function renderCurrencySelector() {
  const holder = document.getElementById('currencySelectHolder');
  if (!holder) return;
  holder.innerHTML = '';
  const sel = document.createElement('select');
  sel.className = 'form-select form-select-sm';
  sel.style.width = '110px';
  const current = getPreferredCurrency();
  const options = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' }
  ];
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    if (o.value === current) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    setPreferredCurrency(sel.value);
    updateFiatDisplay(true);
  });
  holder.appendChild(sel);
}

// === FIAT DISPLAY ===

async function updateFiatDisplay(force = false) {
  try {
    const fiatEl = document.getElementById('walletFiat');
    if (!fiatEl) return;
    const active = window._activeChain;
    if (!active || !window._walletResults) {
      fiatEl.textContent = '';
      return;
    }
    const r = window._walletResults.find(x => x.chain === active);
    if (!r) return;
    const num = parseFloat((r.balance || '0').toString().replace(/[^0-9.]/g, ''));
    if (!isFinite(num)) {
      fiatEl.textContent = '';
      return;
    }
    const cur = getPreferredCurrency();
    const prices = await getPrices(cur, force);
    const price = prices[active]?.[cur.toLowerCase()];
    if (!price) {
      fiatEl.textContent = '';
      return;
    }
    const val = num * price;
    const formatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: cur }).format(val);
    fiatEl.textContent = `≈ ${formatted}`;
  } catch (e) {
    console.warn('Fiat update skipped:', e);
  }
}

// === WALLET SWITCHER ===

function showWalletSwitcher() {
  const wallets = getAllWallets();
  const currentId = window._currentWalletId;
  
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '450px';
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="briefcase" class="modal-icon" style="vertical-align:middle"></i> Cambia Wallet
    </h5>
    <div class="wdk-modal-body">
      ${wallets.map(w => `
        <div class="card mb-2 ${w.id === currentId ? 'border-primary' : ''}" style="cursor:pointer" data-wallet-id="${w.id}">
          <div class="card-body py-2">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${escapeHtml(w.name)}</strong>
                ${w.id === currentId ? '<span class="badge bg-primary ms-2">Attivo</span>' : ''}
              </div>
              ${w.id !== currentId ? '<button class="btn btn-sm btn-primary switch-wallet-btn" data-wallet-id="' + w.id + '">Apri</button>' : ''}
            </div>
          </div>
        </div>
      `).join('')}
      
      <hr>
      
      <button class="btn btn-outline-secondary w-100" id="closeWalletSwitcher">
        Chiudi
      </button>
    </div>
  `;
  
  // Nest modal inside backdrop for proper centering and stacking
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // Switch wallet buttons
  modal.querySelectorAll('.switch-wallet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const walletId = btn.dataset.walletId;
      
      backdrop.remove();
      modal.remove();
      
      // Show password prompt to unlock different wallet
      window.dispatchEvent(new CustomEvent('switch-to-wallet', { detail: { walletId } }));
    });
  });
  
  document.getElementById('closeWalletSwitcher')?.addEventListener('click', () => {
    backdrop.remove();
  });
  
  // Close on outside click only
  backdrop.addEventListener('click', () => {
    backdrop.remove();
  });
  // Prevent closing when clicking inside the modal content
  modal.addEventListener('click', (e) => e.stopPropagation());
}

// === UTILITY FUNCTIONS ===

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
