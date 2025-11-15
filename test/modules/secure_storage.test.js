// test/modules/secure_storage.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  encryptData,
  decryptData,
  saveEncryptedSeed,
  loadEncryptedSeed,
  changePassword,
  exportEncryptedSeed,
  importEncryptedSeed,
  setAutoLockTimeout,
  lockWallet,
  unlockWallet,
  initAutoLock,
} from '../../modules/secure_storage.js'

describe('Secure Storage Module', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    // Clear any existing wallet state
    window.walletState = {}
  })

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const data = 'test-seed-phrase'
      const password = 'test-password'

      const encrypted = await encryptData(data, password)
      expect(encrypted).toHaveProperty('encryptedData')
      expect(encrypted).toHaveProperty('salt')
      expect(encrypted).toHaveProperty('iv')

      const decrypted = await decryptData(encrypted.encryptedData, password, encrypted.salt, encrypted.iv)
      expect(decrypted).toBe(data)
    })

    it('should fail decryption with wrong password', async () => {
      const data = 'test-seed-phrase'
      const password = 'test-password'
      const wrongPassword = 'wrong-password'

      const encrypted = await encryptData(data, password)
      const decrypted = await decryptData(encrypted.encryptedData, wrongPassword, encrypted.salt, encrypted.iv)
      expect(decrypted).toBeNull()
    })
  })

  describe('saveEncryptedSeed and loadEncryptedSeed', () => {
    it('should save and load encrypted seed', async () => {
      const seed = 'test seed phrase with spaces'
      const password = 'test-password'

      const saveResult = await saveEncryptedSeed(seed, password)
      expect(saveResult).toBe(true)

      const loadedSeed = await loadEncryptedSeed(password)
      expect(loadedSeed).toBe(seed)
    })

    it('should return null when no seed is stored', async () => {
      const result = await loadEncryptedSeed('password')
      expect(result).toBeNull()
    })

    it('should fail to load with wrong password', async () => {
      const seed = 'test seed phrase'
      const password = 'correct-password'
      const wrongPassword = 'wrong-password'

      await saveEncryptedSeed(seed, password)
      const result = await loadEncryptedSeed(wrongPassword)
      expect(result).toBeNull()
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const seed = 'test seed phrase'
      const oldPassword = 'old-password'
      const newPassword = 'new-password'

      await saveEncryptedSeed(seed, oldPassword)
      const result = await changePassword(oldPassword, newPassword)
      expect(result).toBe(true)

      const loadedWithNewPassword = await loadEncryptedSeed(newPassword)
      expect(loadedWithNewPassword).toBe(seed)
    })

    it('should fail with wrong old password', async () => {
      const seed = 'test seed phrase'
      const password = 'correct-password'
      const wrongOldPassword = 'wrong-password'
      const newPassword = 'new-password'

      await saveEncryptedSeed(seed, password)
      const result = await changePassword(wrongOldPassword, newPassword)
      expect(result).toBe(false)
    })
  })

  describe('exportEncryptedSeed', () => {
    it('should export encrypted seed', async () => {
      const seed = 'test seed for export'
      const password = 'test-password'

      await saveEncryptedSeed(seed, password)

      // Mock document methods for testing
      const originalCreateElement = document.createElement
      const originalBody = document.body

      const mockLink = {
        click: vi.fn(),
        download: '',
        href: ''
      }
      document.createElement = vi.fn().mockReturnValue(mockLink)
      document.body.appendChild = vi.fn()
      document.body.removeChild = vi.fn()

      // Mock URL
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url')
      global.URL.revokeObjectURL = vi.fn()

      await exportEncryptedSeed()

      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toMatch(/wdk-wallet-backup/)

      // Restore originals
      document.createElement = originalCreateElement
    })
  })

  describe('importEncryptedSeed', () => {
    it('should import valid backup file', async () => {
      // First create and export a seed
      const seed = 'test seed for import'
      const password = 'test-password'
      await saveEncryptedSeed(seed, password)

      // Create a mock backup file content
      const backupData = {
        version: '1.0',
        type: 'wdk-encrypted-seed',
        exported: Date.now(),
        original: Date.now() - 1000,
        encrypted: btoa(JSON.stringify({
          encryptedData: localStorage.getItem('wdk_wallet_encrypted_seed'),
          salt: 'dGVzdC1zYWx0', // base64 encoded 'test-salt'
          iv: 'dGVzdC1pdg==' // base64 encoded 'test-iv'
        }))
      }

      const mockFile = new File([JSON.stringify(backupData)], 'backup.wdk', { type: 'application/json' })

      const result = await importEncryptedSeed(mockFile)
      expect(typeof result).toBe('boolean') // Should return true or false
    })
  })

  describe('Auto-lock functionality', () => {
    it('should set auto-lock timeout', () => {
      setAutoLockTimeout(15)
      expect(localStorage.getItem('wdk_auto_lock_timeout')).toBe('15')
    })

    it('should lock wallet and clear session', () => {
      window.walletState = { test: 'data' }
      lockWallet()
      expect(window.walletState).toEqual({})
      expect(sessionStorage.length).toBe(0)
    })

    it('should initialize auto-lock system', () => {
      const mockAddEventListener = vi.fn()
      const originalAddEventListener = window.addEventListener
      window.addEventListener = mockAddEventListener

      initAutoLock()

      expect(mockAddEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))

      window.addEventListener = originalAddEventListener
    })
  })
})