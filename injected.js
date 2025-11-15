// injected.js - Ethereum provider injected into pages

class WDKProvider {
  constructor() {
    this.isMetaMask = true; // Pretend to be MetaMask for compatibility
    this.chainId = '0x1'; // Default to Ethereum mainnet
    this.networkVersion = '1';
    this.selectedAddress = null;
    this._accounts = [];
    this._listeners = {};

    // Connect to background script
    this._port = chrome.runtime.connect({ name: 'wdk-provider' });

    this._port.onMessage.addListener((msg) => {
      if (msg.type === 'accountsChanged') {
        this._accounts = msg.accounts;
        this.selectedAddress = msg.accounts[0] || null;
        this._emit('accountsChanged', msg.accounts);
      } else if (msg.type === 'chainChanged') {
        this.chainId = msg.chainId;
        this.networkVersion = parseInt(msg.chainId, 16).toString();
        this._emit('chainChanged', msg.chainId);
      }
    });

    // Request initial state
    this._port.postMessage({ type: 'getState' });
  }

  // Event handling
  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  off(event, handler) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(h => h !== handler);
    }
  }

  _emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(handler => handler(...args));
    }
  }

  // Provider methods
  async request({ method, params = [] }) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      const handler = (response) => {
        if (response.id === id) {
          this._port.onMessage.removeListener(handler);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      };

      this._port.onMessage.addListener(handler);
      this._port.postMessage({ type: 'request', method, params, id });

      // Timeout after 30 seconds
      setTimeout(() => {
        this._port.onMessage.removeListener(handler);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  // Legacy methods for compatibility
  async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  sendAsync(payload, callback) {
    this.request(payload)
      .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
      .catch(error => callback(error, null));
  }

  send(payload, callback) {
    if (typeof payload === 'string') {
      // Legacy send method
      this.sendAsync({ method: payload, params: [] }, callback);
    } else {
      this.sendAsync(payload, callback);
    }
  }

  // Properties
  get isConnected() {
    return true;
  }
}

// Inject the provider
window.ethereum = new WDKProvider();

// Announce provider
window.dispatchEvent(new Event('ethereum#initialized'));