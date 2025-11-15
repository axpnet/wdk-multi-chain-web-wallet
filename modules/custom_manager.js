// modules/custom_manager.js - Gestione custom chains e tokens

import { showNotification } from './ui_utils.js';
import { 
  saveCustomChain, 
  removeCustomChain, 
  getCustomChains,
  saveCustomToken,
  removeCustomToken,
  getCustomTokens,
  getCustomTokensForChain
} from './secure_storage.js';

/**
 * Mostra il modal per gestire custom chains e tokens
 */
export async function showCustomManagerModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '800px';
  modal.style.maxHeight = '80vh';
  modal.style.overflow = 'auto';
  
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="settings" class="modal-icon" style="vertical-align:middle"></i> Gestione Custom
    </h5>
    <div class="wdk-modal-body">
      <div class="mb-4">
        <ul class="nav nav-tabs" id="customTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="chains-tab" data-bs-toggle="tab" data-bs-target="#chains" type="button" role="tab">
              <i data-feather="globe" style="width:16px;height:16px;margin-right:8px;"></i>Chains
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tokens-tab" data-bs-toggle="tab" data-bs-target="#tokens" type="button" role="tab">
              <i data-feather="dollar-sign" style="width:16px;height:16px;margin-right:8px;"></i>Tokens
            </button>
          </li>
        </ul>
        
        <div class="tab-content mt-3" id="customTabsContent">
          <!-- Chains Tab -->
          <div class="tab-pane fade show active" id="chains" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Custom Chains EVM</h6>
              <button class="btn btn-primary btn-sm" id="addChainBtn">
                <i data-feather="plus" style="width:14px;height:14px;"></i> Aggiungi Chain
              </button>
            </div>
            <div id="chainsList" class="chains-list">
              <div class="text-center text-muted py-4">
                <i data-feather="loader" class="mb-2" style="width:24px;height:24px;"></i>
                <div>Caricamento chains...</div>
              </div>
            </div>
          </div>
          
          <!-- Tokens Tab -->
          <div class="tab-pane fade" id="tokens" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Custom Tokens ERC-20</h6>
              <button class="btn btn-primary btn-sm" id="addTokenBtn">
                <i data-feather="plus" style="width:14px;height:14px;"></i> Aggiungi Token
              </button>
            </div>
            <div id="tokensList" class="tokens-list">
              <div class="text-center text-muted py-4">
                <i data-feather="loader" class="mb-2" style="width:24px;height:24px;"></i>
                <div>Caricamento tokens...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wdk-modal-actions">
      <button class="btn btn-secondary" id="closeCustomModal">Chiudi</button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // Load data
  await loadChainsList();
  await loadTokensList();
  
  // Event listeners
  document.getElementById('addChainBtn').addEventListener('click', () => showAddChainModal());
  document.getElementById('addTokenBtn').addEventListener('click', () => showAddTokenModal());
  document.getElementById('closeCustomModal').addEventListener('click', () => backdrop.remove());
  
  // Replace icons
  if (window.feather) window.feather.replace();
}

/**
 * Carica e mostra la lista delle custom chains
 */
async function loadChainsList() {
  const container = document.getElementById('chainsList');
  if (!container) return;
  
  try {
    const customChains = await getCustomChains();
    
    if (customChains.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i data-feather="globe" class="mb-2" style="width:32px;height:32px;"></i>
          <div>Nessuna custom chain aggiunta</div>
          <small>Clicca "Aggiungi Chain" per iniziare</small>
        </div>
      `;
      return;
    }
    
    container.innerHTML = customChains.map(chain => `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="chain-icon me-3" style="width:32px;height:32px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">
                ${chain.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>${chain.name}</strong>
                <div class="small text-muted">Chain ID: ${chain.chainId}</div>
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2 edit-chain-btn" data-chain="${chain.name}">
                <i data-feather="edit-2" style="width:14px;height:14px;"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger remove-chain-btn" data-chain="${chain.name}">
                <i data-feather="trash-2" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Event listeners for edit/remove
    container.querySelectorAll('.edit-chain-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chainName = e.currentTarget.dataset.chain;
        const chain = customChains.find(c => c.name === chainName);
        if (chain) showAddChainModal(chain);
      });
    });
    
    container.querySelectorAll('.remove-chain-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const chainName = e.currentTarget.dataset.chain;
        if (confirm(`Rimuovere la chain "${chainName}"?`)) {
          await removeCustomChain(chainName);
          await loadChainsList();
          showNotification('success', 'Chain rimossa con successo');
        }
      });
    });
    
    if (window.feather) window.feather.replace();
  } catch (error) {
    console.error('Error loading chains:', error);
    container.innerHTML = '<div class="alert alert-danger">Errore caricamento chains</div>';
  }
}

/**
 * Carica e mostra la lista dei custom tokens
 */
async function loadTokensList() {
  const container = document.getElementById('tokensList');
  if (!container) return;
  
  try {
    const customTokens = await getCustomTokens();
    
    if (customTokens.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i data-feather="dollar-sign" class="mb-2" style="width:32px;height:32px;"></i>
          <div>Nessun custom token aggiunto</div>
          <small>Clicca "Aggiungi Token" per iniziare</small>
        </div>
      `;
      return;
    }
    
    container.innerHTML = customTokens.map(token => `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="token-icon me-3" style="width:32px;height:32px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">
                ${token.symbol.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>${token.symbol}</strong> - ${token.name}
                <div class="small text-muted">${token.address.slice(0, 10)}...${token.address.slice(-8)} (${token.chain})</div>
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2 edit-token-btn" data-address="${token.address}" data-chain="${token.chain}">
                <i data-feather="edit-2" style="width:14px;height:14px;"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger remove-token-btn" data-address="${token.address}" data-chain="${token.chain}">
                <i data-feather="trash-2" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Event listeners for edit/remove
    container.querySelectorAll('.edit-token-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const address = e.currentTarget.dataset.address;
        const chain = e.currentTarget.dataset.chain;
        const token = customTokens.find(t => t.address === address && t.chain === chain);
        if (token) showAddTokenModal(token);
      });
    });
    
    container.querySelectorAll('.remove-token-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const address = e.currentTarget.dataset.address;
        const chain = e.currentTarget.dataset.chain;
        const token = customTokens.find(t => t.address === address && t.chain === chain);
        if (token && confirm(`Rimuovere il token "${token.symbol}"?`)) {
          await removeCustomToken(address, chain);
          await loadTokensList();
          showNotification('success', 'Token rimosso con successo');
        }
      });
    });
    
    if (window.feather) window.feather.replace();
  } catch (error) {
    console.error('Error loading tokens:', error);
    container.innerHTML = '<div class="alert alert-danger">Errore caricamento tokens</div>';
  }
}

/**
 * Mostra modal per aggiungere/modificare una chain
 */
function showAddChainModal(existingChain = null) {
  const isEdit = !!existingChain;
  
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '600px';
  
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="${isEdit ? 'edit' : 'plus'}" class="modal-icon" style="vertical-align:middle"></i> 
      ${isEdit ? 'Modifica' : 'Aggiungi'} Chain EVM
    </h5>
    <div class="wdk-modal-body">
      <form id="chainForm">
        <div class="mb-3">
          <label class="form-label">Nome Chain *</label>
          <input type="text" class="form-control" id="chainName" placeholder="es: mychain" required 
                 value="${existingChain?.name || ''}">
          <div class="form-text">Nome univoco per identificare la chain</div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Chain ID *</label>
          <input type="number" class="form-control" id="chainId" placeholder="es: 1" required 
                 value="${existingChain?.chainId || ''}">
          <div class="form-text">ID numerico della chain (es: 1 per Ethereum)</div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">RPC URL Mainnet *</label>
          <input type="url" class="form-control" id="mainnetRpc" placeholder="https://..." required 
                 value="${existingChain?.mainnetProviders?.[0] || ''}">
        </div>
        
        <div class="mb-3">
          <label class="form-label">RPC URL Testnet</label>
          <input type="url" class="form-control" id="testnetRpc" placeholder="https://..." 
                 value="${existingChain?.testnetProviders?.[0] || ''}">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Block Explorer Mainnet</label>
          <input type="url" class="form-control" id="mainnetExplorer" placeholder="https://..." 
                 value="${existingChain?.mainnetExplorer || ''}">
          <div class="form-text">URL con ${address} placeholder (es: https://etherscan.io/address/${address})</div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Block Explorer Testnet</label>
          <input type="url" class="form-control" id="testnetExplorer" placeholder="https://..." 
                 value="${existingChain?.testnetExplorer || ''}">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Native Token Symbol</label>
          <input type="text" class="form-control" id="nativeSymbol" placeholder="ETH" 
                 value="${existingChain?.nativeSymbol || 'ETH'}">
        </div>
      </form>
    </div>
    <div class="wdk-modal-actions">
      <button class="btn btn-secondary" id="cancelChainBtn">Annulla</button>
      <button class="btn btn-primary" id="saveChainBtn">${isEdit ? 'Salva' : 'Aggiungi'}</button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // Event listeners
  document.getElementById('cancelChainBtn').addEventListener('click', () => backdrop.remove());
  document.getElementById('saveChainBtn').addEventListener('click', async () => {
    const form = document.getElementById('chainForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const chainConfig = {
      name: document.getElementById('chainName').value.trim(),
      chainId: parseInt(document.getElementById('chainId').value),
      mainnetProviders: [document.getElementById('mainnetRpc').value.trim()],
      testnetProviders: document.getElementById('testnetRpc').value.trim() ? 
        [document.getElementById('testnetRpc').value.trim()] : [],
      mainnetExplorer: document.getElementById('mainnetExplorer').value.trim() || undefined,
      testnetExplorer: document.getElementById('testnetExplorer').value.trim() || undefined,
      nativeSymbol: document.getElementById('nativeSymbol').value.trim() || 'ETH',
      balanceUnit: 'wei',
      isCustom: true
    };
    
    try {
      await saveCustomChain(chainConfig);
      backdrop.remove();
      await loadChainsList();
      showNotification('success', `Chain ${isEdit ? 'modificata' : 'aggiunta'} con successo`);
      
      // Notify extension to reload chains
      if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'reloadChains' });
      }
    } catch (error) {
      showNotification('error', `Errore: ${error.message}`);
    }
  });
  
  if (window.feather) window.feather.replace();
}

/**
 * Mostra modal per aggiungere/modificare un token
 */
function showAddTokenModal(existingToken = null) {
  const isEdit = !!existingToken;
  
  const backdrop = document.createElement('div');
  backdrop.className = 'wdk-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'wdk-modal';
  modal.style.maxWidth = '600px';
  
  modal.innerHTML = `
    <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
      <i data-feather="${isEdit ? 'edit' : 'plus'}" class="modal-icon" style="vertical-align:middle"></i> 
      ${isEdit ? 'Modifica' : 'Aggiungi'} Token ERC-20
    </h5>
    <div class="wdk-modal-body">
      <form id="tokenForm">
        <div class="mb-3">
          <label class="form-label">Chain *</label>
          <select class="form-control" id="tokenChain" required>
            <option value="">Seleziona chain...</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="bsc">BSC</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Contract Address *</label>
          <input type="text" class="form-control" id="tokenAddress" placeholder="0x..." required 
                 value="${existingToken?.address || ''}">
          <div class="form-text">Indirizzo del contratto ERC-20</div>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Nome Token *</label>
          <input type="text" class="form-control" id="tokenName" placeholder="Token Name" required 
                 value="${existingToken?.name || ''}">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Symbol *</label>
          <input type="text" class="form-control" id="tokenSymbol" placeholder="TKN" required 
                 value="${existingToken?.symbol || ''}" maxlength="10">
        </div>
        
        <div class="mb-3">
          <label class="form-label">Decimali *</label>
          <input type="number" class="form-control" id="tokenDecimals" placeholder="18" required 
                 value="${existingToken?.decimals || 18}" min="0" max="18">
        </div>
      </form>
    </div>
    <div class="wdk-modal-actions">
      <button class="btn btn-secondary" id="cancelTokenBtn">Annulla</button>
      <button class="btn btn-primary" id="saveTokenBtn">${isEdit ? 'Salva' : 'Aggiungi'}</button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // Set selected chain for edit
  if (isEdit) {
    setTimeout(() => {
      document.getElementById('tokenChain').value = existingToken.chain;
    }, 100);
  }
  
  // Event listeners
  document.getElementById('cancelTokenBtn').addEventListener('click', () => backdrop.remove());
  document.getElementById('saveTokenBtn').addEventListener('click', async () => {
    const form = document.getElementById('tokenForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const tokenConfig = {
      chain: document.getElementById('tokenChain').value,
      address: document.getElementById('tokenAddress').value.trim(),
      name: document.getElementById('tokenName').value.trim(),
      symbol: document.getElementById('tokenSymbol').value.trim().toUpperCase(),
      decimals: parseInt(document.getElementById('tokenDecimals').value),
      isCustom: true
    };
    
    try {
      await saveCustomToken(tokenConfig);
      backdrop.remove();
      await loadTokensList();
      showNotification('success', `Token ${isEdit ? 'modificato' : 'aggiunto'} con successo`);
      
      // Notify extension to reload tokens
      if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'reloadTokens' });
      }
    } catch (error) {
      showNotification('error', `Errore: ${error.message}`);
    }
  });
  
  if (window.feather) window.feather.replace();
}