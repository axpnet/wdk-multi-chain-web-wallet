import WalletManagerEvm from '@tetherto/wdk-wallet-evm';

export const ethereum = {
  name: 'ethereum',
  manager: WalletManagerEvm,
  config: { provider: 'https://public-eth.nownodes.io' },
  explorerUrl: (address) => `https://etherscan.io/address/${address}`,
  balanceUnit: 'wei',
};