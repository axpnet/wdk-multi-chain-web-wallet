import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const optimism = createEvmChainConfig({
  name: 'optimism',
  testnetProviders: [
    'https://sepolia.optimism.io',
    'https://optimism-sepolia.public.blastapi.io',
    'https://opt-sepolia.g.alchemy.com/v2/demo'
  ],
  mainnetProviders: [
    'https://mainnet.optimism.io',
    'https://optimism-mainnet.public.blastapi.io',
    'https://opt-mainnet.g.alchemy.com/v2/demo'
  ],
  testnetExplorer: 'https://sepolia-optimistic.etherscan.io/address/${address}',
  mainnetExplorer: 'https://optimistic.etherscan.io/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
optimism.manager = WalletManagerEvm;