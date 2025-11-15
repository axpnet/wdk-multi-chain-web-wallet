import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const polygon = createEvmChainConfig({
  name: 'polygon',
  testnetProviders: [
    'https://rpc-amoy.polygon.technology',
    'https://rpc-amoy.polygon.technology',
    'https://polygon-amoy.drpc.org'
  ],
  mainnetProviders: [
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.network',
    'https://matic-mainnet.chainstacklabs.com',
    'https://polygon.drpc.org'
  ],
  testnetExplorer: 'https://amoy.polygonscan.com/address/${address}',
  mainnetExplorer: 'https://polygonscan.com/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
polygon.manager = WalletManagerEvm;
