// modules/network.js - Global network mode (mainnet/testnet)

const KEY = 'wdk_network';

export function getNetworkMode() {
  try {
    const val = window._wdkNetwork || localStorage.getItem(KEY);
    return (val === 'mainnet' || val === 'testnet') ? val : 'testnet';
  } catch {
    return window._wdkNetwork || 'testnet';
  }
}

export function setNetworkMode(mode) {
  const m = (mode === 'mainnet') ? 'mainnet' : 'testnet';
  try { localStorage.setItem(KEY, m); } catch {}
  window._wdkNetwork = m;
  try { window.dispatchEvent(new CustomEvent('network-changed', { detail: { mode: m } })); } catch {}
  return m;
}
