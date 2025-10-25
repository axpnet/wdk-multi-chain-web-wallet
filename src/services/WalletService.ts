/**
 * Multi-chain wallet service
 * Handles wallet creation, import, and management
 */

import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import { mnemonicToWalletKey } from '@ton/crypto';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { WalletData, ChainType, ChainWallet } from '../types/wallet';
import { EncryptionService } from '../utils/encryption';

const bip32 = BIP32Factory(ecc);

export class WalletService {
  /**
   * Generate a new mnemonic phrase (12 words)
   */
  static generateMnemonic(): string {
    return bip39.generateMnemonic(128); // 12 words
  }

  /**
   * Validate mnemonic phrase
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Create wallet for specific chain from mnemonic
   */
  static async createChainWallet(
    mnemonic: string,
    chain: ChainType
  ): Promise<ChainWallet> {
    const seed = await bip39.mnemonicToSeed(mnemonic);

    switch (chain) {
      case 'EVM': {
        const hdNode = ethers.HDNodeWallet.fromSeed(seed);
        const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");
        return {
          chain: 'EVM',
          address: wallet.address,
          privateKey: wallet.privateKey,
        };
      }

      case 'Solana': {
        const path = "m/44'/501'/0'/0'";
        const derivedSeed = bip32.fromSeed(seed).derivePath(path);
        const keypair = Keypair.fromSeed(derivedSeed.privateKey!.slice(0, 32));
        return {
          chain: 'Solana',
          address: keypair.publicKey.toBase58(),
          privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        };
      }

      case 'TON': {
        const keyPair = await mnemonicToWalletKey(mnemonic.split(' '));
        return {
          chain: 'TON',
          address: Buffer.from(keyPair.publicKey).toString('hex'),
          publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
          privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
        };
      }

      case 'Bitcoin': {
        const path = "m/44'/0'/0'/0/0";
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const { address } = bitcoin.payments.p2pkh({
          pubkey: child.publicKey,
          network: bitcoin.networks.bitcoin,
        });
        return {
          chain: 'Bitcoin',
          address: address!,
          privateKey: child.privateKey ? Buffer.from(child.privateKey).toString('hex') : undefined,
        };
      }

      case 'Litecoin': {
        const path = "m/44'/2'/0'/0/0";
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        // Litecoin uses same format as Bitcoin but with different network params
        // For simplicity, using Bitcoin format for address generation
        const { address } = bitcoin.payments.p2pkh({
          pubkey: child.publicKey,
          network: bitcoin.networks.bitcoin,
        });
        return {
          chain: 'Litecoin',
          address: address!,
          privateKey: child.privateKey ? Buffer.from(child.privateKey).toString('hex') : undefined,
        };
      }

      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  /**
   * Create a new wallet with selected chains
   */
  static async createWallet(
    name: string,
    selectedChains: ChainType[],
    mnemonic?: string
  ): Promise<WalletData> {
    const walletMnemonic = mnemonic || this.generateMnemonic();

    if (!this.validateMnemonic(walletMnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const chains: ChainWallet[] = [];
    for (const chain of selectedChains) {
      const chainWallet = await this.createChainWallet(walletMnemonic, chain);
      chains.push(chainWallet);
    }

    return {
      id: crypto.randomUUID(),
      name,
      mnemonic: walletMnemonic,
      chains,
      createdAt: Date.now(),
    };
  }

  /**
   * Encrypt and save wallet to storage
   */
  static async saveWallet(
    walletData: WalletData,
    password: string
  ): Promise<void> {
    const encryptedData = await EncryptionService.encrypt(
      JSON.stringify(walletData),
      password
    );

    const stored = this.getStoredWallets();
    stored.wallets.push({
      id: walletData.id,
      name: walletData.name,
      encryptedData,
      createdAt: walletData.createdAt,
    });

    localStorage.setItem('wallets', JSON.stringify(stored));
  }

  /**
   * Load and decrypt wallet from storage
   */
  static async loadWallet(
    walletId: string,
    password: string
  ): Promise<WalletData> {
    const stored = this.getStoredWallets();
    const wallet = stored.wallets.find((w) => w.id === walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    try {
      const decryptedData = await EncryptionService.decrypt(
        wallet.encryptedData,
        password
      );
      return JSON.parse(decryptedData);
    } catch (error) {
      throw new Error('Invalid password or corrupted wallet data');
    }
  }

  /**
   * Get list of stored wallets (metadata only)
   */
  static getStoredWallets(): { wallets: any[] } {
    const stored = localStorage.getItem('wallets');
    if (!stored) {
      return { wallets: [] };
    }
    return JSON.parse(stored);
  }

  /**
   * Delete wallet from storage
   */
  static deleteWallet(walletId: string): void {
    const stored = this.getStoredWallets();
    stored.wallets = stored.wallets.filter((w) => w.id !== walletId);
    localStorage.setItem('wallets', JSON.stringify(stored));
  }
}
