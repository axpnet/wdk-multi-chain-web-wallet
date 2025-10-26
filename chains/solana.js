import WalletManagerSol from '@tetherto/wdk-wallet-solana';
import { getNetworkMode } from '../modules/network.js';

export const solana = {
  name: 'solana',
  manager: WalletManagerSol,
  get config() {
    const mode = getNetworkMode();
    return { rpcUrl: mode === 'testnet' ? 'https://api.testnet.solana.com' : 'https://solana.publicnode.com' };
  },
  explorerUrl: (address) => getNetworkMode() === 'testnet'
    ? `https://solscan.io/account/${address}?cluster=testnet`
    : `https://solscan.io/account/${address}`,
  balanceUnit: 'lamports',
};