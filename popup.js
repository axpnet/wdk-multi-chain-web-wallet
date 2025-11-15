// popup.js - Enhanced popup for WDK Wallet extension

let currentNetwork = 'mainnet';
let currentChain = 'ethereum';

// Chain icons mapping
const CHAIN_ICONS = {
  ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  polygon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  bsc: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
};

// Chain display names
const CHAIN_NAMES = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  bsc: 'BSC',
  optimism: 'Optimism',
  base: 'Base',
  arbitrum: 'Arbitrum',
  solana: 'Solana',
  ton: 'TON'
};

// Chain currencies
const CHAIN_CURRENCIES = {
  ethereum: 'ETH',
  polygon: 'MATIC',
  bsc: 'BNB',
  optimism: 'ETH',
  base: 'ETH',
  arbitrum: 'ETH',
  solana: 'SOL',
  ton: 'TON'
};

// Chain IDs mapping
const CHAIN_IDS = {
  ethereum: '0x1',
  polygon: '0x89',
  bsc: '0x38',
  optimism: '0xa',
  base: '0x2105',
  arbitrum: '0xa4b1',
  solana: 'solana'
};

function getChainId(chainName) {
  return CHAIN_IDS[chainName] || '0x1';
}

async function initializePopup() {
  try {
    console.log('🔍 Initializing popup...');
    // Check if current tab is the wallet web app
    const isWalletWebApp = await checkIfWalletWebApp();
    console.log('🔍 Is wallet web app:', isWalletWebApp);
    
    if (isWalletWebApp) {
      // Check if wallet is already active in the web app
      const isWalletActive = await checkIfWalletActive();
      console.log('🔍 Is wallet active:', isWalletActive);
      
      if (isWalletActive) {
        // Show interface for interacting with active wallet
        await showActiveWalletState();
        return;
      }
    }

    // Normal extension logic
    console.log('🔍 Checking extension state...');
    // Check if background script is ready
    const hasSeed = await chrome.runtime.sendMessage({ action: 'hasStoredSeed' });
    const isUnlocked = await chrome.runtime.sendMessage({ action: 'isUnlocked' });
    console.log('🔍 Extension hasSeed:', hasSeed, 'isUnlocked:', isUnlocked);

    hideAllStates();

    if (!hasSeed) {
      showCreateWalletState();
    } else if (!isUnlocked) {
      showLockedState();
    } else {
      await showUnlockedState();
    }

    // Initialize chain selector
    initializeChainSelector();

    // Initialize dApp connection status
    updateDappStatus();
  } catch (error) {
    console.error('Error initializing popup:', error);
    showErrorState('Error loading wallet');
  }
}

function hideAllStates() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('lockedState').style.display = 'none';
  document.getElementById('unlockedState').style.display = 'none';
}

function showCreateWalletState() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('lockedState').style.display = 'none';
  document.getElementById('unlockedState').style.display = 'none';
  
  // Show create wallet message
  const loadingState = document.getElementById('loadingState');
  loadingState.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 20px;">👛</div>
      <h4 style="margin-bottom: 16px;">Nessun Wallet Trovato</h4>
      <p style="color: #666; margin-bottom: 24px;">Crea il tuo primo wallet per iniziare</p>
      <button class="btn btn-primary" id="createWalletFromPopup">Crea Wallet</button>
    </div>
  `;
  loadingState.style.display = 'block';
  
  // Add event listener
  setTimeout(() => {
    const btn = document.getElementById('createWalletFromPopup');
    if (btn) {
      btn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
      });
    }
  }, 100);
}

function showLockedState() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('lockedState').style.display = 'block';
  document.getElementById('unlockedState').style.display = 'none';

  // Focus on password input
  setTimeout(() => {
    document.getElementById('unlockPassword').focus();
  }, 100);
}

async function showUnlockedState() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('lockedState').style.display = 'none';
  document.getElementById('unlockedState').style.display = 'block';

  try {
    // Get wallet data from background
    const accounts = await chrome.runtime.sendMessage({ action: 'getCurrentAccounts' });
    const chainId = await chrome.runtime.sendMessage({ action: 'getCurrentChainId' });

    if (accounts && accounts.length > 0) {
      const address = accounts[0];
      document.getElementById('walletAddress').textContent =
        `${address.slice(0, 6)}...${address.slice(-4)}`;

      // Get balance for current chain
      await updateBalance();
    }

    // Update network buttons
    updateNetworkButtons();
  } catch (error) {
    console.error('Error loading wallet data:', error);
  }
}

function showErrorState(message) {
  document.getElementById('loadingState').innerHTML = `
    <div style="text-align: center; padding: 40px; color: #dc3545;">
      <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 20px;">Retry</button>
    </div>
  `;
}

async function updateBalance() {
  try {
    const balance = await chrome.runtime.sendMessage({
      action: 'getBalance',
      chain: currentChain
    });

    if (balance) {
      const ethBalance = parseFloat(balance) / 1e18; // Convert from wei
      document.getElementById('walletBalance').textContent =
        `${ethBalance.toFixed(4)}`;
      document.getElementById('balanceCurrency').textContent = CHAIN_CURRENCIES[currentChain];
      document.getElementById('balanceLabel').textContent = `${CHAIN_NAMES[currentChain]} Balance`;
    }

    // Update chain icon
    updateChainIcon();
  } catch (error) {
    console.error('Error getting balance:', error);
    document.getElementById('walletBalance').textContent = 'Unable to load';
  }
}

function updateChainIcon() {
  const chainIcon = document.getElementById('chainIcon');
  if (chainIcon && CHAIN_ICONS[currentChain]) {
    chainIcon.src = CHAIN_ICONS[currentChain];
    chainIcon.alt = `${CHAIN_NAMES[currentChain]} icon`;
  }
}

function updateNetworkButtons() {
  const buttons = document.querySelectorAll('.network-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.network === currentNetwork);
  });
}

async function initializeChainSelector() {
  try {
    // Get available chains from background
    const chains = await chrome.runtime.sendMessage({ action: 'getAvailableChains' });
    
    const select = document.getElementById('chainSelect');
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add chain options
    chains.forEach(chain => {
      const option = document.createElement('option');
      option.value = chain.name;
      option.textContent = chain.displayName || chain.name;
      select.appendChild(option);
    });
    
    // Set current chain
    select.value = currentChain;
    
    // Update chain display
    updateChainIcon();
    
    // Event listener
    select.addEventListener('change', async (e) => {
      currentChain = e.target.value;
      updateChainIcon();
      
      // Switch chain in background
      try {
        await chrome.runtime.sendMessage({
          action: 'switchChain',
          chain: currentChain,
          chainId: getChainId(currentChain)
        });
        await updateBalance();
      } catch (error) {
        console.error('Chain switch error:', error);
      }
    });
  } catch (error) {
    console.error('Error initializing chain selector:', error);
  }
}

function updateDappStatus() {
  const dappStatus = document.getElementById('dappStatus');
  if (dappStatus) {
    // For now, assume no active dApp connection
    // TODO: Check actual dApp connection status from background
    dappStatus.classList.remove('connected');
  }
}

// Check if current tab is the wallet web app
async function checkIfWalletWebApp() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab) return false;
    
    const url = currentTab.url;
    
    // Check if it's the wallet web app
    const isWalletUrl = url.includes('wallet-multichain') || 
                       url.includes('index.html') || 
                       url.startsWith('chrome-extension://') && url.includes('index.html') ||
                       url.includes('localhost') && url.includes('index.html') ||
                       url.includes('127.0.0.1') && url.includes('index.html');
    
    // Also check if the page has wallet-specific content
    if (isWalletUrl) {
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: () => {
            return !!(window.WDK_DEBUG || document.title.includes('WDK Wallet'));
          }
        });
        return result && result[0] && result[0].result;
      } catch (error) {
        // If we can't execute script, fall back to URL check
        return isWalletUrl;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if wallet web app:', error);
    return false;
  }
}

// Check if wallet is already active in the current tab
async function checkIfWalletActive() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab) return false;
    
    // Try to execute script in the current tab to check if wallet is active
    const result = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: () => {
        // Check for wallet-specific global variables and localStorage
        const hasWalletDebug = !!window.WDK_DEBUG;
        const hasWalletSeed = !!(window.localStorage && 
          (localStorage.getItem('wdk_wallet_seed') || 
           localStorage.getItem('wdk_wallet_metadata')));
        const hasWalletSession = !!window._currentSeed; // Set when wallet is unlocked
        const hasWalletUI = !!document.querySelector('#app') && 
          (document.querySelector('.wallet-container') ||
           document.querySelector('.wallet-ui') ||
           document.querySelector('.chain-selector') ||
           document.querySelector('.topbar'));
        
        // Check if wallet initialization has completed
        const isWalletInitialized = hasWalletDebug && (hasWalletSeed || hasWalletSession);
        
        console.log('🔍 Wallet detection:', {
          hasWalletDebug,
          hasWalletSeed,
          hasWalletSession,
          hasWalletUI,
          isWalletInitialized
        });
        
        return isWalletInitialized;
      }
    });
    
    return result && result[0] && result[0].result;
  } catch (error) {
    console.error('Error checking if wallet active:', error);
    return false;
  }
}

// Show interface for interacting with active wallet
async function showActiveWalletState() {
  hideAllStates();
  
  const unlockedState = document.getElementById('unlockedState');
  unlockedState.innerHTML = `
    <div class="text-center p-3">
      <div style="font-size: 32px; margin-bottom: 16px;">🔓</div>
      <h4 style="margin-bottom: 8px;">Wallet Attivo</h4>
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        Il wallet è già attivo in questa pagina
      </p>
      <button class="btn btn-primary w-100 mb-2" id="focusWalletBtn">
        <i data-feather="eye" style="width:16px;height:16px;margin-right:8px;"></i>
        Vai al Wallet
      </button>
      <button class="btn btn-outline-secondary w-100" id="openNewWalletBtn">
        <i data-feather="plus" style="width:16px;height:16px;margin-right:8px;"></i>
        Apri Nuovo Wallet
      </button>
    </div>
  `;
  
  unlockedState.style.display = 'block';
  
  // Add event listeners
  setTimeout(() => {
    const focusBtn = document.getElementById('focusWalletBtn');
    const newBtn = document.getElementById('openNewWalletBtn');
    
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { active: true });
            // Scroll to wallet content if needed
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: () => {
                const walletEl = document.querySelector('.wallet-container') || 
                               document.querySelector('.wallet-ui') ||
                               document.querySelector('#app');
                if (walletEl) {
                  walletEl.scrollIntoView({ behavior: 'smooth' });
                }
              }
            });
          }
        });
        window.close();
      });
    }
    
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
      });
    }
    
    // Replace feather icons
    if (window.feather) window.feather.replace();
  }, 100);
}

// Event listeners
document.getElementById('unlockBtn').addEventListener('click', async () => {
  const password = document.getElementById('unlockPassword').value;
  if (!password) {
    alert('Please enter your password');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'unlockWallet',
      password: password
    });

    if (response && response.success) {
      await showUnlockedState();
    } else {
      alert('Incorrect password');
    }
  } catch (error) {
    console.error('Unlock error:', error);
    alert('Error unlocking wallet: ' + error.message);
  }
});

document.getElementById('createWalletBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

document.getElementById('sendBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

document.getElementById('receiveBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

document.getElementById('openFullWalletBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

document.getElementById('lockWalletBtn').addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'lockWallet' });
    showLockedState();
  } catch (error) {
    console.error('Lock error:', error);
  }
});

document.getElementById('addChainBtn').addEventListener('click', () => {
  // For now, show a simple alert about adding chains
  // TODO: Implement proper chain addition dialog
  alert('Aggiunta di nuove chain EVM sarà disponibile nella prossima versione.\n\nChain attualmente supportate:\n• Ethereum\n• Polygon\n• BSC');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  // For now, open full wallet for settings
  // TODO: Implement popup settings dialog
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

// Network switching
document.querySelectorAll('.network-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const network = btn.dataset.network;
    try {
      await chrome.runtime.sendMessage({
        action: 'switchNetwork',
        network: network
      });
      currentNetwork = network;
      updateNetworkButtons();
      await updateBalance();
    } catch (error) {
      console.error('Network switch error:', error);
    }
  });
});

// Enter key support for unlock
document.getElementById('unlockPassword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('unlockBtn').click();
  }
});

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initializePopup);