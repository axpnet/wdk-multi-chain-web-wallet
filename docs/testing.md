# 🧪 Guida al Testing - WDK Wallet

## Panoramica

Il progetto WDK Wallet include una suite completa di test per garantire affidabilità e sicurezza. Questa guida spiega come configurare e eseguire i test.

## Struttura dei Test

```
test/
├── setup.js              # Configurazione globale test
├── modules/
│   ├── secure_storage.test.js    # Test crittografia e sicurezza
│   └── wallet_manager.test.js    # Test gestione wallet multipli
└── e2e/                  # Test end-to-end (futuri)
    └── wizard.spec.js    # Test flusso wizard
```

## Framework Utilizzati

- **Vitest**: Framework di testing veloce per unit test
- **Playwright**: Framework E2E per test browser
- **jsdom/happy-dom**: Ambiente DOM per test browser

## Installazione Dipendenze

```bash
npm install
```

Le dipendenze di testing sono già incluse in `package.json`.

## Esecuzione Test

### Unit Test

```bash
# Eseguire tutti i test unitari
npm run test:run

# Eseguire test con coverage
npm run test:coverage

# Modalità watch (sviluppo)
npm run test

# UI interattiva
npm run test:ui
```

### End-to-End Test

```bash
# Installare browser per E2E
npm run test:e2e:install

# Eseguire test E2E
npm run test:e2e

# Test E2E con browser visibile
npm run test:e2e:headed
```

## Configurazione

### Vitest (`vitest.config.js`)

```javascript
export default {
  test: {
    environment: 'node', // o 'jsdom' per DOM
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['**/*.{test,spec}.{js,mjs,cjs}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/']
    }
  }
}
```

### Playwright (`playwright.config.js`)

```javascript
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000'
  }
}
```

## Scrittura Test

### Esempio Unit Test

```javascript
import { describe, it, expect, vi } from 'vitest'
import { encryptData } from '../modules/secure_storage.js'

describe('encryptData', () => {
  it('should encrypt data with valid password', async () => {
    const data = 'test-data'
    const password = 'test-password'

    const result = await encryptData(data, password)

    expect(result).toHaveProperty('encrypted')
    expect(result).toHaveProperty('salt')
    expect(result).toHaveProperty('iv')
  })
})
```

### Esempio E2E Test

```javascript
import { test, expect } from '@playwright/test'

test('wizard flow', async ({ page }) => {
  await page.goto('/')

  // Test flusso wizard completo
  await page.click('text=Genera Seed')
  await page.fill('[data-testid="seed-input"]', 'test-seed')
  await page.click('text=Avanti')

  await expect(page.locator('text=Wallet creato!')).toBeVisible()
})
```

## Mock e Setup

### Setup Globale (`test/setup.js`)

```javascript
// Mock Web Crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      deriveKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
    getRandomValues: vi.fn()
  }
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})
```

## Coverage

Il progetto mira al 80%+ di coverage per codice critico:

- `modules/secure_storage.js`: 90%+ (crittografia)
- `modules/wallet_manager.js`: 85%+ (gestione wallet)
- Moduli UI: 70%+ (logica business)

## CI/CD Integration

I test vengono eseguiti automaticamente su:

- Push a main branch
- Pull request
- Release

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: |
    npm run test:run
    npm run test:coverage
    npm run test:e2e
```

## Debug Test

### Debug Unit Test

```bash
# Eseguire test specifico
npx vitest run secure_storage.test.js

# Debug con console.log
npx vitest run --reporter=verbose
```

### Debug E2E Test

```bash
# Test con browser visibile
npm run test:e2e:headed

# Debug specifico test
npx playwright test --debug wizard.spec.js
```

## Best Practices

### ✅ Da Fare

- Testare casi edge e errori
- Mock dipendenze esterne
- Usare descrizioni chiare
- Mantenere test indipendenti
- Coverage per logica critica

### ❌ Da Evitare

- Test implementation details
- Dipendenze da API esterne
- Test lenti o flaky
- Code duplication
- Test senza assertions

## Troubleshooting

### Problema: `EISDIR: illegal operation on a directory`

**Causa**: Path con caratteri speciali (#)
**Soluzione**: Rinominare directory progetto senza caratteri speciali
**Stato**: ⚠️ BLOCCA build e test - priorità critica da risolvere

### Problema: `jsdom not found`

**Causa**: Versione Node incompatibile
**Soluzione**: Usare Node 18+ o environment 'node'

### Problema: Test lenti

**Causa**: Troppi test sincroni
**Soluzione**: Usare `concurrent: true` e mock pesanti

## Metriche

- **Test Totali**: ~50+ unit test
- **Coverage Target**: 80%+
- **Tempo Esecuzione**: <30 secondi
- **E2E Test**: 5+ scenari principali

## Contributi

Per aggiungere test:

1. Creare file `*.test.js` in `test/`
2. Seguire naming convention
3. Aggiungere alla CI se necessario
4. Aggiornare questa documentazione

---

**Nota**: I test sono configurati per ambiente Node 18+. Per versioni precedenti, considerare upgrade Node o test semplificati.