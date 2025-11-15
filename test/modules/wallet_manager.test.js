// test/modules/wallet_manager.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
  setActiveWallet,
  getActiveWallet,
  logout,
  hasWallets,
  formatLastAccess,
} from '../../modules/wallet_manager.js'

describe('Wallet Manager Module', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAllWallets', () => {
    it('should return empty array when no wallets exist', () => {
      const wallets = getAllWallets()
      expect(wallets).toEqual([])
    })

    it('should return wallets array when wallets exist', () => {
      const testWallets = [
        {
          id: 'wallet-1',
          name: 'Test Wallet 1',
          encryptedSeed: 'encrypted-data-1',
          salt: 'salt-1',
          iv: 'iv-1',
          createdAt: new Date().toISOString(),
          lastAccess: new Date().toISOString()
        }
      ]
      localStorage.setItem('wdk_wallets', JSON.stringify(testWallets))

      const wallets = getAllWallets()
      expect(wallets).toHaveLength(1)
      expect(wallets[0]).toEqual(testWallets[0])
    })
  })

  describe('createWallet', () => {
    it('should create new wallet with valid data', () => {
      const name = 'Test Wallet'
      const encryptedData = 'encrypted-seed'
      const salt = 'test-salt'
      const iv = 'test-iv'

      const wallet = createWallet(name, encryptedData, salt, iv)

      expect(wallet).toHaveProperty('id')
      expect(wallet.name).toBe(name)
      expect(wallet.encryptedSeed).toBe(encryptedData)
      expect(wallet.salt).toBe(salt)
      expect(wallet.iv).toBe(iv)
      expect(wallet).toHaveProperty('createdAt')
      expect(wallet).toHaveProperty('lastAccess')
    })

    it('should generate unique IDs for different wallets', () => {
      const wallet1 = createWallet('Wallet 1', 'data1', 'salt1', 'iv1')
      const wallet2 = createWallet('Wallet 2', 'data2', 'salt2', 'iv2')

      expect(wallet1.id).not.toBe(wallet2.id)
      expect(wallet1.name).toBe('Wallet 1')
      expect(wallet2.name).toBe('Wallet 2')
    })
  })

  describe('getWalletById', () => {
    it('should return wallet by id', () => {
      const wallet = createWallet('Test Wallet', 'data', 'salt', 'iv')
      const found = getWalletById(wallet.id)

      expect(found).toEqual(wallet)
    })

    it('should return null for non-existent wallet', () => {
      const found = getWalletById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('setActiveWallet', () => {
    it('should set active wallet', () => {
      const wallet = createWallet('Test Wallet', 'data', 'salt', 'iv')
      const result = setActiveWallet(wallet.id)

      expect(result).toBe(true)
      expect(localStorage.getItem('wdk_active_wallet_id')).toBe(wallet.id)
    })
  })

  describe('getActiveWallet', () => {
    it('should return active wallet id', () => {
      const wallet = createWallet('Test Wallet', 'data', 'salt', 'iv')
      setActiveWallet(wallet.id)

      const activeId = getActiveWallet()
      expect(activeId).toEqual(wallet)
    })

    it('should return null when no active wallet', () => {
      const active = getActiveWallet()
      expect(active).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear active wallet', () => {
      const wallet = createWallet('Test Wallet', 'data', 'salt', 'iv')
      setActiveWallet(wallet.id)

      logout()

      expect(localStorage.getItem('wdk_active_wallet_id')).toBeNull()
    })
  })

  describe('hasWallets', () => {
    it('should return true when wallets exist', () => {
      createWallet('Test Wallet', 'data', 'salt', 'iv')
      const result = hasWallets()
      expect(result).toBe(true)
    })

    it('should return false when no wallets exist', () => {
      const result = hasWallets()
      expect(result).toBe(false)
    })

    it('should return false for empty wallets object', () => {
      localStorage.setItem('wdk_wallets', JSON.stringify([]))
      const result = hasWallets()
      expect(result).toBe(false)
    })
  })

  describe('formatLastAccess', () => {
    it('should format ISO date string', () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      const formatted = formatLastAccess(recentDate)
      expect(formatted).toBe('30 min fa')
    })

    it('should handle invalid date', () => {
      const formatted = formatLastAccess('invalid-date')
      expect(formatted).toBe('Data non valida')
    })
  })
})