import WalletManagerTon from '@tetherto/wdk-wallet-ton';
import { getNetworkMode } from '../modules/network.js';

export const ton = {
  name: 'ton',
  manager: WalletManagerTon,
  get config() {
    const mode = getNetworkMode();
    const url = mode === 'testnet'
      ? (import.meta.env.VITE_TON_RPC_URL_TESTNET || 'https://testnet.toncenter.com/api/v2/jsonRPC')
      : (import.meta.env.VITE_TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC');
    const apiKey = mode === 'testnet'
      ? (import.meta.env.VITE_TON_API_KEY_TESTNET || '')
      : (import.meta.env.VITE_TON_API_KEY || '');
    return { tonClient: { url, apiKey } };
  },
  explorerUrl: (address) => getNetworkMode() === 'testnet'
    ? `https://testnet.tonscan.org/address/${address}`
    : `https://tonscan.org/address/${address}`,
  balanceUnit: 'nanoTON',
};
