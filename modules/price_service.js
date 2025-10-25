// modules/price_service.js - Simple price fetcher with caching and currency preference

const STORAGE_KEY_PREF = 'fiatCurrency';
const STORAGE_KEY_CACHE = 'fiatPriceCache_v1';
const CACHE_TTL_MS = 60 * 1000; // 60s

// Map our chain names to CoinGecko IDs
const COINGECKO_IDS = {
  ethereum: 'ethereum',
  polygon: 'polygon-ecosystem-token', // POL
  bsc: 'binancecoin', // BNB
  solana: 'solana',
  ton: 'the-open-network', // TON Coin
  litecoin: 'litecoin',
  bitcoin: 'bitcoin',
};

export function getPreferredCurrency() {
  const cur = localStorage.getItem(STORAGE_KEY_PREF);
  return cur === 'USD' ? 'USD' : 'EUR';
}

export function setPreferredCurrency(cur) {
  if (cur !== 'EUR' && cur !== 'USD') return;
  localStorage.setItem(STORAGE_KEY_PREF, cur);
}

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CACHE);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.timestamp || !obj.data) return null;
    return obj;
  } catch { return null; }
}

function writeCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {}
}

export async function getPrices(currency = 'EUR', force = false) {
  // Return cached if fresh and same currency
  const cached = readCache();
  if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data?.currency === currency) {
    return cached.data.prices;
  }
  
  const ids = Object.values(COINGECKO_IDS).join(',');
  const vs = currency.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;
  
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Build mapping per our chain names
    const out = {};
    for (const [chain, id] of Object.entries(COINGECKO_IDS)) {
      const entry = data[id];
      if (entry && entry[vs] != null) {
        out[chain] = { [vs]: Number(entry[vs]) };
      }
    }
    writeCache({ currency, prices: out });
    return out;
  } catch (e) {
    console.warn('Price fetch failed:', e);
    // Return empty mapping so UI hides fiat values
    return {};
  }
}
