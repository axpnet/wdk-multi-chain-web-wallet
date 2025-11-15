import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const arbitrum = createEvmChainConfig({
  name: 'arbitrum',
  testnetProviders: [
    'https://sepolia-rollup.arbitrum.io/rpc',
    'https://arbitrum-sepolia.public.blastapi.io',
    'https://arb-sepolia.g.alchemy.com/v2/demo'
  ],
  mainnetProviders: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum-one.public.blastapi.io',
    'https://arb-mainnet.g.alchemy.com/v2/demo'
  ],
  testnetExplorer: 'https://sepolia.arbiscan.io/address/${address}',
  mainnetExplorer: 'https://arbiscan.io/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
arbitrum.manager = WalletManagerEvm;