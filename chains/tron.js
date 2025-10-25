import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import ecc from 'tiny-secp256k1';
import TronWeb from 'tronweb';

const bip32 = BIP32Factory(ecc);

// Tron uses slip44 coin type 195. We'll use m/44'/195'/0'/0/0 for first address
export const tron = {
  name: 'tron',
  getAccount: async (seedPhrase) => {
    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const root = bip32.fromSeed(seed);
    const child = root.derivePath("m/44'/195'/0'/0/0");
    const privateKey = child.privateKey.toString('hex');
    // tronweb expects private key hex without 0x
    const address = TronWeb.address.fromPrivateKey(privateKey);
    return { address, privateKey };
  },
  getBalance: async (address) => {
    try {
      // Use public TronGrid API (may be rate-limited). We'll call account resource to get balance in Sun (1 TRX = 1e6 Sun)
      const res = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
      if (!res.ok) throw new Error('RPC Error');
      const data = await res.json();
      // data.data is an array of account objects
      const acct = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
      const balance = acct?.balance || 0; // in Sun
      return balance; 
    } catch (err) {
      throw new Error('Balance Fetch Error: ' + (err.message || err));
    }
  },
  explorerUrl: (address) => `https://tronscan.org/#/address/${address}`,
  balanceUnit: 'sun',
};
