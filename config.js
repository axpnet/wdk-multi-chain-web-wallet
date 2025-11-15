// config.js - Configurazione globale e chains
import { ethereum } from './chains/ethereum.js';
import { bsc } from './chains/bsc.js';
import { polygon } from './chains/polygon.js';
import { optimism } from './chains/optimism.js';
import { base } from './chains/base.js';
import { arbitrum } from './chains/arbitrum.js';
import { solana } from './chains/solana.js';
import { ton } from './chains/ton.js';
// import { litecoin } from './chains/litecoin.js';
// import { bitcoin } from './chains/bitcoin.js';

// Chains disponibili (Bitcoin e Litecoin disabilitati - non ancora supportati ufficialmente da WDK)
export const BUILT_IN_CHAINS = [
  ethereum,
  polygon,
  bsc,
  optimism,
  base,
  arbitrum,
  solana,
  ton,
  // litecoin,  // Disabilitato: non supportato ufficialmente da WDK
  // bitcoin    // Disabilitato: incompatibilità browser
].filter(Boolean);

// Export combined chains (will be updated dynamically)
export let CHAINS = [...BUILT_IN_CHAINS];

// Function to load custom chains
export async function loadCustomChains() {
  try {
    // Dynamic import to avoid circular dependency
    const { getCustomChains } = await import('./modules/secure_storage.js');
    const customChains = await getCustomChains();
    
    // Convert custom chains to proper format (without manager for now)
    const customChainsFormatted = customChains.map(chain => ({
      ...chain,
      isCustom: true
    }));
    
    CHAINS = [...BUILT_IN_CHAINS, ...customChainsFormatted];
    console.log('✅ Chains loaded:', CHAINS.length, 'total');
    return CHAINS;
  } catch (error) {
    console.warn('Error loading custom chains:', error);
    CHAINS = [...BUILT_IN_CHAINS];
    return CHAINS;
  }
}

// Mappa ticker per chain
export const CHAIN_TICKERS = {
  ethereum: 'ETH',
  polygon: 'MATIC',
  bsc: 'BNB',
  optimism: 'OP',
  base: 'ETH',
  arbitrum: 'ARB',
  solana: 'SOL',
  ton: 'TON',
  // litecoin: 'LTC',  // Disabilitato
  // bitcoin: 'BTC'    // Disabilitato
};

// Opzioni lunghezza seed
export const SEED_LENGTHS = [
  { value: 128, label: '12 parole (128 bit - base)' },
  { value: 160, label: '15 parole (160 bit)' },
  { value: 192, label: '18 parole (192 bit)' },
  { value: 224, label: '21 parole (224 bit)' },
  { value: 256, label: '24 parole (256 bit - max)' }
];

// Default chain
export const DEFAULT_CHAIN = 'solana';

// Timeout notifiche
export const TOAST_TIMEOUT = 4000;
