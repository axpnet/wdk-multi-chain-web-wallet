// crypto-bundle-entry.js
export * from '@noble/hashes/sha2.js';
export * from '@noble/hashes/sha3.js';
export * from '@noble/hashes/pbkdf2.js';
export * from '@noble/curves/secp256k1.js';
export * from '@noble/curves/ed25519.js';
export * from '@scure/bip32';
export * from '@scure/bip39';

// Make available globally
import * as sha2 from '@noble/hashes/sha2.js';
import * as sha3 from '@noble/hashes/sha3.js';
import * as pbkdf2 from '@noble/hashes/pbkdf2.js';
import * as secp256k1 from '@noble/curves/secp256k1.js';
import * as ed25519 from '@noble/curves/ed25519.js';
import * as bip32 from '@scure/bip32';
import * as scureBip39 from '@scure/bip39';
import bs58 from 'bs58';

// Export individual functions
export const HDKey = bip32.HDKey;
export const secp256k1GetPublicKey = (privateKey, compressed = true) => secp256k1.secp256k1.getPublicKey(privateKey, compressed);
export const ed25519GetPublicKey = (privateKey) => ed25519.ed25519.getPublicKey(privateKey);
export const keccak256 = sha3.keccak_256;
export const pbkdf2Sync = pbkdf2.pbkdf2;
export const sha512 = sha2.sha512;
export const mnemonicToSeedSync = scureBip39.mnemonicToSeedSync;
export const validateMnemonic = scureBip39.validateMnemonic;
export const base58Encode = (data) => {
  return bs58.encode(data);
};

// Derive Solana address from seed
export const deriveSolanaAddress = (seedPhrase) => {
  const seed = mnemonicToSeedSync(seedPhrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const derived = hdkey.derive("m/44'/501'/0'/0'");
  const publicKey = ed25519GetPublicKey(derived.privateKey);
  return base58Encode(publicKey);
};

// Derive TON address from seed
export const deriveTonAddress = (seedPhrase) => {
  const seed = mnemonicToSeedSync(seedPhrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const derived = hdkey.derive("m/44'/396'/0'/0/0");
  const publicKey = secp256k1GetPublicKey(derived.privateKey, false);
  const hash = keccak256(publicKey.slice(1)); // Remove 0x04 prefix
  const address = hash.slice(-20); // Last 20 bytes
  return 'UQ' + base58Encode(Buffer.concat([Buffer.from([0x11]), address])); // TON bounceable address format
};

const cryptoSecure = {
  HDKey: bip32.HDKey,
  secp256k1GetPublicKey: (privateKey, compressed = true) => secp256k1.secp256k1.getPublicKey(privateKey, compressed),
  ed25519GetPublicKey: (privateKey) => ed25519.ed25519.getPublicKey(privateKey),
  keccak256: sha3.keccak_256,
  pbkdf2: pbkdf2.pbkdf2,
  sha512: sha2.sha512,
  mnemonicToSeedSync: scureBip39.mnemonicToSeedSync,
  validateMnemonic: scureBip39.validateMnemonic,
  base58Encode: (data) => {
    return bs58.encode(data);
  },
  deriveSolanaAddress,
  deriveTonAddress
};

if (typeof window !== 'undefined') {
  window.cryptoSecure = cryptoSecure;
  window.cryptoLight = window.cryptoSecure;

  window.dispatchEvent(new Event("cryptoSecureReady"));
  window.dispatchEvent(new Event("cryptoLightReady"));

  console.log("🔐 CryptoSecure initialized with BIP39 support");
}

// Export for Node.js
export default cryptoSecure;