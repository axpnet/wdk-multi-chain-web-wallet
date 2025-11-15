// background-main.js - Main background logic with ES6 modules

import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from './modules/network.js';

// Global state
let wdk = null;
let currentAccounts = [];
let currentChainId = '0x1'; // Ethereum mainnet
let currentSeed = null;
let isUnlocked = false;

// Secure storage for extension using chrome.storage
const STORAGE_KEY = 'wdk_wallet_encrypted_seed';
const STORAGE_METADATA_KEY = 'wdk_wallet_metadata';

// Import secure storage functions
import { getCustomChains } from './modules/secure_storage.js';

// Encryption helpers (adapted from secure_storage.js)
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

async function decryptData(encryptedData, password, saltBase64, ivBase64) {
  const decoder = new TextDecoder();
  const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );

  return decoder.decode(decrypted);
}

// Storage functions for extension
async function saveEncryptedSeed(seed, password) {
  const encrypted = await encryptData(seed, password);
  const metadata = {
    timestamp: Date.now(),
    version: '1.0',
    hasEncryptedSeed: true
  };

  await chrome.storage.local.set({
    [STORAGE_KEY]: encrypted,
    [STORAGE_METADATA_KEY]: metadata
  });

  console.log('✅ Seed saved securely in extension storage');
  return true;
}

async function loadEncryptedSeed(password) {
  const result = await chrome.storage.local.get([STORAGE_KEY, STORAGE_METADATA_KEY, 'wdk_wallet_web_synced_seed']);
  
  // Check if we have a web-synced seed (not encrypted)
  if (result['wdk_wallet_web_synced_seed'] && result[STORAGE_METADATA_KEY]?.isWebSynced) {
    console.log('Loading web-synced seed');
    return result['wdk_wallet_web_synced_seed'];
  }
  
  // Otherwise, load encrypted seed
  if (!result[STORAGE_KEY]) {
    throw new Error('No seed found');
  }

  const seed = await decryptData(
    result[STORAGE_KEY].encryptedData,
    password,
    result[STORAGE_KEY].salt,
    result[STORAGE_KEY].iv
  );

  return seed;
}

async function hasStoredSeed() {
  const result = await chrome.storage.local.get([STORAGE_METADATA_KEY]);
  return result[STORAGE_METADATA_KEY]?.hasEncryptedSeed === true;
}

// Initialize WDK with seed
async function initializeWDK(seed) {
  if (!seed) return null;

  try {
    wdk = new WDK(seed);

    // Register Ethereum wallet manager
    const ethereumConfig = createEvmChainConfig({
      name: 'ethereum',
      testnetProviders: ['https://rpc.ankr.com/eth_holesky'],
      mainnetProviders: ['https://rpc.ankr.com/eth'],
      testnetExplorer: 'https://holesky.etherscan.io/address/${address}',
      mainnetExplorer: 'https://etherscan.io/address/${address}',
      balanceUnit: 'wei'
    });

    const config = await ethereumConfig.config;
    wdk.registerWallet('ethereum', WalletManagerEvm, config);

    // Get Ethereum account
    const account = await wdk.getAccount('ethereum', 0);
    const address = await account.getAddress();
    currentAccounts = [address];

    console.log('✅ WDK initialized with address:', address);
    return wdk;
  } catch (error) {
    console.error('Failed to initialize WDK:', error);
    return null;
  }
}

// Handle connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'wdk-provider') {
    port.onMessage.addListener(async (msg) => {
      try {
        switch (msg.type) {
          case 'getState':
            port.postMessage({
              type: 'accountsChanged',
              accounts: currentAccounts
            });
            port.postMessage({
              type: 'chainChanged',
              chainId: currentChainId
            });
            break;

          case 'request':
            const result = await handleRequest(msg.method, msg.params);
            port.postMessage({
              id: msg.id,
              result
            });
            break;
        }
      } catch (error) {
        port.postMessage({
          id: msg.id,
          error: error.message
        });
      }
    });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'hasStoredSeed':
          sendResponse(await hasStoredSeed());
          break;

        case 'ping':
          sendResponse({ pong: true });
          break;

        case 'isUnlocked':
          sendResponse(isUnlocked);
          break;

        case 'unlockWallet':
          const seed = await loadEncryptedSeed(request.password);
          currentSeed = seed;
          await initializeWDK(seed);
          isUnlocked = true;
          console.log('✅ Wallet unlocked successfully');
          sendResponse({ success: true, seed: seed });
          break;

        case 'getCurrentAccounts':
          sendResponse(currentAccounts);
          break;

        case 'getAvailableChains':
          // Return available chains including custom ones
          const builtInChains = [
            { name: 'ethereum', displayName: 'Ethereum' },
            { name: 'polygon', displayName: 'Polygon' },
            { name: 'bsc', displayName: 'BSC' },
            { name: 'optimism', displayName: 'Optimism' },
            { name: 'base', displayName: 'Base' },
            { name: 'arbitrum', displayName: 'Arbitrum' },
            { name: 'solana', displayName: 'Solana' }
          ];
          
          try {
            const customChains = await getCustomChains();
            const customChainsFormatted = customChains.map(chain => ({
              name: chain.name,
              displayName: chain.name.charAt(0).toUpperCase() + chain.name.slice(1)
            }));
            
            sendResponse([...builtInChains, ...customChainsFormatted]);
          } catch (error) {
            console.error('Error loading custom chains:', error);
            sendResponse(builtInChains);
          }
          break;

        case 'getBalance':
          if (wdk && isUnlocked) {
            const account = await wdk.getAccount('ethereum', 0);
            const balance = await account.getBalance();
            sendResponse(balance.toString());
          } else {
            sendResponse('0');
          }
          break;

        case 'switchChain':
          // Switch to different chain
          currentChainId = request.chainId || '0x1';
          console.log('🔄 Switched to chain:', request.chain);
          sendResponse(true);
          break;

        case 'lockWallet':
          isUnlocked = false;
          currentSeed = null;
          currentAccounts = [];
          wdk = null;
          sendResponse(true);
          break;

        case 'webWalletActivated':
          // Web wallet has been activated - sync the seed temporarily
          if (request.seed) {
            currentSeed = request.seed;
            await initializeWDK(request.seed);
            isUnlocked = true;
            
            // Save the seed temporarily in chrome.storage so hasStoredSeed() returns true
            const tempMetadata = {
              timestamp: Date.now(),
              version: '1.0',
              hasEncryptedSeed: true,
              isWebSynced: true
            };
            
            // Store the seed in a temporary key
            await chrome.storage.local.set({
              'wdk_wallet_web_synced_seed': request.seed,
              [STORAGE_METADATA_KEY]: tempMetadata
            });
            
            console.log('✅ Wallet synced from web app and stored temporarily');
          }
          sendResponse(true);
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

async function handleRequest(method, params) {
  // Check if wallet is unlocked
  if (!isUnlocked || !wdk) {
    // Try to unlock automatically if seed is available
    if (await hasStoredSeed()) {
      // For extension, we need to prompt user for password
      // For now, we'll show the popup to unlock
      await chrome.action.openPopup();
      throw new Error('Wallet locked - please unlock via popup');
    } else {
      throw new Error('No wallet found - please create/import wallet first');
    }
  }

  switch (method) {
    case 'eth_requestAccounts':
      // Return current accounts if unlocked
      return currentAccounts;

    case 'eth_accounts':
      return currentAccounts;

    case 'eth_chainId':
      return currentChainId;

    case 'eth_getBalance':
      try {
        const account = await wdk.getAccount('ethereum', 0);
        const balance = await account.getBalance();
        return '0x' + balance.toString(16);
      } catch (error) {
        console.error('Error getting balance:', error);
        return '0x0';
      }

    case 'eth_sendTransaction':
      {
        // Show approval popup
        const approved = await showTransactionApproval(params[0]);
        if (!approved) throw new Error('User rejected transaction');

        try {
          const account = await wdk.getAccount('ethereum', 0);
          const tx = params[0];

          // Send transaction using WDK
          const result = await account.sendTransaction(tx);
          return result.hash || result;
        } catch (error) {
          console.error('Error sending transaction:', error);
          throw new Error('Transaction failed: ' + error.message);
        }
      }

    case 'personal_sign':
      {
        const approved = await showSignApproval('personal_sign', params);
        if (!approved) throw new Error('User rejected signing');

        try {
          const account = await wdk.getAccount('ethereum', 0);
          const message = params[0];
          const signature = await account.signMessage(message);
          return signature;
        } catch (error) {
          console.error('Error signing message:', error);
          throw new Error('Signing failed: ' + error.message);
        }
      }

    case 'eth_signTypedData_v4':
      {
        const approved = await showSignApproval('eth_signTypedData_v4', params);
        if (!approved) throw new Error('User rejected signing');

        try {
          const account = await wdk.getAccount('ethereum', 0);
          const typedData = JSON.parse(params[1]);
          const signature = await account.signTypedData(typedData);
          return signature;
        } catch (error) {
          console.error('Error signing typed data:', error);
          throw new Error('Signing failed: ' + error.message);
        }
      }

    default:
      throw new Error(`Method ${method} not supported`);
  }
}

// Wallet unlock function
async function unlockWallet(password) {
  try {
    const seed = await loadEncryptedSeed(password);
    currentSeed = seed;
    await initializeWDK(seed);
    isUnlocked = true;
    console.log('✅ Wallet unlocked successfully');
    return true;
  } catch (error) {
    console.error('Failed to unlock wallet:', error);
    throw error;
  }
}

// Check if wallet exists and try to unlock on startup
async function checkWalletStatus() {
  const hasSeed = await hasStoredSeed();
  if (hasSeed && !isUnlocked) {
    // Wallet exists but not unlocked - will need user interaction
    console.log('Wallet found but locked');
  } else if (!hasSeed) {
    console.log('No wallet found');
  }
}

async function showTransactionApproval(tx) {
  // For now, show popup and auto-approve for beta
  // TODO: Implement proper transaction approval UI
  await chrome.action.openPopup();
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000); // Simulate user approval
  });
}

async function showSignApproval(method, params) {
  // For now, show popup and auto-approve for beta
  // TODO: Implement proper signing approval UI
  await chrome.action.openPopup();
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000); // Simulate user approval
  });
}

// Initialize
console.log('WDK Wallet extension background script loaded');

// Check wallet status on startup
checkWalletStatus();

// Export functions for popup access
if (typeof window !== 'undefined') {
  window.unlockWallet = unlockWallet;
  window.hasStoredSeed = hasStoredSeed;
  window.saveEncryptedSeed = saveEncryptedSeed;
  window.isUnlocked = () => isUnlocked;
  window.getCurrentAccounts = () => currentAccounts;
  window.getCurrentChainId = () => currentChainId;
}