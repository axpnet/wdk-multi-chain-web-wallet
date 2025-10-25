/**
 * Type definitions for multi-chain wallet
 */

export type ChainType = 'EVM' | 'Solana' | 'TON' | 'Bitcoin' | 'Litecoin';

export type FiatCurrency = 'EUR' | 'USD';

export interface WalletData {
  id: string;
  name: string;
  mnemonic: string;
  chains: ChainWallet[];
  createdAt: number;
}

export interface ChainWallet {
  chain: ChainType;
  address: string;
  privateKey?: string;
  publicKey?: string;
}

export interface EncryptedWallet {
  id: string;
  name: string;
  encryptedData: string;
  createdAt: number;
}

export interface StoredWallets {
  wallets: EncryptedWallet[];
}

export interface Balance {
  chain: ChainType;
  address: string;
  balance: string;
  fiatValue: {
    EUR: number;
    USD: number;
  };
}

export interface OnboardingState {
  step: number;
  walletName: string;
  password: string;
  confirmPassword: string;
  selectedChains: ChainType[];
  mnemonic?: string;
  isImporting: boolean;
}
