// main.js - Entry point modulare con multi-wallet support
// Multi-wallet routing: login screen if wallets exist, wizard if none
import 'feather-icons';
import { CHAINS, loadCustomChains } from './config.js';
import { initToastSystem, initThemeSystem, showMarkdownModal } from './modules/ui_utils.js';
import { createWizard } from './modules/wizard.js';
import { initAutoLock } from './modules/secure_storage.js';
import { hasWallets } from './modules/wallet_manager.js';
import { showLoginScreen } from './modules/login_screen.js';
// Import side-effect per registrare le azioni globali (Send/Receive)
import './modules/transactions.js';
import { showCustomManagerModal } from './modules/custom_manager.js';
import { initWalletConnect, getActiveSessions } from './modules/walletconnect.js';

// === INITIALIZATION ===

console.log('🚀 WDK Wallet - Inizializzazione...');
console.log('📦 Chains caricate:', CHAINS.map(c => c.name));

// Verifica DOM
const appEl = document.getElementById('app');
if (!appEl) {
  console.error('❌ ERRORE: #app non trovato! Controlla index.html.');
  document.body.innerHTML = '<div class="alert alert-danger m-4">Errore caricamento app.</div>';
  throw new Error('App container not found');
}

// === CREATE TOPBAR ===

import { getNetworkMode, setNetworkMode } from './modules/network.js';

function createTopbar() {
  let topbar = document.querySelector('.topbar');
  
  if (!topbar) {
    topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.innerHTML = `
      <div class="topbar-content">
        <div class="logo">
          <i data-feather="briefcase" class="logo-icon"></i>
          <span class="logo-text">WDK Wallet</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="topbar-links">
          <a href="#" id="topbarGuida">Guida</a>
          <a href="#" id="topbarSicurezza">Sicurezza</a>
          </div>
          <div class="theme-switch" id="customManagerBtn" title="Gestione Custom" style="cursor:pointer;">
            <button id="openCustomManager" class="btn btn-sm">
              <i data-feather="settings" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <div class="theme-switch">
            <button id="themeAuto" class="btn btn-sm">Auto</button>
            <button id="themeLight" class="btn btn-sm">Light</button>
            <button id="themeDark" class="btn btn-sm">Dark</button>
          </div>
          <div class="theme-switch" id="networkSwitch" title="Rete">
            <button id="netTest" class="btn btn-sm">Testnet</button>
            <button id="netMain" class="btn btn-sm">Mainnet</button>
          </div>
        </div>
      </div>
    `;
    appEl.insertAdjacentElement('afterbegin', topbar);
  }
  
    // Remove existing event listeners to prevent duplicates
    const guidaLink = topbar.querySelector('#topbarGuida');
    const sicurezzaLink = topbar.querySelector('#topbarSicurezza');
  
    if (guidaLink) {
      // Clone and replace to remove existing listeners
      const newGuidaLink = guidaLink.cloneNode(true);
      guidaLink.parentNode.replaceChild(newGuidaLink, guidaLink);
      newGuidaLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Auto-detect base path from current location
        const base = window.location.pathname.replace(/\/[^/]*$/, '/');
        showMarkdownModal('📚 Guida Introduttiva', `${base}docs/getting-started.it.md`);
      });
    }
  
    if (sicurezzaLink) {
      // Clone and replace to remove existing listeners
      const newSicurezzaLink = sicurezzaLink.cloneNode(true);
      sicurezzaLink.parentNode.replaceChild(newSicurezzaLink, sicurezzaLink);
      newSicurezzaLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Auto-detect base path from current location
        const base = window.location.pathname.replace(/\/[^/]*$/, '/');
        showMarkdownModal('🔒 Guida alla Sicurezza', `${base}docs/security.it.md`);
      });
    }

    // Custom Manager button
    const customBtn = topbar.querySelector('#customManagerBtn');
    if (customBtn) {
      customBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showCustomManagerModal();
      });
    }
    
    // Network buttons
    const netTestBtn = topbar.querySelector('#netTest');
    const netMainBtn = topbar.querySelector('#netMain');
    
    function updateNetworkButtons() {
      const mode = getNetworkMode();
      if (netTestBtn) netTestBtn.classList.toggle('active', mode === 'testnet');
      if (netMainBtn) netMainBtn.classList.toggle('active', mode === 'mainnet');
    }
    
    updateNetworkButtons();
    
    if (netTestBtn) {
      netTestBtn.addEventListener('click', () => {
        setNetworkMode('testnet');
        updateNetworkButtons();
      });
    }
    if (netMainBtn) {
      netMainBtn.addEventListener('click', () => {
        setNetworkMode('mainnet');
        updateNetworkButtons();
      });
    }
  
  return topbar;
}

// === SETUP APP ===

async function setupApp() {
  // Load custom chains
  await loadCustomChains();
  
  // Create topbar
  const topbar = createTopbar();
  
  // Initialize systems
  initToastSystem();
  
  // Initialize WalletConnect
  await initWalletConnect();
  
  // Initialize WalletConnect counter
  updateWalletConnectCounter();
  
  // Replace feather icons BEFORE initializing theme system (so buttons exist in DOM)
  try { 
    if (window.feather && typeof window.feather.replace === 'function') {
      window.feather.replace(); 
    }
  } catch (e) { console.warn('Feather icons not loaded:', e); }
  
  // Now initialize theme system (buttons are in DOM after feather.replace)
  initThemeSystem(topbar);
  
  // PWA: register service worker (best-effort)
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  } catch {
    // Ignore service worker registration errors
  }
  
  // PWA: handle install prompt
  window._pwaInstallAvailable = false;
  window._pwaDeferredPrompt = null;
  window.promptPWAInstall = async () => {
    if (!window._pwaDeferredPrompt) return false;
    const evt = window._pwaDeferredPrompt;
    evt.prompt();
    const choice = await evt.userChoice.catch(() => null);
    window._pwaDeferredPrompt = null;
    window._pwaInstallAvailable = false;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
    return choice && choice.outcome === 'accepted';
  };
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._pwaDeferredPrompt = e;
    window._pwaInstallAvailable = true;
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    window._pwaDeferredPrompt = null;
    window._pwaInstallAvailable = false;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
  
  // Initialize global state
  window.walletState = window.walletState || {};
  window._walletResults = window._walletResults || [];
  window._chains = { CHAINS };
  
  // Initialize auto-lock system
  initAutoLock().catch(console.error);
  
    // Attach event listeners to footer documentation links (prevent duplicates)
    const footerGuida = document.getElementById('footerGuida');
    const footerSicurezza = document.getElementById('footerSicurezza');
  
    if (footerGuida) {
      // Clone and replace to remove existing listeners
      const newFooterGuida = footerGuida.cloneNode(true);
      footerGuida.parentNode.replaceChild(newFooterGuida, footerGuida);
      newFooterGuida.addEventListener('click', (e) => {
        e.preventDefault();
        // Auto-detect base path from current location
        const base = window.location.pathname.replace(/\/[^/]*$/, '/');
        showMarkdownModal('📚 Guida Introduttiva', `${base}docs/getting-started.it.md`);
      });
    }
  
    if (footerSicurezza) {
      // Clone and replace to remove existing listeners
      const newFooterSicurezza = footerSicurezza.cloneNode(true);
      footerSicurezza.parentNode.replaceChild(newFooterSicurezza, footerSicurezza);
      newFooterSicurezza.addEventListener('click', (e) => {
        e.preventDefault();
        // Auto-detect base path from current location
        const base = window.location.pathname.replace(/\/[^/]*$/, '/');
        showMarkdownModal('🔒 Guida alla Sicurezza', `${base}docs/security.it.md`);
      });
    }
  
  // ROUTING: Check for existing wallets
  async function checkForExistingWallet() {
    // Check localStorage wallets first
    if (hasWallets()) {
      return 'localStorage';
    }
    
    // Check chrome.storage if in extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      try {
        const result = await chrome.storage.local.get('wdk_wallet_metadata');
        if (result['wdk_wallet_metadata']?.hasEncryptedSeed) {
          return 'chromeStorage';
        }
      } catch (error) {
        console.error('Error checking chrome storage:', error);
      }
    }
    
    // Try to communicate with extension if opened from extension URL
    if (window.location.protocol === 'chrome-extension:') {
      try {
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ action: 'hasStoredSeed' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
        if (response) {
          return 'extensionCommunication';
        }
      } catch (error) {
        console.error('Error communicating with extension:', error);
      }
    }
    
    return null;
  }
  
  checkForExistingWallet().then(walletSource => {
    if (walletSource) {
      // Show login screen
      console.log(`📂 Wallet trovato in ${walletSource} - Mostra schermata login`);
      showLoginScreen();
    
    // Listen for wallet unlocked event
    window.addEventListener('wallet-unlocked', (e) => {
      const { seed } = e.detail;
      
      // Clear login screen
      appEl.innerHTML = '';
      
      // Recreate topbar
      createTopbar();
      
      // Create status card
      const statusCard = document.createElement('div');
      statusCard.className = 'card bg-light mt-3';
      statusCard.innerHTML = '<div class="card-body"><p class="card-text">Wallet sbloccato! Inizializzazione in corso...</p></div>';
      appEl.appendChild(statusCard);
      
      // Initialize wallet with unlocked seed
      import('./modules/wallet_init.js').then(({ initializeWalletFromSeed }) => {
        initializeWalletFromSeed(seed);
      });
    });
    
    // Listen for create new wallet event
    window.addEventListener('start-wallet-creation', () => {
      // Clear login screen
      appEl.innerHTML = '';
      
      // Recreate topbar
      createTopbar();
      
      // Create status card
      const statusCard = document.createElement('div');
      statusCard.className = 'card bg-light mt-3';
      statusCard.innerHTML = '<div class="card-body"><p class="card-text">Pronto per generare seed e inizializzare wallet multi-chain!</p></div>';
      appEl.appendChild(statusCard);
      
      // Create wizard container
      const wizardContainer = document.createElement('div');
      wizardContainer.className = 'wizard-container';
      appEl.appendChild(wizardContainer);
      
      // Initialize wizard
      createWizard(wizardContainer);
    });
    
    // Listen for wallet switcher
    window.addEventListener('switch-to-wallet', (e) => {
      const { walletId } = e.detail;
      
      // Show password prompt by simulating click on wallet (reuse login screen logic)
      // For now, just reload to login screen
      location.reload();
    });
    
    } else {
      // No wallets - show wizard to create first wallet
      console.log('📂 Nessun wallet trovato - Mostra wizard creazione');
      
      // Create status card
      const statusCard = document.createElement('div');
      statusCard.className = 'card bg-light mt-3';
      statusCard.innerHTML = '<div class="card-body"><p class="card-text">Benvenuto! Crea il tuo primo wallet.</p></div>';
      appEl.appendChild(statusCard);
      
      // Create wizard container
      const wizardContainer = document.createElement('div');
      wizardContainer.className = 'wizard-container';
      appEl.appendChild(wizardContainer);
      
      // Initialize wizard
      createWizard(wizardContainer);
    }
    
    console.log('✅ App inizializzata con successo');
  }).catch(error => {
    console.error('Error during wallet check:', error);
    // Fallback: show error
    const statusCard = document.createElement('div');
    statusCard.className = 'card bg-light mt-3';
    statusCard.innerHTML = '<div class="card-body"><p class="card-text">Errore durante l\'inizializzazione. Ricarica la pagina.</p></div>';
    appEl.appendChild(statusCard);
  });
}

// === GLOBAL HELPERS (for console debugging) ===

// Esponi alcune funzioni globali per debugging
window.WDK_DEBUG = {
  version: '1.01',
  chains: CHAINS.map(c => c.name),
  reset: () => {
    localStorage.clear();
    location.reload();
  }
};

// Global function for WalletConnect counter updates
window.updateWalletConnectCounter = updateWalletConnectCounter;

console.log('💡 Debug commands available: window.WDK_DEBUG');

// === WALLET CONNECT MODAL ===

async function showWalletConnectModal() {
  const sessions = getActiveSessions();
  const isReady = isWalletConnectReady();

  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '600px';

  let qrHtml = '';
  if (isReady && sessions.length === 0) {
    const uri = await getPairingURI();
    if (uri) {
      const qrDataUrl = await QRCode.toDataURL(uri, { width: 256, height: 256 });
      qrHtml = `
        <div class="text-center py-4">
          <h6>Connetti una dApp</h6>
          <p class="text-muted small mb-3">Scansiona questo QR code con una dApp per connetterti</p>
          <img src="${qrDataUrl}" alt="WalletConnect QR" style="max-width:100%;border-radius:8px;">
          <p class="text-muted small mt-3">O copia questo URI:</p>
          <code class="small" style="word-break:break-all;">${uri}</code>
        </div>
      `;
    }
  }

  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="link" class="modal-icon" style="vertical-align:middle"></i> WalletConnect
    </h5>
    <div class="wdk-modal-body">
      ${!isReady ? `
        <div class="alert alert-warning">
          <i data-feather="alert-triangle" class="me-2"></i>
          WalletConnect non è ancora inizializzato. Riprova tra qualche istante.
        </div>
      ` : sessions.length === 0 ? qrHtml || `
        <div class="text-center py-4">
          <i data-feather="link" style="width:48px;height:48px;color:var(--text-muted);"></i>
          <h6 class="mt-3">Nessuna connessione attiva</h6>
          <p class="text-muted">Scansiona un QR code da un'applicazione per connetterti</p>
        </div>
      ` : `
        <div class="mb-3">
          <h6>Connessioni attive (${sessions.length})</h6>
          ${sessions.map(session => `
            <div class="card mb-2">
              <div class="card-body py-2">
                <div class="d-flex align-items-center">
                  <img src="${session.peer.metadata.icons[0]}" alt="${session.peer.metadata.name}"
                       style="width:32px;height:32px;border-radius:6px;margin-right:12px;">
                  <div class="flex-grow-1">
                    <strong>${session.peer.metadata.name}</strong>
                    <div class="small text-muted">${session.peer.metadata.url}</div>
                  </div>
                  <button class="btn btn-sm btn-outline-danger disconnect-session"
                          data-topic="${session.topic}">
                    <i data-feather="x" style="width:14px;height:14px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      ${isReady && sessions.length === 0 ? `
        <div class="text-center">
          <p class="text-muted small mb-3">
            Le connessioni WalletConnect vengono gestite automaticamente quando un'app richiede l'accesso al wallet.
          </p>
        </div>
      ` : ''}
    </div>
    <div class="wdk-modal-actions">
      <button class="btn btn-secondary" id="closeWCModal">Chiudi</button>
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Handle disconnect buttons
  modal.querySelectorAll('.disconnect-session').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const topic = btn.dataset.topic;
      await disconnectSession(topic);
      updateWalletConnectCounter();
      showWalletConnectModal(); // Refresh modal
    });
  });

  document.getElementById('closeWCModal').onclick = () => {
    backdrop.remove();
  };

  // Replace feather icons
  if (window.feather) window.feather.replace();
}

function updateWalletConnectCounter() {
  const sessions = getActiveSessions();
  const counter = document.getElementById('wcStatus');
  if (counter) {
    if (sessions.length > 0) {
      counter.textContent = sessions.length;
      counter.classList.remove('d-none');
    } else {
      counter.classList.add('d-none');
    }
  }
}

// === START APP ===
setupApp().catch(console.error);
