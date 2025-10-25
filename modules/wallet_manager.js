// modules/wallet_manager.js - Multi-wallet management system

import { showNotification } from './ui_utils.js';

// === CONSTANTS ===
const STORAGE_KEY = 'wdk_wallets';
const ACTIVE_WALLET_KEY = 'wdk_active_wallet_id';

// === UUID GENERATOR ===
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// === WALLET STORAGE ===

/**
 * Get all wallets from localStorage
 * @returns {Array} Array of wallet objects
 */
export function getAllWallets() {
  try {
    const walletsJSON = localStorage.getItem(STORAGE_KEY);
    if (!walletsJSON) return [];
    return JSON.parse(walletsJSON);
  } catch (error) {
    console.error('❌ Error loading wallets:', error);
    return [];
  }
}

/**
 * Save wallets array to localStorage
 * @param {Array} wallets - Array of wallet objects
 */
function saveWallets(wallets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
    return true;
  } catch (error) {
    console.error('❌ Error saving wallets:', error);
    showNotification('Errore nel salvataggio dei wallet', 'error');
    return false;
  }
}

/**
 * Get wallet by ID
 * @param {string} walletId - Wallet UUID
 * @returns {Object|null} Wallet object or null
 */
export function getWalletById(walletId) {
  const wallets = getAllWallets();
  return wallets.find(w => w.id === walletId) || null;
}

/**
 * Get currently active wallet ID
 * @returns {string|null} Active wallet UUID or null
 */
export function getActiveWalletId() {
  return localStorage.getItem(ACTIVE_WALLET_KEY);
}

/**
 * Get currently active wallet object
 * @returns {Object|null} Active wallet object or null
 */
export function getActiveWallet() {
  const activeId = getActiveWalletId();
  if (!activeId) return null;
  return getWalletById(activeId);
}

/**
 * Set active wallet
 * @param {string} walletId - Wallet UUID
 */
export function setActiveWallet(walletId) {
  const wallet = getWalletById(walletId);
  if (!wallet) {
    console.error('❌ Wallet not found:', walletId);
    return false;
  }
  
  // Update last access time
  const wallets = getAllWallets();
  const index = wallets.findIndex(w => w.id === walletId);
  if (index !== -1) {
    wallets[index].lastAccess = new Date().toISOString();
    saveWallets(wallets);
  }
  
  localStorage.setItem(ACTIVE_WALLET_KEY, walletId);
  return true;
}

/**
 * Create new wallet
 * @param {string} name - Wallet name
 * @param {string} encryptedData - Encrypted seed data (base64)
 * @param {string} salt - Salt (base64)
 * @param {string} iv - IV (base64)
 * @returns {Object} Created wallet object
 */
export function createWallet(name, encryptedData, salt, iv) {
  const wallets = getAllWallets();
  
  // Check for duplicate names
  const existingNames = wallets.map(w => w.name.toLowerCase());
  let finalName = name;
  let counter = 1;
  
  while (existingNames.includes(finalName.toLowerCase())) {
    finalName = `${name} (${counter})`;
    counter++;
  }
  
  const newWallet = {
    id: generateUUID(),
    name: finalName,
    encryptedSeed: encryptedData,
    salt: salt,
    iv: iv,
    createdAt: new Date().toISOString(),
    lastAccess: new Date().toISOString()
  };
  
  wallets.push(newWallet);
  
  if (saveWallets(wallets)) {
    console.log('✅ Wallet created:', finalName);
    showNotification(`Wallet "${finalName}" creato con successo!`, 'success');
    return newWallet;
  }
  
  return null;
}

/**
 * Update wallet (e.g., change password = re-encrypt)
 * @param {string} walletId - Wallet UUID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
export function updateWallet(walletId, updates) {
  const wallets = getAllWallets();
  const index = wallets.findIndex(w => w.id === walletId);
  
  if (index === -1) {
    console.error('❌ Wallet not found:', walletId);
    return false;
  }
  
  // Merge updates
  wallets[index] = {
    ...wallets[index],
    ...updates
  };
  
  return saveWallets(wallets);
}

/**
 * Delete wallet
 * @param {string} walletId - Wallet UUID
 * @returns {boolean} Success status
 */
export function deleteWallet(walletId) {
  const wallets = getAllWallets();
  const wallet = getWalletById(walletId);
  
  if (!wallet) {
    console.error('❌ Wallet not found:', walletId);
    return false;
  }
  
  const filtered = wallets.filter(w => w.id !== walletId);
  
  // If deleting active wallet, clear active wallet
  if (getActiveWalletId() === walletId) {
    localStorage.removeItem(ACTIVE_WALLET_KEY);
  }
  
  if (saveWallets(filtered)) {
    console.log('✅ Wallet deleted:', wallet.name);
    showNotification(`Wallet "${wallet.name}" eliminato`, 'success');
    return true;
  }
  
  return false;
}

/**
 * Clear active wallet (logout)
 */
export function logout() {
  localStorage.removeItem(ACTIVE_WALLET_KEY);
  console.log('✅ Logged out');
}

/**
 * Check if any wallets exist
 * @returns {boolean}
 */
export function hasWallets() {
  return getAllWallets().length > 0;
}

/**
 * Format last access time as human-readable string
 * @param {string} isoString - ISO date string
 * @returns {string} Human-readable time
 */
export function formatLastAccess(isoString) {
  if (!isoString) return 'Mai';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Adesso';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays === 1) return '1 giorno fa';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}
