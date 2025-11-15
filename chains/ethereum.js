import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { createEvmChainConfig } from '../modules/network.js';

export const ethereum = createEvmChainConfig({
  name: 'ethereum',
  testnetProviders: [
    'https://rpc.ankr.com/eth_holesky',
    'https://holesky.drpc.org',
    'https://ethereum-holesky.public.blastapi.io',
    'https://ethereum-holesky-rpc.publicnode.com'
  ],
  mainnetProviders: [
    'https://public-eth.nownodes.io',
    'https://rpc.ankr.com/eth',
    'https://eth.drpc.org',
    'https://cloudflare-eth.com'
  ],
  testnetExplorer: 'https://holesky.etherscan.io/address/${address}',
  mainnetExplorer: 'https://etherscan.io/address/${address}',
  balanceUnit: 'wei'
});

// Set the manager after creating the config
ethereum.manager = WalletManagerEvm;