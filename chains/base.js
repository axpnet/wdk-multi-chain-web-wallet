import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const base = createEvmChainConfig({
  name: 'base',
  testnetProviders: [
    'https://sepolia.base.org',
    'https://base-sepolia.public.blastapi.io',
    'https://base-sepolia.g.alchemy.com/v2/demo'
  ],
  mainnetProviders: [
    'https://mainnet.base.org',
    'https://base-mainnet.public.blastapi.io',
    'https://base-mainnet.g.alchemy.com/v2/demo'
  ],
  testnetExplorer: 'https://sepolia.basescan.org/address/${address}',
  mainnetExplorer: 'https://basescan.org/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
base.manager = WalletManagerEvm;