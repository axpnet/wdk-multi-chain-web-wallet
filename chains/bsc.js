import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { getNetworkMode } from '../modules/network.js';

export const bsc = {
  name: 'bsc',
  manager: WalletManagerEvm,
  get config() {
    const mode = getNetworkMode();
    return { provider: mode === 'testnet' ? 'https://bsc-testnet.publicnode.com' : 'https://bsc-dataseed.binance.org/' };
  },
  explorerUrl: (address) => getNetworkMode() === 'testnet'
    ? `https://testnet.bscscan.com/address/${address}`
    : `https://bscscan.com/address/${address}`,
  balanceUnit: 'wei',
};
