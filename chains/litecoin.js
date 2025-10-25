import * as bip39 from 'bip39';
import bip32 from 'bip32';
import elliptic from 'elliptic';
import * as bs58 from 'bs58';

const ec = new elliptic.ec('secp256k1');

// LTC network params
const LTC_NETWORK = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

export const litecoin = {
  name: 'litecoin',
  // Custom manager per browser (no WDK, elliptic no Wasm)
  getAccount: async (seedPhrase) => {
    // Genera seed da mnemonic
    const seed = await bip39.mnemonicToSeed(seedPhrase);
    // Deriva HD wallet (m/84'/2'/0'/0/0 per BIP84 native segwit LTC)
    const root = bip32.fromSeed(seed);
    const child = root.derivePath("m/84'/2'/0'/0/0");
    const privateKey = child.privateKey;
    const keyPair = ec.keyFromPrivate(privateKey, 'bytes');
    const publicKey = keyPair.getPublic(true, 'hex');  // Compressed
    // P2WPKH address (BIP84 for LTC)
    const sha256Hash = await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(publicKey, 'hex')));
    const sha256Hex = Array.from(new Uint8Array(sha256Hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const ripemd160Hash = await crypto.subtle.digest('RIPEMD160', new Uint8Array(Buffer.from(sha256Hex, 'hex')));
    const ripemd160Hex = Array.from(new Uint8Array(ripemd160Hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const payload = '0014' + ripemd160Hex;  // OP_0 + hash160
    const checksum1 = await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(payload, 'hex')));
    const checksum1Hex = Array.from(new Uint8Array(checksum1)).map(b => b.toString(16).padStart(2, '0')).join('');
    const checksum2 = await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(checksum1Hex, 'hex')));
    const checksum2Hex = Array.from(new Uint8Array(checksum2)).map(b => b.toString(16).padStart(2, '0')).join('');
    const address = bs58.encode(Buffer.from(payload + checksum2Hex.substring(0, 8), 'hex'));
    return { address };
  },
  getBalance: async (address) => {
    try {
      const response = await fetch(`https://mempool.space/api/litecoin/address/${address}/txs`);
      if (!response.ok) throw new Error('RPC Error');
      const data = await response.json();
      return data.length * 546;  // Approx in litoshi (546 min UTXO, 0 for empty)
    } catch (error) {
      throw new Error('Balance Fetch Error');
    }
  },
  explorerUrl: (address) => `https://blockchair.com/litecoin/address/${address}`,
  balanceUnit: 'litoshis',
};