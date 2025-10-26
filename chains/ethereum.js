import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { getNetworkMode } from '../modules/network.js';

export const ethereum = {
  name: 'ethereum',
  manager: WalletManagerEvm,
  get config() {
    const mode = getNetworkMode();
    // Holesky is more reliable than Sepolia for testing
    return { provider: mode === 'testnet' ? 'https://ethereum-holesky-rpc.publicnode.com' : 'https://public-eth.nownodes.io' };
  },
  explorerUrl: (address) => getNetworkMode() === 'testnet'
    ? `https://holesky.etherscan.io/address/${address}`
    : `https://etherscan.io/address/${address}`,
  balanceUnit: 'wei',
};