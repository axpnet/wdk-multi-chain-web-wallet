import WalletManagerSol from '@tetherto/wdk-wallet-solana';

export const solana = {
  name: 'solana',
  manager: WalletManagerSol,
  config: { rpcUrl: 'https://solana.publicnode.com' },
  explorerUrl: (address) => `https://solscan.io/account/${address}`,
  balanceUnit: 'lamports',
};