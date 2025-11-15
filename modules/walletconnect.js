// modules/walletconnect.js - WalletConnect integration for multi-chain wallet

import { Web3Wallet } from '@walletconnect/web3wallet';
import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { showNotification } from './ui_utils.js';

// === WALLET CONNECT CONFIGURATION ===

// TODO: Replace with your actual WalletConnect Project ID from https://cloud.walletconnect.com/
const WALLET_CONNECT_PROJECT_ID = '11a75a374906e9eabf7fba1eef737e2a'; // ✅ CONFIGURED: WDK Multi-Chain Wallet
const WALLET_CONNECT_RELAY_URL = 'wss://relay.walletconnect.com';

// Global Web3Wallet instance
let web3wallet = null;

// Active sessions
let activeSessions = new Map();

// === INITIALIZATION ===

export async function initWalletConnect() {
  // Check if project ID is configured
  if (WALLET_CONNECT_PROJECT_ID === 'your-project-id-here') {
    console.warn('⚠️ WalletConnect Project ID not configured. Please set WALLET_CONNECT_PROJECT_ID in modules/walletconnect.js');
    console.warn('🔗 Get your Project ID from: https://cloud.walletconnect.com/');
    showNotification('warning', 'WalletConnect non configurato - vedere console per istruzioni');
    return false;
  }

  try {
    console.log('🔗 Initializing WalletConnect...');

        // Initialize Web3Wallet
    web3wallet = await Web3Wallet.init({
      core: new Core({
        projectId: WALLET_CONNECT_PROJECT_ID,
        relayUrl: WALLET_CONNECT_RELAY_URL,
        logger: 'debug', // Add logger to fix trace error
      }),
      metadata: {
        name: 'WDK Multi-Chain Wallet',
        description: 'Multi-chain wallet supporting Ethereum, Polygon, BSC, Solana, TON and more',
        url: window.location.origin,
        icons: [`${window.location.origin}/icon-192.png`],
      },
    });

    console.log('✅ WalletConnect initialized successfully');

    // Setup event listeners
    setupWalletConnectListeners();

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize WalletConnect:', error);
    showNotification('error', 'Errore nell\'inizializzazione di WalletConnect');
    return false;
  }
}

// === EVENT LISTENERS ===

function setupWalletConnectListeners() {
  if (!web3wallet) return;

  // Listen for session proposals
  web3wallet.on('session_proposal', async (event) => {
    console.log('📋 Session proposal received:', event);
    await handleSessionProposal(event);
  });

  // Listen for session requests
  web3wallet.on('session_request', async (event) => {
    console.log('📨 Session request received:', event);
    await handleSessionRequest(event);
  });

  // Listen for session delete
  web3wallet.on('session_delete', (event) => {
    console.log('🗑️ Session deleted:', event);
    handleSessionDelete(event);
    // Update UI counter
    updateWalletConnectCounter();
  });

  console.log('👂 WalletConnect event listeners set up');
}

// === SESSION MANAGEMENT ===

async function handleSessionProposal(event) {
  const { id, params } = event;
  const { proposer, requiredNamespaces, optionalNamespaces } = params;

  try {
    console.log('🔍 Processing session proposal from:', proposer.metadata.name);

    // Check if we have the required chains
    const supportedChains = getSupportedChains();
    const requiredChains = Object.values(requiredNamespaces)
      .flatMap(ns => ns.chains || [])
      .filter(chain => chain.startsWith('eip155:'));

    const hasRequiredChains = requiredChains.every(chain =>
      supportedChains.includes(chain)
    );

    if (!hasRequiredChains) {
      console.log('❌ Required chains not supported');
      await web3wallet.rejectSession({
        id,
        reason: getSdkError('UNSUPPORTED_CHAINS'),
      });
      return;
    }

    // Show approval modal
    const approved = await showSessionProposalModal(proposer, requiredNamespaces, optionalNamespaces);

    if (approved) {
      // Build approved namespaces
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: getSupportedNamespaces(),
      });

      // Approve session
      const session = await web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      });

      activeSessions.set(session.topic, session);
      console.log('✅ Session approved:', session.topic);

      showNotification('success', `Connesso a ${proposer.metadata.name}`);
      updateWalletConnectCounter();
    } else {
      // Reject session
      await web3wallet.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED'),
      });
      console.log('❌ Session rejected by user');
    }
  } catch (error) {
    console.error('❌ Error handling session proposal:', error);
    try {
      await web3wallet.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED'),
      });
    } catch (rejectError) {
      console.error('❌ Error rejecting session:', rejectError);
    }
  }
}

async function handleSessionRequest(event) {
  const { topic, params, id } = event;
  const { request } = params;
  const session = activeSessions.get(topic);

  if (!session) {
    console.log('❌ Session not found for topic:', topic);
    return;
  }

  try {
    console.log('🔄 Processing request:', request.method);

    // Handle different request types
    let result;
    switch (request.method) {
      case 'eth_sendTransaction':
        result = await handleEthSendTransaction(request.params[0], session);
        break;
      case 'eth_signTransaction':
        result = await handleEthSignTransaction(request.params[0], session);
        break;
      case 'eth_sign':
        result = await handleEthSign(request.params[0], request.params[1], session);
        break;
      case 'personal_sign':
        result = await handlePersonalSign(request.params[0], request.params[1], session);
        break;
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        result = await handleEthSignTypedData(request.params[0], request.params[1], session);
        break;
      default:
        console.log('❌ Unsupported method:', request.method);
        await web3wallet.respondSessionRequest({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            error: getSdkError('UNSUPPORTED_METHODS'),
          },
        });
        return;
    }

    // Send response
    await web3wallet.respondSessionRequest({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        result,
      },
    });

    console.log('✅ Request handled successfully');
  } catch (error) {
    console.error('❌ Error handling session request:', error);
    await web3wallet.respondSessionRequest({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: error.message || 'Internal error',
        },
      },
    });
  }
}

function handleSessionDelete(event) {
  const { topic } = event;
  activeSessions.delete(topic);
  console.log('🗑️ Session removed:', topic);
  showNotification('info', 'Connessione WalletConnect terminata');
}

// === REQUEST HANDLERS ===

async function handleEthSendTransaction(txParams, session) {
  console.log('💸 Handling eth_sendTransaction:', txParams);

  // Show transaction approval modal
  const approved = await showTransactionApprovalModal(txParams, session);

  if (!approved) {
    throw new Error('Transaction rejected by user');
  }

  // Get the appropriate chain and signer
  const chainId = parseInt(txParams.chainId, 16);
  const chain = getChainById(chainId);

  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  // Use WDK to send the transaction
  const { sendTransaction } = await import('./transactions.js');
  const result = await sendTransaction(chain.name, txParams);

  return result.txHash;
}

async function handleEthSignTransaction(txParams, session) {
  console.log('✍️ Handling eth_signTransaction:', txParams);

  // Similar to sendTransaction but only sign
  const approved = await showTransactionApprovalModal(txParams, session, 'sign');

  if (!approved) {
    throw new Error('Transaction signing rejected by user');
  }

  // Get signer and sign transaction
  const chainId = parseInt(txParams.chainId, 16);
  const chain = getChainById(chainId);

  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  // Use WDK to sign the transaction
  const { signTransaction } = await import('./transactions.js');
  const signedTx = await signTransaction(chain.name, txParams);

  return signedTx;
}

async function handleEthSign(address, message, session) {
  console.log('✍️ Handling eth_sign:', { address, message });

  const approved = await showSignApprovalModal('eth_sign', { address, message }, session);

  if (!approved) {
    throw new Error('Signing rejected by user');
  }

  // Sign the message
  const { signMessage } = await import('./transactions.js');
  const signature = await signMessage('ethereum', message, address);

  return signature;
}

async function handlePersonalSign(message, address, session) {
  console.log('✍️ Handling personal_sign:', { address, message });

  const approved = await showSignApprovalModal('personal_sign', { address, message }, session);

  if (!approved) {
    throw new Error('Signing rejected by user');
  }

  // Sign the message
  const { signMessage } = await import('./transactions.js');
  const signature = await signMessage('ethereum', message, address);

  return signature;
}

async function handleEthSignTypedData(address, data, session) {
  console.log('✍️ Handling eth_signTypedData:', { address, data });

  const approved = await showSignApprovalModal('eth_signTypedData', { address, data }, session);

  if (!approved) {
    throw new Error('Signing rejected by user');
  }

  // Sign typed data
  const { signTypedData } = await import('./transactions.js');
  const signature = await signTypedData('ethereum', data, address);

  return signature;
}

// === UTILITY FUNCTIONS ===

function getSupportedChains() {
  // Return supported EIP155 chains
  return [
    'eip155:1',      // Ethereum Mainnet
    'eip155:137',    // Polygon Mainnet
    'eip155:56',     // BSC Mainnet
    'eip155:10',     // Optimism Mainnet
    'eip155:42161',  // Arbitrum Mainnet
    'eip155:8453',   // Base Mainnet
    'eip155:11155111', // Ethereum Sepolia
    'eip155:80001',  // Polygon Mumbai
    'eip155:97',     // BSC Testnet
    'eip155:11155420', // Optimism Sepolia
    'eip155:421614', // Arbitrum Sepolia
    'eip155:84532',  // Base Sepolia
  ];
}

function getSupportedNamespaces() {
  const chains = getSupportedChains();

  return {
    eip155: {
      chains,
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v4',
      ],
      events: [
        'chainChanged',
        'accountsChanged',
      ],
      accounts: chains.flatMap(chain =>
        window._walletResults
          ?.filter(r => r.chain === getChainNameFromEip155(chain))
          .map(r => `${chain}:${r.address}`) || []
      ),
    },
  };
}

function getChainById(chainId) {
  // Import CHAINS synchronously since it's already loaded
  const { CHAINS } = window._chains || { CHAINS: [] };
  return CHAINS.find(chain => chain.id === chainId);
}

function getChainNameFromEip155(eip155Chain) {
  const chainId = parseInt(eip155Chain.split(':')[1]);
  const chainMap = {
    1: 'ethereum',
    137: 'polygon',
    56: 'bsc',
    10: 'optimism',
    42161: 'arbitrum',
    8453: 'base',
    11155111: 'ethereum', // Sepolia -> ethereum
    80001: 'polygon',     // Mumbai -> polygon
    97: 'bsc',           // BSC Testnet -> bsc
    11155420: 'optimism', // Optimism Sepolia -> optimism
    421614: 'arbitrum',   // Arbitrum Sepolia -> arbitrum
    84532: 'base',       // Base Sepolia -> base
  };
  return chainMap[chainId];
}

// === UI MODALS ===

async function showSessionProposalModal(proposer, requiredNamespaces, optionalNamespaces) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.style.maxWidth = '500px';

    const requiredChains = Object.values(requiredNamespaces)
      .flatMap(ns => ns.chains || [])
      .map(chain => chain.split(':')[1]);

    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        <i data-feather="link" class="modal-icon" style="vertical-align:middle"></i> Connessione WalletConnect
      </h5>
      <div class="wdk-modal-body">
        <div class="text-center mb-3">
          <img src="${proposer.metadata.icons[0]}" alt="${proposer.metadata.name}" style="width:64px;height:64px;border-radius:12px;">
          <h6 class="mt-2">${proposer.metadata.name}</h6>
          <p class="text-muted small">${proposer.metadata.description || proposer.metadata.url}</p>
        </div>

        <div class="alert alert-info">
          <strong>Chains richieste:</strong>
          <div class="mt-2">
            ${requiredChains.map(chainId => {
              const chainName = getChainNameFromEip155(`eip155:${chainId}`);
              return `<span class="badge bg-primary me-1">${chainName?.toUpperCase() || chainId}</span>`;
            }).join('')}
          </div>
        </div>

        <p class="small text-muted">
          Questa applicazione richiede l'accesso al tuo wallet per le seguenti operazioni:
        </p>
        <ul class="small">
          <li>Visualizzare il tuo indirizzo</li>
          <li>Richiedere firme per transazioni</li>
          <li>Inviare transazioni</li>
        </ul>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="rejectConnection">Rifiuta</button>
        <button class="btn btn-primary" id="approveConnection">Connetti</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    document.getElementById('approveConnection').onclick = () => {
      backdrop.remove();
      resolve(true);
    };

    document.getElementById('rejectConnection').onclick = () => {
      backdrop.remove();
      resolve(false);
    };

    // Replace feather icons
    if (window.feather) window.feather.replace();
  });
}

async function showTransactionApprovalModal(txParams, session, type = 'send') {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.style.maxWidth = '500px';

    const chainId = parseInt(txParams.chainId, 16);
    const chainName = getChainNameFromEip155(`eip155:${chainId}`);
    const value = txParams.value ? parseInt(txParams.value, 16) / 1e18 : 0;
    const gasLimit = txParams.gasLimit ? parseInt(txParams.gasLimit, 16) : 0;
    const gasPrice = txParams.gasPrice ? parseInt(txParams.gasPrice, 16) / 1e9 : 0;

    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        <i data-feather="send" class="modal-icon" style="vertical-align:middle"></i>
        ${type === 'send' ? 'Invio' : 'Firma'} Transazione
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-warning">
          <strong>${session.peer.metadata.name}</strong> richiede di ${type === 'send' ? 'inviare' : 'firmare'} una transazione
        </div>

        <div class="transaction-details">
          <div class="row">
            <div class="col-sm-4"><strong>Chain:</strong></div>
            <div class="col-sm-8">${chainName?.toUpperCase() || chainId}</div>
          </div>
          <div class="row">
            <div class="col-sm-4"><strong>Da:</strong></div>
            <div class="col-sm-8"><code>${txParams.from}</code></div>
          </div>
          ${txParams.to ? `
          <div class="row">
            <div class="col-sm-4"><strong>A:</strong></div>
            <div class="col-sm-8"><code>${txParams.to}</code></div>
          </div>
          ` : ''}
          ${value > 0 ? `
          <div class="row">
            <div class="col-sm-4"><strong>Valore:</strong></div>
            <div class="col-sm-8">${value} ETH</div>
          </div>
          ` : ''}
          ${gasLimit > 0 ? `
          <div class="row">
            <div class="col-sm-4"><strong>Gas Limit:</strong></div>
            <div class="col-sm-8">${gasLimit}</div>
          </div>
          ` : ''}
          ${gasPrice > 0 ? `
          <div class="row">
            <div class="col-sm-4"><strong>Gas Price:</strong></div>
            <div class="col-sm-8">${gasPrice} Gwei</div>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="rejectTransaction">Rifiuta</button>
        <button class="btn btn-primary" id="approveTransaction">Approva</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    document.getElementById('approveTransaction').onclick = () => {
      backdrop.remove();
      resolve(true);
    };

    document.getElementById('rejectTransaction').onclick = () => {
      backdrop.remove();
      resolve(false);
    };

    if (window.feather) window.feather.replace();
  });
}

async function showSignApprovalModal(method, params, session) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wdk-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'wdk-modal';
    modal.style.maxWidth = '500px';

    let message = '';
    if (method === 'personal_sign') {
      message = new TextDecoder().decode(new Uint8Array(params.message.match(/.{1,2}/g).map(byte => parseInt(byte, 16))));
    } else if (method === 'eth_sign') {
      message = params.message;
    }

    modal.innerHTML = `
      <h5 style="padding:20px 24px;border-bottom:1px solid var(--border);margin:0">
        <i data-feather="edit-3" class="modal-icon" style="vertical-align:middle"></i> Firma Messaggio
      </h5>
      <div class="wdk-modal-body">
        <div class="alert alert-warning">
          <strong>${session.peer.metadata.name}</strong> richiede di firmare un messaggio
        </div>

        <div class="mb-3">
          <strong>Indirizzo:</strong>
          <div><code>${params.address}</code></div>
        </div>

        <div class="mb-3">
          <strong>Messaggio:</strong>
          <div class="border p-2 rounded" style="word-break: break-all; font-family: monospace; font-size: 0.875rem;">
            ${message}
          </div>
        </div>
      </div>
      <div class="wdk-modal-actions">
        <button class="btn btn-secondary" id="rejectSign">Rifiuta</button>
        <button class="btn btn-primary" id="approveSign">Firma</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    document.getElementById('approveSign').onclick = () => {
      backdrop.remove();
      resolve(true);
    };

    document.getElementById('rejectSign').onclick = () => {
      backdrop.remove();
      resolve(false);
    };

    if (window.feather) window.feather.replace();
  });
}

// === PUBLIC API ===

export function getActiveSessions() {
  return Array.from(activeSessions.values());
}

export async function disconnectSession(topic) {
  try {
    await web3wallet.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });
    activeSessions.delete(topic);
    showNotification('success', 'Sessione disconnessa');
  } catch (error) {
    console.error('Error disconnecting session:', error);
    showNotification('error', 'Errore nella disconnessione');
  }
}

export function isWalletConnectReady() {
  return web3wallet !== null;
}

// === PAIRING URI ===

export async function getPairingURI() {
  if (!web3wallet) return null;
  
  try {
    const { uri } = await web3wallet.core.pairing.create();
    return uri;
  } catch (error) {
    console.error('Error creating pairing URI:', error);
    return null;
  }
}

// === UI UPDATE FUNCTIONS ===

function updateWalletConnectCounter() {
  // This will be called from main.js to update the UI counter
  if (typeof window !== 'undefined' && window.updateWalletConnectCounter) {
    window.updateWalletConnectCounter();
  }
}