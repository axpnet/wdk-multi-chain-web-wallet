# 🔒 Security Guide - WDK Wallet

<div align="center">
  <p>
    <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Ethereum" width="40" height="40" title="Ethereum"/>
    <img src="https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" alt="Polygon" width="40" height="40" title="Polygon"/>
    <img src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" alt="BSC" width="40" height="40" title="BNB Smart Chain"/>
    <img src="https://assets.coingecko.com/coins/images/4128/small/solana.png" alt="Solana" width="40" height="40" title="Solana"/>
    <img src="https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png" alt="TON" width="40" height="40" title="TON"/>
  </p>
</div>

The security of your funds is the **top priority**. This guide teaches you how to protect your wallet and manage cryptocurrencies safely.

## 📋 Table of Contents

- [Security Levels](#security-levels)
- [Seed Phrase](#seed-phrase)
- [Password](#password)
- [Local Storage](#local-storage)
- [Best Practices](#best-practices)
- [Risk Scenarios](#risk-scenarios)

---

## ⭐ Security Levels

WDK Wallet implements **multiple security layers** to protect your assets:

### **★★★★★ Encryption**
- **AES-256** for seed phrase and private keys
- **PBKDF2** with 100,000 iterations for key derivation
- **No plain text data** saved on disk

### **★★★★☆ Isolation**
- **Completely local** storage (no cloud)
- **No third-party** servers
- Data **isolated by domain** (browser sandbox)

### **★★★☆☆ Auto-lock**
- Automatic lock after **inactivity**
- Password required for sensitive operations
- Configurable timeout

### **★★☆☆☆ Backup**
- Seed phrase **saved by user** offline
- No automatic cloud backup
- User responsibility for recovery

---

## 🔑 Seed Phrase

### **What is it?**
The **seed phrase** (or mnemonic) is a sequence of 12 words that represents your wallet's master key. From this, all addresses for all blockchains are derived.

### **Critical Importance**
- 🔴 **With the seed, you have TOTAL access** to the wallet
- 🔴 **Lost seed = Funds lost PERMANENTLY**
- 🔴 **If someone gets it = Immediate theft**

### **How to Protect It**

#### ✅ **DO - Do This:**
1. **Write on paper** (by hand, legible)
2. Store in **multiple safe physical locations**:
   - Safe at home
   - Bank safety deposit box
   - With trusted person (split into 2 parts)
3. **Engrave on metal** for fire/water protection
4. **Never digitize** (no photos, no cloud, no email)
5. Periodically verify it's **still readable**

#### ❌ **DON'T - Never Do:**
1. ❌ Save on computer, smartphone, tablet
2. ❌ Take photos with phone
3. ❌ Send via email, WhatsApp, Telegram
4. ❌ Save on cloud (Google Drive, Dropbox, iCloud)
5. ❌ Share with anyone (not even "tech support")
6. ❌ Type on suspicious websites

### **Seed Compromise**
If you suspect your seed has been compromised:
1. 🚨 **IMMEDIATELY create a new wallet**
2. 🚨 **Transfer ALL funds** to the new wallet
3. 🚨 **Abandon the old wallet**

---

## 🔐 Password

### **Purpose**
The password **encrypts the seed phrase** before saving it locally in the browser. Without the password, saved data is unusable.

### **Minimum Requirements**
- Minimum **12 characters**
- Mix of uppercase, lowercase, numbers, symbols
- **Don't reuse** passwords from other services
- **Don't use** dictionary words

### **Strong Password - Examples**
✅ `My$ecur3W@ll3t2025!`  
✅ `Tr4ding&S@v1ngs#PWA`  
❌ `password123`  
❌ `bitcoin2025`  

### **Password Manager**
- ✅ Use a **password manager** (Bitwarden, 1Password, KeePass)
- ✅ Enable **2FA** on the password manager
- ✅ Make regular backups of the password manager database

### **Forgotten Password?**
- If you forget the password → **use the seed phrase** to reimport
- The seed is the **universal backup** of the wallet
- Password can be changed anytime with the seed

---

## 💾 Local Storage

### **How It Works**
WDK Wallet uses:
- **localStorage** for metadata (wallet name, last access)
- **indexedDB** for encrypted data (seed, private keys)

### **Browser Security**
- Data **isolated by origin** (domain + protocol + port)
- Browser **sandbox** prevents access from other apps
- **HTTPS** required for transport security

### **What's Saved**
- ✅ Seed phrase **ENCRYPTED** with AES-256
- ✅ Wallet name (public metadata)
- ✅ Last access timestamp
- ❌ **NEVER** saved seed in plain text
- ❌ **NEVER** saved password

### **Risks**
- 🔴 **Malware** on PC can read localStorage/indexedDB
- 🔴 **Keylogger** can capture password
- 🔴 **Clear browser data** deletes wallet (need seed for recovery)

### **Mitigation**
- ✅ Use **updated antivirus**
- ✅ Avoid **suspicious browser extensions**
- ✅ Backup the **seed phrase**
- ✅ Don't use on **public** or untrusted PCs

---

## ✅ Best Practices

### **🔒 Operational Security**

#### **General**
- ✅ Use **trusted personal device**
- ✅ Keep **OS updated** (Windows/Mac/Linux)
- ✅ Use **updated browser** (Chrome, Brave, Firefox)
- ✅ Enable **firewall**
- ✅ Use **active antivirus**

#### **Network**
- ✅ Use **private WiFi** (home)
- ❌ Avoid **public WiFi** (cafes, airports)
- ✅ Use **VPN** if necessary
- ❌ Never transact on untrusted networks

#### **Transactions**
- ✅ **Always verify** recipient address (copy entire, don't type)
- ✅ Start with **small amounts** to test
- ✅ Check **network fees** before confirming
- ✅ Save **transaction hash** for tracking

### **💼 Multi-Wallet Management**

- ✅ **Separate** wallets for different purposes:
  - **Cold wallet**: Long-term savings (rarely used)
  - **Hot wallet**: Daily operations (limited amount)
  - **Trading wallet**: Exchange trades
- ✅ Never keep **all funds** in one wallet
- ✅ Use **hardware wallet** (Ledger, Trezor) for large amounts

### **🔄 Backup & Recovery**

- ✅ Backup **seed phrase** in at least **2 physical locations**
- ✅ Periodic **recovery** test (import in temporary wallet)
- ✅ **Succession** plan (how family accesses in emergency)
- ✅ Clear documentation (non-technical) for heirs

---

## ⚠️ Risk Scenarios

### **1. Phishing**

**Attack:**
- Fake email/SMS that looks legitimate
- Link to cloned site asking for seed phrase
- "Tech support" requesting access

**Defense:**
- ✅ Always verify **URL** of the site (https://axpnet.github.io/...)
- ✅ No support **ever** asks for seed
- ✅ Don't click suspicious links in emails
- ✅ Type URL manually in browser

### **2. Malware**

**Attack:**
- Keylogger captures password
- Screen recorder records seed during setup
- Clipboard hijacker modifies copied address

**Defense:**
- ✅ Always active updated antivirus
- ✅ Don't download software from unverified sources
- ✅ Periodic system scan
- ✅ **Always** verify pasted address before sending

### **3. Social Engineering**

**Attack:**
- "Tech support" on Telegram/Discord
- "Giveaway" asking for seed to "verify wallet"
- False urgency ("your wallet is about to be blocked")

**Defense:**
- ✅ **Never share** seed with ANYONE
- ✅ No legitimate "support" asks for seed
- ✅ Don't trust unsolicited messages
- ✅ Verify identity on official channels

### **4. Physical Theft**

**Attack:**
- Device theft with unlocked wallet
- Physical access to paper seed phrase

**Defense:**
- ✅ Automatic wallet lock after inactivity
- ✅ Seed in **safe** or **safety deposit box**
- ✅ Full disk encryption (BitLocker, FileVault)
- ✅ Device access password

### **5. Browser Extension Compromise**

**Attack:**
- Malware extension reads localStorage
- Fake update of legitimate extension

**Defense:**
- ✅ Only install extensions from **official stores**
- ✅ Verify **developer** and **reviews**
- ✅ Disable unnecessary extensions
- ✅ Use **separate browser profiles** (one for crypto)

---

## 🚨 In Case of Emergency

### **Compromised Wallet**

1. **STOP** - Don't touch the compromised wallet
2. **CREATE** new wallet with new seed
3. **TRANSFER** all funds to new wallet (maximum priority)
4. **ABANDON** old wallet
5. **ANALYZE** how the compromise happened
6. **PREVENT** by changing security practices

### **Lost Seed**

- 🔴 **Funds irrecoverable** if:
  - No seed backup
  - No access to active wallet
- 🟡 **Funds recoverable** if:
  - Have seed backup elsewhere
  - Wallet still accessible (transfer immediately)

### **Forgotten Password**

- 🟢 **Recoverable** with seed phrase:
  1. Click "Import Wallet"
  2. Enter seed phrase
  3. Choose new password
  4. ✅ Wallet recovered

---

## 📚 Additional Resources

### **Deep Dives**
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 HD Wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [OWASP Crypto Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

### **Verification Tools**
- [Have I Been Pwned](https://haveibeenpwned.com/) - Check email/password
- [VirusTotal](https://www.virustotal.com/) - Scan files/URLs
- [Blockchain Explorers](https://etherscan.io/) - Verify transactions

### **Community**
- 💬 [GitHub Discussions](https://github.com/axpnet/wdk-multi-chain-web-wallet/discussions)
- 🐛 [Report Security Issues](mailto:info@axpdev.it)

---

## ⚖️ Disclaimer

**WDK Wallet is open source software provided "as-is" without warranties.**

- ✅ You are **solely responsible** for your funds' security
- ✅ Developers **have no access** to your seed/passwords
- ✅ **Always backup** the seed phrase
- ✅ Use **small amounts** for initial tests
- ✅ Read the software **license**

---

**🔐 Security is a continuous process, not a single event.**

Stay informed, update your practices, protect your assets.

---

**© 2025 axpdev** — Secure development for Web3
