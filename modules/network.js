// modules/network.js - Global network mode (mainnet/testnet)

const KEY = 'wdk_network';

// Global variable for Node.js testing
let nodeNetworkMode = 'testnet';

export function getNetworkMode() {
  // Check if we're in Node.js environment
  if (typeof window === 'undefined') {
    return nodeNetworkMode;
  }

  try {
    const val = window._wdkNetwork || localStorage.getItem(KEY);
    return (val === 'mainnet' || val === 'testnet') ? val : 'testnet';
  } catch {
    return window._wdkNetwork || 'testnet';
  }
}

export function setNetworkMode(mode) {
  const m = (mode === 'mainnet') ? 'mainnet' : 'testnet';

  // Check if we're in Node.js environment
  if (typeof window === 'undefined') {
    nodeNetworkMode = m;
    return m;
  }

  try { localStorage.setItem(KEY, m); } catch {
    // Ignore localStorage errors
  }
  window._wdkNetwork = m;
  try { window.dispatchEvent(new CustomEvent('network-mode-changed', { detail: { mode: m } })); } catch {
    // Ignore dispatch errors
  }
  return m;
}

/**
 * Test RPC endpoint connectivity
 * @param {string} url - RPC endpoint URL
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if endpoint is reachable
 */
async function testRpcEndpoint(url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data && data.result !== undefined;
  } catch (error) {
    console.warn(`RPC endpoint ${url} failed:`, error.message);
    return false;
  }
}

/**
 * Get the best available RPC provider from a list of candidates
 * @param {string[]} providers - Array of RPC endpoint URLs
 * @param {number} timeout - Timeout per endpoint test
 * @returns {Promise<string>} - The first working provider URL
 */
export async function getBestRpcProvider(providers, timeout = 3000) {
  if (!Array.isArray(providers) || providers.length === 0) {
    throw new Error('Providers array is required');
  }

  // Test all providers concurrently for speed
  const tests = providers.map(provider => testRpcEndpoint(provider, timeout));
  const results = await Promise.all(tests);

  // Return the first working provider
  for (let i = 0; i < results.length; i++) {
    if (results[i]) {
      console.log(`✅ Selected RPC provider: ${providers[i]}`);
      return providers[i];
    }
  }

  // If none work, return the first one as fallback
  console.warn('⚠️ No RPC providers responded, using first as fallback');
  return providers[0];
}

/**
 * Create EVM chain configuration with automatic RPC fallback
 * @param {Object} options - Configuration options
 * @param {string} options.name - Chain name
 * @param {string[]} options.testnetProviders - Testnet RPC providers
 * @param {string[]} options.mainnetProviders - Mainnet RPC providers
 * @param {string} options.testnetExplorer - Testnet explorer URL template
 * @param {string} options.mainnetExplorer - Mainnet explorer URL template
 * @param {string} options.balanceUnit - Balance unit (default: 'wei')
 * @returns {Object} Chain configuration object
 */
export function createEvmChainConfig({
  name,
  testnetProviders,
  mainnetProviders,
  testnetExplorer,
  mainnetExplorer,
  balanceUnit = 'wei'
}) {
  return {
    name,
    manager: null, // Will be set by the chain file
    get config() {
      const mode = getNetworkMode();
      const providers = mode === 'testnet' ? testnetProviders : mainnetProviders;
      return getBestRpcProvider(providers).then(provider => ({ provider }));
    },
    explorerUrl: (address) => {
      const mode = getNetworkMode();
      const template = mode === 'testnet' ? testnetExplorer : mainnetExplorer;
      return template.replace('${address}', address);
    },
    balanceUnit
  };
}
