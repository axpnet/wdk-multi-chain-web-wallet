/**
 * Wallet Dashboard
 * Main interface for viewing and managing wallets
 */

import React, { useState, useEffect } from 'react';
import { WalletData, ChainType, FiatCurrency } from '../types/wallet';
import { WalletService } from '../services/WalletService';
import { FiatService } from '../services/FiatService';
import './WalletDashboard.css';

interface Props {
  walletId: string;
  password: string;
  onLogout: () => void;
}

export const WalletDashboard: React.FC<Props> = ({ walletId, password, onLogout }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrency>('USD');
  const [showMnemonic, setShowMnemonic] = useState(false);

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, password]);

  const loadWallet = async () => {
    try {
      const loadedWallet = await WalletService.loadWallet(walletId, password);
      setWallet(loadedWallet);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading wallet...</div>;
  }

  if (error || !wallet) {
    return (
      <div className="dashboard-error">
        <p>Error: {error}</p>
        <button onClick={onLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>{wallet.name}</h1>
          <div className="header-actions">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as FiatCurrency)}
              className="currency-selector"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="wallets-section">
          <h2>Your Wallets</h2>
          <div className="wallet-grid">
            {wallet.chains.map((chain, index) => (
              <WalletCard
                key={index}
                chain={chain}
                currency={selectedCurrency}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        </section>

        <section className="security-section">
          <h2>Security</h2>
          <div className="security-card">
            <div className="security-item">
              <h3>Recovery Phrase</h3>
              <p>Keep your recovery phrase safe and never share it with anyone</p>
              {showMnemonic ? (
                <div className="mnemonic-reveal">
                  <div className="mnemonic-words-small">
                    {wallet.mnemonic.split(' ').map((word, i) => (
                      <span key={i} className="word-small">
                        {i + 1}. {word}
                      </span>
                    ))}
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowMnemonic(false)}
                  >
                    Hide
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setShowMnemonic(true)}
                >
                  Show Recovery Phrase
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface WalletCardProps {
  chain: {
    chain: ChainType;
    address: string;
    privateKey?: string;
    publicKey?: string;
  };
  currency: FiatCurrency;
  onCopy: (text: string) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ chain, currency, onCopy }) => {
  const [balance, setBalance] = useState('0.0000');
  const [fiatValue, setFiatValue] = useState(0);

  useEffect(() => {
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, currency]);

  const loadBalance = async () => {
    // In production, fetch real balance from blockchain
    // For now, using mock data
    const mockBalance = Math.random() * 10;
    setBalance(mockBalance.toFixed(4));

    const prices = await FiatService.getPrice(chain.chain);
    const value = mockBalance * prices[currency];
    setFiatValue(value);
  };

  const getChainIcon = (chainType: ChainType): string => {
    const icons: { [key in ChainType]: string } = {
      EVM: '⟠',
      Solana: '◎',
      TON: '💎',
      Bitcoin: '₿',
      Litecoin: 'Ł',
    };
    return icons[chainType];
  };

  const getChainColor = (chainType: ChainType): string => {
    const colors: { [key in ChainType]: string } = {
      EVM: '#627eea',
      Solana: '#14f195',
      TON: '#0088cc',
      Bitcoin: '#f7931a',
      Litecoin: '#345d9d',
    };
    return colors[chainType];
  };

  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-card" style={{ borderTopColor: getChainColor(chain.chain) }}>
      <div className="wallet-header">
        <div className="chain-badge" style={{ background: getChainColor(chain.chain) }}>
          <span className="chain-icon-large">{getChainIcon(chain.chain)}</span>
          <span className="chain-name-badge">{chain.chain}</span>
        </div>
      </div>
      <div className="wallet-balance">
        <div className="balance-crypto">{balance}</div>
        <div className="balance-fiat">
          {FiatService.formatFiat(fiatValue, currency)}
        </div>
      </div>
      <div className="wallet-address">
        <span className="address-label">Address:</span>
        <div className="address-display">
          <span className="address-text">{shortenAddress(chain.address)}</span>
          <button
            className="btn-copy"
            onClick={() => onCopy(chain.address)}
            title="Copy address"
          >
            📋
          </button>
        </div>
      </div>
    </div>
  );
};
