// modules/wallet_init.js - Wallet initialization logic

import WDK from '@tetherto/wdk';
import * as bip39 from 'bip39';
import { CHAINS } from '../config.js';
import { showNotification, ajaxAction, maskSeed } from './ui_utils.js';
import { appendShowSeedButton } from './seed_manager.js';

// === INITIALIZATION PANEL ===

export function showInitializationPanel(statusEl, seedPhrase, onSuccess) {
  const container = document.createElement('div');
  container.className = 'card-body';
  container.innerHTML = `
    <h5>Inizializza Wallet</h5>
    <div class="small text-muted">Seleziona le chain da inizializzare e clicca "Inizializza".</div>
  `;
  
  const form = document.createElement('div');
  form.style.marginTop = '10px';
  
  // Chain checkboxes
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexWrap = 'wrap';
  list.style.gap = '8px';
  
  const localChecks = {};
  CHAINS.forEach((ch, idx) => {
    const box = document.createElement('label');
    box.style.display = 'inline-flex';
    box.style.alignItems = 'center';
    box.style.gap = '6px';
    box.style.padding = '6px 8px';
    box.style.border = '1px solid rgba(0,0,0,0.06)';
    box.style.borderRadius = '8px';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = ch.name;
    input.checked = ch.name === 'solana' || idx === 0;
    localChecks[ch.name] = input;
    
    const span = document.createElement('span');
    span.textContent = ch.name.toUpperCase();
    span.style.fontWeight = '600';
    span.style.marginLeft = '4px';
    
    box.appendChild(input);
    box.appendChild(span);
    list.appendChild(box);
  });
  
  form.appendChild(list);
  
  const controls = document.createElement('div');
  controls.style.marginTop = '12px';
  controls.innerHTML = `
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-secondary" id="initCancel">Annulla</button>
      <button class="btn btn-primary" id="initNow">Inizializza</button>
    </div>
  `;
  
  form.appendChild(controls);
  container.appendChild(form);
  statusEl.innerHTML = '';
  statusEl.appendChild(container);
  
  const initNow = document.getElementById('initNow');
  const initCancel = document.getElementById('initCancel');
  
  initCancel.onclick = () => {
    statusEl.innerHTML = `<div class="card-body"><p class="card-text">Inizializzazione annullata. Puoi rigenerare o verificare di nuovo.</p></div>`;
  };
  
  initNow.onclick = async () => {
    const selected = Object.keys(localChecks).filter(k => localChecks[k].checked);
    if (!selected.length) {
      showNotification('error', 'Seleziona almeno una chain');
      return;
    }
    await initWithSeed(seedPhrase, selected, statusEl, onSuccess);
  };
}

// === INIT WITH SEED ===

export async function initWithSeed(seed, selectedChainNames, statusEl, onSuccess) {
  if (!seed || !bip39.validateMnemonic(seed)) {
    showNotification('error', 'Seed non valida');
    return;
  }
  
  const selectedChains = selectedChainNames
    .map(n => CHAINS.find(c => c.name === n))
    .filter(Boolean);
  
  if (!selectedChains.length) {
    showNotification('error', 'Nessuna chain valida selezionata');
    return;
  }
  
  try {
    await ajaxAction(
      async () => {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="card-body">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Caricamento...</span>
              </div>
              <p>Inizializzazione ${selectedChains.length} chain...</p>
            </div>
          `;
        }
        
        console.log(`Init ${selectedChains.map(c => c.name).join(', ')} con seed valida...`);
        
        const wdk = new WDK(seed);
        
        // Register wallets
        selectedChains.forEach(chain => {
          if (chain.manager) {
            wdk.registerWallet(chain.name, chain.manager, chain.config);
          }
        });
        
        const results = [];
        for (const chainObj of selectedChains) {
          const chain = chainObj.name;
          try {
            let address, balance;
            if (chainObj.getAccount) {
              // Custom manager
              const account = await chainObj.getAccount(seed);
              address = account.address;
              balance = await chainObj.getBalance(address);
            } else {
              const account = await wdk.getAccount(chain, 0);
              address = await account.getAddress();
              balance = await account.getBalance();
            }
            
            const explorer = chainObj.explorerUrl ? chainObj.explorerUrl(address) : '#';
            results.push({
              chain,
              address,
              balance: balance.toString(),
              explorer
            });
            
            // Store in global wallet state
            try {
              window.walletState[chain] = address;
            } catch (e) {
              console.error('Error storing wallet state:', e);
            }
          } catch (chainError) {
            console.error(`Errore ${chain}:`, chainError);
            if (chainError && chainError.message && 
                (chainError.message.includes('socket') || chainError.message.includes('stream'))) {
              results.push({
                chain,
                address: 'N/A',
                balance: 'Socket Error - Usa HTTP RPC',
                explorer: '#'
              });
            } else {
              results.push({
                chain,
                address: 'N/A',
                balance: chainError.message || String(chainError),
                explorer: '#'
              });
            }
          }
        }
        
        const numWords = seed.split(' ').length;
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">Wallet Pronto su ${selectedChains.length} Chain!</h5>
              <small class="text-muted">(${numWords} parole)</small>
              <table class="table table-striped mt-2">
                <thead>
                  <tr>
                    <th>Chain</th>
                    <th>Indirizzo</th>
                    <th>Bilancio</th>
                    <th>Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  ${results.map(r => `
                    <tr>
                      <td>${r.chain.toUpperCase()}</td>
                      <td><code>${r.address}</code></td>
                      <td>${r.balance}</td>
                      <td><a href="${r.explorer}" target="_blank" class="btn btn-sm btn-outline-info">Apri</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="mt-2 d-flex align-items-center">
                <small class="text-muted">Seed (mascherata): <code>${maskSeed(seed)}</code></small>
              </div>
            </div>
          `;
          
          // Add show seed button
          const prevBtn = statusEl.querySelector('.btn-outline-danger');
          if (prevBtn) prevBtn.remove();
          appendShowSeedButton(statusEl, () => seed);
        }
        
        console.log('Successo multi-chain:', results);
        
        // Store results globally
        window._walletResults = results;
        
        // Call success callback if provided
        if (onSuccess) onSuccess(results);
        
        wdk.dispose();
        return true;
      },
      {
        pendingMsg: 'Inizializzazione wallet...',
        successMsg: 'Inizializzazione completata',
        errorMsg: 'Errore inizializzazione'
      }
    );
  } catch (err) {
    console.error('Init error', err);
  }
}

// === HELPER: Initialize wallet from unlocked seed ===

export async function initializeWalletFromSeed(seed) {
  // Get all available chains
  const allChains = CHAINS.filter(c => !c.disabled).map(c => c.name);
  
  // Call initWithSeed with all chains
  await initWithSeed(seed, allChains, null, (results) => {
    // After initialization, show wallet panel
    import('./wallet_ui.js').then(({ renderWalletReadyPanel }) => {
      renderWalletReadyPanel();
    });
  });
}