// modules/transactions.js - Send and Receive functionality (FIXED & COMPLETE)

import WDK from '@tetherto/wdk';
import * as ethers from 'ethers';
import QRCode from 'qrcode';
import { CHAINS } from '../config.js';
import { showModal, showNotification, ajaxAction, getTickerForChain } from './ui_utils.js';
import { getSeedPhrase } from './wizard.js';

// === RECEIVE PICKER ===

export function showReceivePicker() {
  const el = document.createElement('div');
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'wdk-modal-body';
  
  const list = document.createElement('div');
  list.className = 'chain-list';
  
  const walletState = window.walletState || {};
  const chains = Object.keys(walletState);
  
  if (chains.length === 0) {
    list.innerHTML = '<div class="text-muted text-center">Nessun wallet inizializzato. Inizializza il wallet prima.</div>';
  } else {
    chains.forEach(chain => {
      const row = document.createElement('div');
      row.className = 'chain-item';
      const addr = walletState[chain];
      row.innerHTML = `
        <div class="chain-info">
          <strong>${chain.toUpperCase()}</strong>
          <code class="address-preview">${addr.slice(0, 10)}...${addr.slice(-8)}</code>
        </div>
        <button class="btn btn-sm btn-outline-primary">Mostra QR</button>
      `;
      row.querySelector('button').onclick = () => {
        showReceiveQR(chain, addr);
      };
      list.appendChild(row);
    });
  }
  
  bodyDiv.appendChild(list);
  el.innerHTML = `<h5>Ricevi - seleziona chain</h5>`;
  el.appendChild(bodyDiv);
  
  const { backdrop } = showModal(el);
}

// === RECEIVE QR ===

export function showReceiveQR(chain, address) {
  const el = document.createElement('div');
  const qrWrapper = document.createElement('div');
  qrWrapper.className = 'qr-wrapper wdk-modal-body';
  qrWrapper.style.textAlign = 'center';
  
  const img = document.createElement('img');
  img.alt = address;
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  
  // Generate QR locally using qrcode library
  QRCode.toDataURL(address, { width: 300, margin: 1 })
    .then(url => {
      img.src = url;
    })
    .catch(err => {
      console.error('QR gen error', err);
      // Fallback to remote generator if local fails
      img.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(address)}`;
    });
  
  qrWrapper.appendChild(img);
  
  // Address display with copy button
  const addressSection = document.createElement('div');
  addressSection.className = 'mt-3';
  addressSection.style.wordBreak = 'break-all';
  addressSection.innerHTML = `
    <div class="small text-muted mb-2">Indirizzo ${chain.toUpperCase()}</div>
    <div class="address-copy">
      <code style="display:block;padding:8px;background:var(--bg-secondary);border-radius:var(--radius);font-size:0.85rem;">${address}</code>
      <button class="btn btn-sm btn-outline-primary mt-2" id="copyAddressBtn">Copia Indirizzo</button>
    </div>
  `;
  qrWrapper.appendChild(addressSection);
  
  const actions = document.createElement('div');
  actions.className = 'wdk-modal-actions';
  actions.innerHTML = `<button class="btn btn-secondary">Chiudi</button>`;
  
  el.innerHTML = `<h5>Ricevi ${chain.toUpperCase()}</h5>`;
  el.appendChild(qrWrapper);
  el.appendChild(actions);
  
  const { backdrop } = showModal(el);
  
  // Close button handler
  actions.querySelector('button').onclick = () => backdrop.remove();
  
  // Copy address button handler
  setTimeout(() => {
    const copyBtn = document.getElementById('copyAddressBtn');
    if (copyBtn) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(address);
          showNotification('success', 'Indirizzo copiato negli appunti!');
        } catch (e) {
          console.error('Copy failed:', e);
          showNotification('error', 'Impossibile copiare. Usa copia manuale.');
        }
      };
    }
  }, 100);
}

// === SEND PICKER ===

export function showSendPicker() {
  // Se esiste una chain attiva, apri direttamente il form di invio
  const activeChain = window._activeChain;
  const walletState = window.walletState || {};
  
  if (activeChain && walletState[activeChain]) {
    showSendForm(activeChain);
    return;
  }
  
  // Altrimenti mostra il picker
  const el = document.createElement('div');
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'wdk-modal-body';
  
  const list = document.createElement('div');
  list.className = 'chain-list';
  
  const chains = Object.keys(walletState);
  
  if (chains.length === 0) {
    list.innerHTML = '<div class="text-muted text-center">Nessun wallet inizializzato. Inizializza il wallet prima.</div>';
  } else {
    chains.forEach(chain => {
      const row = document.createElement('div');
      row.className = 'chain-item';
      row.innerHTML = `
        <div class="chain-info">
          <strong>${chain.toUpperCase()}</strong>
        </div>
        <button class="btn btn-sm btn-outline-primary">Invia</button>
      `;
      row.querySelector('button').onclick = () => {
        const currentBackdrop = document.querySelector('.wdk-modal-backdrop');
        if (currentBackdrop) currentBackdrop.remove();
        showSendForm(chain);
      };
      list.appendChild(row);
    });
  }
  
  bodyDiv.appendChild(list);
  el.innerHTML = `<h5>Invia - seleziona chain</h5>`;
  el.appendChild(bodyDiv);
  
  const { backdrop } = showModal(el);
}

// === SEND FORM ===

export async function showSendForm(chain) {
  const el = document.createElement('div');
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'wdk-modal-body send-form';
  
  const walletState = window.walletState || {};
  const fromAddress = walletState[chain] || 'N/A';
  const ticker = getTickerForChain(chain);
  
  bodyDiv.innerHTML = `
    <div class="mb-3">
      <label class="form-label">Da (indirizzo)</label>
      <div><code id="sendFrom" style="display:block;padding:8px;background:var(--bg-secondary);border-radius:var(--radius);font-size:0.85rem;word-break:break-all;">${fromAddress}</code></div>
    </div>
    <div class="mb-3">
      <label class="form-label">Destinatario</label>
      <input id="sendTo" class="form-control" placeholder="0x.. o indirizzo destinazione...">
    </div>
    <div class="mb-3">
      <label class="form-label">Importo</label>
      <input id="sendAmount" class="form-control" type="number" step="any" placeholder="0.1">
    </div>
    <div class="mb-3">
      <label class="form-label">Unità</label>
      <select id="sendUnit" class="form-select">
        <option value="ether">${ticker} (o equivalente)</option>
        <option value="wei">Wei (o unità minima)</option>
      </select>
    </div>
    <div class="alert alert-info small">
      <strong>Attenzione:</strong> Verifica attentamente l'indirizzo destinatario. Le transazioni blockchain sono irreversibili.
    </div>
  `;
  
  const actions = document.createElement('div');
  actions.className = 'wdk-modal-actions';
  actions.innerHTML = `
    <button class="btn btn-secondary" id="cancelBtn">Annulla</button>
    <button class="btn btn-primary" id="sendBtn">Invia Transazione</button>
  `;
  
  el.innerHTML = `<h5>Invia ${chain.toUpperCase()}</h5>`;
  el.appendChild(bodyDiv);
  el.appendChild(actions);
  
  const { backdrop } = showModal(el);
  
  // Cancel button handler
  actions.querySelector('#cancelBtn').onclick = () => backdrop.remove();
  
  // Send button handler
  actions.querySelector('#sendBtn').onclick = async () => {
    const to = bodyDiv.querySelector('#sendTo').value.trim();
    const amount = bodyDiv.querySelector('#sendAmount').value.trim();
    const unit = bodyDiv.querySelector('#sendUnit').value;
    
    // Validation
    if (!to || !amount) {
      return showNotification('error', 'Destinatario e importo sono obbligatori');
    }
    
    if (parseFloat(amount) <= 0) {
      return showNotification('error', 'L\'importo deve essere maggiore di zero');
    }
    
    // Confirm transaction
    const confirmMsg = `Confermi l'invio di ${amount} ${unit === 'ether' ? 'token' : 'wei'} a:\n${to.slice(0, 20)}...?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    // Execute transaction
    try {
      await ajaxAction(
        async () => {
          const seedPhrase = getSeedPhrase();
          if (!seedPhrase) {
            throw new Error('Seed non disponibile. Inizializza il wallet prima.');
          }
          
          const wdk = new WDK(seedPhrase);
          
          // Register managers for available chains
          CHAINS.forEach(ch => {
            if (ch.manager) {
              wdk.registerWallet(ch.name, ch.manager, ch.config);
            }
          });
          
          const account = await wdk.getAccount(chain, 0);
          
          // Build transaction object
          let tx;
          if (unit === 'ether') {
            try {
              // Try to parse as ether/native token
              tx = { to, value: ethers.parseEther(amount).toString() };
            } catch (e) {
              console.warn('Parse ether failed, using raw value:', e);
              tx = { to, value: amount };
            }
          } else {
            // Use raw wei/smallest unit
            tx = { to, value: amount };
          }
          
          console.log('Sending transaction:', tx);
          
          // Try common send method names (different chains use different APIs)
          let sendResult;
          if (typeof account.sendTransaction === 'function') {
            sendResult = await account.sendTransaction(tx);
          } else if (typeof account.transfer === 'function') {
            sendResult = await account.transfer(to, tx.value);
          } else if (typeof account.send === 'function') {
            sendResult = await account.send(tx);
          } else {
            throw new Error('Metodo di invio non supportato per questa chain nel client browser.');
          }
          
          console.log('Transaction result:', sendResult);
          
          // Cleanup
          wdk.dispose();
          
          // Close modal
          backdrop.remove();
          
          // Show success with transaction details
          showNotification('success', `Transazione inviata! Hash: ${sendResult?.hash || 'N/A'}`, 6000);
          
          return sendResult;
        },
        {
          pendingMsg: 'Invio transazione in corso...',
          successMsg: 'Transazione completata',
          errorMsg: 'Errore durante l\'invio'
        }
      );
    } catch (error) {
      console.error('Send transaction error:', error);
      // Error is already handled by ajaxAction
    }
  };
}

// === EXPOSE GLOBALLY (for onclick handlers in wallet-ui.js) ===

if (typeof window !== 'undefined') {
  window.showReceivePicker = showReceivePicker;
  window.showSendPicker = showSendPicker;
  window.showReceiveQR = showReceiveQR;
  window.showSendForm = showSendForm;
}
