import WalletManagerBtc from '@tetherto/wdk-wallet-btc';

// Use the official WDK Bitcoin wallet manager for better cross-browser
// compatibility. The manager will be registered by the app and used via WDK.
export const bitcoin = {
  name: 'bitcoin',
  manager: WalletManagerBtc,
  // Example config: an Electrum host + network info. Depending on the
  // manager implementation the shape may vary; this is a reasonable
  // default for demo purposes.
  config: {
    host: 'electrum.blockstream.info',
    port: 50001,
    protocol: 'tcp',
    network: 'bitcoin',
  },
  explorerUrl: (address) => `https://blockstream.info/address/${address}`,
  balanceUnit: 'satoshi',
};