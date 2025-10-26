// modules/ui-utils.js - UI utilities (toast, modal, theme)

// === TOAST SYSTEM ===

let toastWrap = null;

export function initToastSystem() {
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
}

export function showNotification(type, message, timeout = 4000) {
  if (!toastWrap) initToastSystem();
  
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-body">${message}</div>`;
  toastWrap.appendChild(el);
  
  requestAnimationFrame(() => el.classList.add('show'));
  if (timeout > 0) setTimeout(() => hideToast(el), timeout);
  return el;
}

export function hideToast(el) {
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => el.remove(), 260);
}

// === AJAX HELPER ===

export async function ajaxAction(promiseFactory, {
  pendingMsg = 'In corso…',
  successMsg = 'Fatto',
  errorMsg = 'Errore'
} = {}) {
  const t = showNotification('info', pendingMsg, 0);
  try {
    const res = await promiseFactory();
    hideToast(t);
    showNotification('success', successMsg);
    return res;
  } catch (err) {
    hideToast(t);
    showNotification('error', `${errorMsg}: ${err.message || err}`);
    throw err;
  }
}

// === MODAL SYSTEM ===

export function showModal(contentEl) {
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.appendChild(contentEl);
  backdrop.appendChild(modal);
  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.remove();
  };
  document.body.appendChild(backdrop);
  return { backdrop, modal };
}

// === MARKDOWN DOCUMENTATION MODAL ===

export async function showMarkdownModal(title, mdPath) {
  try {
    // Fetch markdown file
    const response = await fetch(mdPath);
    if (!response.ok) {
      throw new Error(`Impossibile caricare ${mdPath}`);
    }
    const markdown = await response.text();
    
    // Parse markdown to HTML using Marked.js
    const htmlContent = marked.parse(markdown);
    
    // Create modal structure
    const modalContent = document.createElement('div');
    modalContent.className = 'markdown-modal-content';
    modalContent.innerHTML = `
      <div class="markdown-modal-header">
        <h2>${title}</h2>
        <button class="markdown-modal-close" aria-label="Chiudi">×</button>
      </div>
      <div class="markdown-modal-body markdown-content">
        ${htmlContent}
      </div>
    `;
    
    // Show modal
    const { backdrop } = showModal(modalContent);
    
    // Close button handler
    const closeBtn = modalContent.querySelector('.markdown-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => backdrop.remove());
    }
    
    return backdrop;
  } catch (error) {
    showNotification('error', `Errore caricamento documentazione: ${error.message}`);
    throw error;
  }
}

// === THEME SYSTEM ===

export function initThemeSystem(topbar) {
  // Apply stored theme
  const storedTheme = localStorage.getItem('theme') || 'auto';
  applyTheme(storedTheme);
  
  // Get theme buttons
  const themeAutoBtn = topbar.querySelector('#themeAuto');
  const themeLightBtn = topbar.querySelector('#themeLight');
  const themeDarkBtn = topbar.querySelector('#themeDark');
  
  // Set initial active button
  setActiveThemeButton(storedTheme, themeAutoBtn, themeLightBtn, themeDarkBtn);
  
  // Attach event listeners
  if (themeAutoBtn) {
    themeAutoBtn.addEventListener('click', () => {
      applyTheme('auto');
      setActiveThemeButton('auto', themeAutoBtn, themeLightBtn, themeDarkBtn);
    });
  }
  if (themeLightBtn) {
    themeLightBtn.addEventListener('click', () => {
      applyTheme('light');
      setActiveThemeButton('light', themeAutoBtn, themeLightBtn, themeDarkBtn);
    });
  }
  if (themeDarkBtn) {
    themeDarkBtn.addEventListener('click', () => {
      applyTheme('dark');
      setActiveThemeButton('dark', themeAutoBtn, themeLightBtn, themeDarkBtn);
    });
  }
}

function applyTheme(name) {
  const html = document.documentElement;
  if (name === 'auto') {
    html.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    html.setAttribute('data-theme', name);
    localStorage.setItem('theme', name);
  }
}

function setActiveThemeButton(name, autoBtn, lightBtn, darkBtn) {
  [autoBtn, lightBtn, darkBtn].forEach(b => b && b.classList.remove('active'));
  if (name === 'auto' && autoBtn) autoBtn.classList.add('active');
  if (name === 'light' && lightBtn) lightBtn.classList.add('active');
  if (name === 'dark' && darkBtn) darkBtn.classList.add('active');
}

// === UTILITY FUNCTIONS ===

export function maskSeed(mnemonic) {
  if (!mnemonic) return '';
  const parts = mnemonic.split(' ');
  if (parts.length <= 4) return '****';
  return `${parts.slice(0, 2).join(' ')} ... ${parts.slice(-2).join(' ')}`;
}

export function abbreviateAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function getTickerForChain(name) {
  const map = {
    ethereum: 'ETH',
    polygon: 'POL',
    bsc: 'BNB',
    solana: 'SOL',
    ton: 'TON',
    litecoin: 'LTC',
    bitcoin: 'BTC'
  };
  return map[name] || name.toUpperCase();
}
