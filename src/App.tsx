import React, { useState } from 'react';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Login } from './components/Login';
import { WalletDashboard } from './components/WalletDashboard';
import './App.css';

type AppState = 'onboarding' | 'login' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentWalletId, setCurrentWalletId] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');

  const handleOnboardingComplete = (walletId: string) => {
    setCurrentWalletId(walletId);
    setAppState('login');
  };

  const handleLogin = (walletId: string, password: string) => {
    setCurrentWalletId(walletId);
    setCurrentPassword(password);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setCurrentWalletId('');
    setCurrentPassword('');
    setAppState('login');
  };

  const handleCreateNew = () => {
    setAppState('onboarding');
  };

  return (
    <div className="App">
      {appState === 'onboarding' && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}
      {appState === 'login' && (
        <Login onLogin={handleLogin} onCreateNew={handleCreateNew} />
      )}
      {appState === 'dashboard' && (
        <WalletDashboard
          walletId={currentWalletId}
          password={currentPassword}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
