import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { getNetworkMode } from '../modules/network.js';

export const polygon = {
  name: 'polygon',
  manager: WalletManagerEvm,
  get config() {
    const mode = getNetworkMode();
    return { provider: mode === 'testnet' ? 'https://rpc-amoy.polygon.technology' : 'https://polygon-rpc.com' };
  },
  explorerUrl: (address) => getNetworkMode() === 'testnet'
    ? `https://amoy.polygonscan.com/address/${address}`
    : `https://polygonscan.com/address/${address}`,
  balanceUnit: 'wei',
};
