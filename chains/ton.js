import WalletManagerTon from '@tetherto/wdk-wallet-ton';

export const ton = {
  name: 'ton',
  manager: WalletManagerTon,
  config: {
    tonClient: {
      url: import.meta.env.VITE_TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC',  // Usa env o default
      apiKey: import.meta.env.VITE_TON_API_KEY || '',  // '' per testnet
    },
  },
  explorerUrl: (address) => `https://tonscan.org/address/${address}`,
  balanceUnit: 'nanoTON',
};
