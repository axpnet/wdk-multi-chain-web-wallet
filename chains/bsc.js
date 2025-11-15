import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const bsc = createEvmChainConfig({
  name: 'bsc',
  testnetProviders: [
    'https://bsc-testnet.publicnode.com',
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    'https://data-seed-prebsc-2-s1.binance.org:8545'
  ],
  mainnetProviders: [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/'
  ],
  testnetExplorer: 'https://testnet.bscscan.com/address/${address}',
  mainnetExplorer: 'https://bscscan.com/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
bsc.manager = WalletManagerEvm;
