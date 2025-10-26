// main.js - Entry point modulare con multi-wallet support
// Multi-wallet routing: login screen if wallets exist, wizard if none
import { CHAINS } from './config.js';
import { initToastSystem, initThemeSystem } from './modules/ui_utils.js';
import { createWizard } from './modules/wizard.js';
import { initAutoLock } from './modules/secure_storage.js';
import { hasWallets } from './modules/wallet_manager.js';
import { showLoginScreen } from './modules/login_screen.js';
// Import side-effect per registrare le azioni globali (Send/Receive)
import './modules/transactions.js';

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
            <a href="./docs/getting-started.md" target="_blank" rel="noopener">Guida</a>
            <a href="./docs/security.md" target="_blank" rel="noopener">Sicurezza</a>
          </div>
          <div class="theme-switch">
            <button id="themeAuto" class="btn btn-sm">Auto</button>
            <button id="themeLight" class="btn btn-sm">Light</button>
            <button id="themeDark" class="btn btn-sm">Dark</button>
          </div>
        </div>
      </div>
    `;
    appEl.insertAdjacentElement('afterbegin', topbar);
    // Replace feather icons now that topbar is in the DOM
    try { if (window.feather && typeof window.feather.replace === 'function') window.feather.replace(); } catch (e) {}
  }
  
  return topbar;
}

// === SETUP APP ===

function setupApp() {
  // Create topbar
  const topbar = createTopbar();
  
  // Initialize systems
  initToastSystem();
  initThemeSystem(topbar);
  
  // PWA: register service worker (best-effort)
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  } catch {}
  
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
  
  // Initialize auto-lock system
  initAutoLock();
  
  // ROUTING: Check for existing wallets
  if (hasWallets()) {
    // Show login screen
    console.log('📂 Wallets trovati - Mostra schermata login');
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

console.log('💡 Debug commands available: window.WDK_DEBUG');

// === START APP ===
setupApp();
