/**
 * Login Component
 * Allows users to select and unlock their wallet
 */

import React, { useState, useEffect } from 'react';
import { WalletService } from '../services/WalletService';
import './Login.css';

interface Props {
  onLogin: (walletId: string, password: string) => void;
  onCreateNew: () => void;
}

export const Login: React.FC<Props> = ({ onLogin, onCreateNew }) => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const stored = WalletService.getStoredWallets();
    setWallets(stored.wallets);
    if (stored.wallets.length > 0) {
      setSelectedWallet(stored.wallets[0].id);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedWallet) {
      setError('Please select a wallet');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      // Verify password by attempting to load wallet
      await WalletService.loadWallet(selectedWallet, password);
      onLogin(selectedWallet, password);
    } catch (err: any) {
      setError('Invalid password');
      setLoading(false);
    }
  };

  const handleDelete = (walletId: string, walletName: string) => {
    if (window.confirm(`Are you sure you want to delete wallet "${walletName}"?`)) {
      WalletService.deleteWallet(walletId);
      loadWallets();
      setPassword('');
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Multi-Chain Wallet</h1>
          <p className="welcome-text">Welcome! Create your first wallet to get started.</p>
          <button className="btn btn-primary" onClick={onCreateNew}>
            Create New Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Multi-Chain Wallet</h1>
        <p className="subtitle">Unlock your wallet to continue</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Select Wallet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="wallet-select"
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock Wallet'}
          </button>
        </form>

        <div className="login-actions">
          <button className="btn-link" onClick={onCreateNew}>
            Create New Wallet
          </button>
          {selectedWallet && (
            <button
              className="btn-link btn-danger"
              onClick={() => {
                const wallet = wallets.find((w) => w.id === selectedWallet);
                if (wallet) handleDelete(wallet.id, wallet.name);
              }}
            >
              Delete Selected Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
