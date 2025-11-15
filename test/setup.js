// test/setup.js - Setup globale per i test
import { beforeAll, afterAll, vi } from 'vitest'

// Mock Web Crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      deriveKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
  },
  writable: true,
})

// Mock fetch
global.fetch = vi.fn()

// Cleanup after each test
afterAll(() => {
  vi.clearAllMocks()
})