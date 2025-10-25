/**
 * 4-Step Onboarding Wizard
 * Step 1: Welcome & Choose create/import
 * Step 2: Wallet name & password
 * Step 3: Select chains
 * Step 4: Mnemonic display/input & confirmation
 */

import React, { useState } from 'react';
import { ChainType, OnboardingState } from '../types/wallet';
import { WalletService } from '../services/WalletService';
import './OnboardingWizard.css';

interface Props {
  onComplete: (walletId: string) => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    walletName: '',
    password: '',
    confirmPassword: '',
    selectedChains: [],
    isImporting: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allChains: ChainType[] = ['EVM', 'Solana', 'TON', 'Bitcoin', 'Litecoin'];

  const handleNext = async () => {
    setError('');

    if (state.step === 1) {
      setState({ ...state, step: 2 });
    } else if (state.step === 2) {
      if (!state.walletName.trim()) {
        setError('Please enter a wallet name');
        return;
      }
      if (state.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (state.password !== state.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setState({ ...state, step: 3 });
    } else if (state.step === 3) {
      if (state.selectedChains.length === 0) {
        setError('Please select at least one blockchain');
        return;
      }
      if (!state.isImporting) {
        const mnemonic = WalletService.generateMnemonic();
        setState({ ...state, mnemonic, step: 4 });
      } else {
        setState({ ...state, step: 4 });
      }
    } else if (state.step === 4) {
      if (!state.mnemonic) {
        setError('Please enter your recovery phrase');
        return;
      }
      if (!WalletService.validateMnemonic(state.mnemonic)) {
        setError('Invalid recovery phrase');
        return;
      }
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const wallet = await WalletService.createWallet(
        state.walletName,
        state.selectedChains,
        state.mnemonic
      );
      await WalletService.saveWallet(wallet, state.password);
      onComplete(wallet.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      setState({ ...state, step: state.step - 1 });
    }
  };

  const toggleChain = (chain: ChainType) => {
    const chains = state.selectedChains.includes(chain)
      ? state.selectedChains.filter((c) => c !== chain)
      : [...state.selectedChains, chain];
    setState({ ...state, selectedChains: chains });
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <div className="step">
            <h2>Welcome to Multi-Chain Wallet</h2>
            <p>Secure crypto wallet supporting EVM, Solana, TON, Bitcoin, and Litecoin</p>
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => setState({ ...state, isImporting: false })}
              >
                Create New Wallet
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setState({ ...state, isImporting: true })}
              >
                Import Existing Wallet
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step">
            <h2>{state.isImporting ? 'Import Wallet' : 'Create New Wallet'}</h2>
            <div className="form-group">
              <label>Wallet Name</label>
              <input
                type="text"
                value={state.walletName}
                onChange={(e) => setState({ ...state, walletName: e.target.value })}
                placeholder="My Wallet"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={state.password}
                onChange={(e) => setState({ ...state, password: e.target.value })}
                placeholder="Enter password (min 8 characters)"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={state.confirmPassword}
                onChange={(e) => setState({ ...state, confirmPassword: e.target.value })}
                placeholder="Confirm password"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step">
            <h2>Select Blockchains</h2>
            <p>Choose which blockchains to support in your wallet</p>
            <div className="chain-selector">
              {allChains.map((chain) => (
                <div
                  key={chain}
                  className={`chain-card ${
                    state.selectedChains.includes(chain) ? 'selected' : ''
                  }`}
                  onClick={() => toggleChain(chain)}
                >
                  <div className="chain-icon">{getChainIcon(chain)}</div>
                  <div className="chain-name">{chain}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step">
            <h2>
              {state.isImporting ? 'Enter Recovery Phrase' : 'Save Recovery Phrase'}
            </h2>
            {!state.isImporting ? (
              <div className="mnemonic-display">
                <p className="warning">
                  ⚠️ Write down your recovery phrase and keep it safe. Never share it
                  with anyone!
                </p>
                <div className="mnemonic-words">
                  {state.mnemonic?.split(' ').map((word, i) => (
                    <div key={i} className="word">
                      <span className="word-number">{i + 1}</span>
                      <span className="word-text">{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Recovery Phrase (12 words)</label>
                <textarea
                  rows={4}
                  value={state.mnemonic || ''}
                  onChange={(e) => setState({ ...state, mnemonic: e.target.value })}
                  placeholder="Enter your 12-word recovery phrase"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-wizard">
      <div className="wizard-container">
        <div className="wizard-progress">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`progress-step ${state.step >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>

        {renderStep()}

        {error && <div className="error-message">{error}</div>}

        <div className="wizard-actions">
          {state.step > 1 && (
            <button className="btn btn-secondary" onClick={handleBack} disabled={loading}>
              Back
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={loading || (state.step === 1 && !state.isImporting && state.isImporting === false && state.walletName === '')}
          >
            {loading ? 'Processing...' : state.step === 4 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

function getChainIcon(chain: ChainType): string {
  const icons: { [key in ChainType]: string } = {
    EVM: '⟠',
    Solana: '◎',
    TON: '💎',
    Bitcoin: '₿',
    Litecoin: 'Ł',
  };
  return icons[chain];
}
