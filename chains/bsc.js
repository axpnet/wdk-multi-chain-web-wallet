import WalletManagerEvm from '@tetherto/wdk-wallet-evm';

export const bsc = {
  name: 'bsc',
  manager: WalletManagerEvm,
  config: { provider: 'https://bsc-dataseed.binance.org/' },
  explorerUrl: (address) => `https://bscscan.com/address/${address}`,
  balanceUnit: 'wei',
};
