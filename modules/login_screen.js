// modules/login_screen.js - Login and wallet selection UI

import { getAllWallets, setActiveWallet, formatLastAccess } from './wallet_manager.js';
import { decryptData } from './secure_storage.js';
import { showNotification } from './ui_utils.js';

// === LOGIN SCREEN RENDERING ===

/**
 * Show login/wallet selection screen
 */
export function showLoginScreen() {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  
  const wallets = getAllWallets();
  
  appEl.innerHTML = `
    <div class="login-screen" style="max-width:600px;margin:40px auto;padding:24px">
      <div class="text-center mb-4">
        <h2 style="font-weight:700;margin-bottom:12px">💼 WDK Multi-Wallet</h2>
        <p class="text-muted">Seleziona un wallet per accedere o creane uno nuovo</p>
      </div>
      
      ${wallets.length > 0 ? `
        <div class="wallets-list mb-4">
          ${wallets.map(wallet => `
            <div class="wallet-item card mb-3" style="cursor:pointer;transition:all 0.2s" data-wallet-id="${wallet.id}">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-1" style="font-weight:600">
                      ${getWalletIcon(wallet.name)} ${escapeHtml(wallet.name)}
                    </h5>
                    <small class="text-muted">
                      Ultimo accesso: ${formatLastAccess(wallet.lastAccess)}
                    </small>
                  </div>
                  <button class="btn btn-primary btn-open-wallet" data-wallet-id="${wallet.id}">
                    🔑 Apri
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="alert alert-info text-center mb-4">
          <h5>👋 Benvenuto!</h5>
          <p class="mb-0">Nessun wallet trovato. Crea il tuo primo wallet per iniziare.</p>
        </div>
      `}
      
      <div class="text-center">
        <button class="btn btn-success btn-lg w-100" id="createNewWalletBtn">
          ➕ Crea Nuovo Wallet
        </button>
      </div>
    </div>
  `;
  
  // Event listeners
  document.querySelectorAll('.btn-open-wallet').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const walletId = btn.dataset.walletId;
      showPasswordPrompt(walletId);
    });
  });
  
  // Card click also opens wallet
  document.querySelectorAll('.wallet-item').forEach(card => {
    card.addEventListener('click', () => {
      const walletId = card.dataset.walletId;
      showPasswordPrompt(walletId);
    });
  });
  
  document.getElementById('createNewWalletBtn')?.addEventListener('click', () => {
    // Trigger wizard to create new wallet
    window.dispatchEvent(new CustomEvent('start-wallet-creation'));
  });
  
  // Hover effect
  document.querySelectorAll('.wallet-item').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '';
    });
  });
}

/**
 * Show password prompt to unlock wallet
 * @param {string} walletId - Wallet UUID
 */
function showPasswordPrompt(walletId) {
  const wallets = getAllWallets();
  const wallet = wallets.find(w => w.id === walletId);
  
  if (!wallet) {
    showNotification('Wallet non trovato', 'error');
    return;
  }
  
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '400px';
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      🔐 Sblocca Wallet
    </h5>
    <div class="wdk-modal-body">
      <div class="mb-3">
        <h6 style="font-weight:600">${escapeHtml(wallet.name)}</h6>
        <small class="text-muted">Inserisci la password per accedere</small>
      </div>
      
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" id="unlockPassword" 
               placeholder="Inserisci password" autocomplete="current-password">
      </div>
      
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary flex-grow-1" id="cancelUnlockBtn">
          Annulla
        </button>
        <button class="btn btn-primary flex-grow-1" id="confirmUnlockBtn">
          🔓 Sblocca
        </button>
      </div>
    </div>
  `;
  
  // Center modal inside backdrop and ensure correct stacking
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  const passwordInput = document.getElementById('unlockPassword');
  passwordInput.focus();
  
  // Handle unlock
  const attemptUnlock = async () => {
    const password = passwordInput.value.trim();
    
    if (!password) {
      showNotification('Inserisci una password', 'warning');
      return;
    }
    
    try {
      // Try to decrypt seed with password
      const decryptedSeed = await decryptData(wallet.encryptedSeed, password, wallet.salt, wallet.iv);
      
      if (!decryptedSeed) {
        showNotification('Password errata', 'error');
        passwordInput.value = '';
        passwordInput.focus();
        return;
      }
      
      // Success! Set as active wallet
      setActiveWallet(walletId);
      
      // Store decrypted seed in memory for current session
      window._currentSeed = decryptedSeed;
      window._currentWalletId = walletId;
      window._currentWalletName = wallet.name;
      
      backdrop.remove();
      modal.remove();
      
      showNotification(`Benvenuto in ${wallet.name}!`, 'success');
      
      // Trigger wallet initialization
      window.dispatchEvent(new CustomEvent('wallet-unlocked', { 
        detail: { walletId, seed: decryptedSeed, name: wallet.name }
      }));
      
    } catch (error) {
      console.error('❌ Unlock error:', error);
      showNotification('Errore durante lo sblocco del wallet', 'error');
    }
  };
  
  document.getElementById('confirmUnlockBtn').addEventListener('click', attemptUnlock);
  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptUnlock();
  });
  
  document.getElementById('cancelUnlockBtn').addEventListener('click', () => {
    backdrop.remove();
  });
  
  // Close when clicking outside the modal
  backdrop.addEventListener('click', () => {
    backdrop.remove();
  });
  // Prevent clicks inside the modal from closing it
  modal.addEventListener('click', (e) => e.stopPropagation());
}

/**
 * Get emoji icon based on wallet name
 * @param {string} name - Wallet name
 * @returns {string} Emoji
 */
function getWalletIcon(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('trading') || lowerName.includes('trade')) return '📈';
  if (lowerName.includes('saving') || lowerName.includes('risparmio')) return '🏦';
  if (lowerName.includes('personal') || lowerName.includes('personale')) return '👤';
  if (lowerName.includes('business') || lowerName.includes('lavoro')) return '💼';
  if (lowerName.includes('test')) return '🧪';
  
  return '🔵';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
