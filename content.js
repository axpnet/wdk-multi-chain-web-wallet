// content.js - Inject Ethereum provider into web pages

// Only inject if not already present (don't override MetaMask, etc.)
if (!window.ethereum) {
  // Inject the provider script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}