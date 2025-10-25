import WalletManagerEvm from '@tetherto/wdk-wallet-evm';

export const polygon = {
  name: 'polygon',
  manager: WalletManagerEvm,
  config: { provider: 'https://polygon-rpc.com' },
  explorerUrl: (address) => `https://polygonscan.com/address/${address}`,
  balanceUnit: 'wei',
};
