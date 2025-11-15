// e2e/wizard.spec.js - Test end-to-end per flusso wizard
import { test, expect } from '@playwright/test'

test.describe('Wizard Flow', () => {
  test('should complete full wallet creation wizard', async ({ page }) => {
    await page.goto('/')

    // Step 0: Welcome screen
    await expect(page.locator('text=WDK Wallet')).toBeVisible()
    await page.click('text=Nuovo Wallet')

    // Step 1: Setup wallet name and password
    await expect(page.locator('text=Crea Nuovo Wallet')).toBeVisible()
    await page.fill('[data-testid="wallet-name"]', 'Test Wallet E2E')
    await page.fill('[data-testid="wallet-password"]', 'TestPassword123!')
    await page.fill('[data-testid="wallet-password-confirm"]', 'TestPassword123!')
    await page.click('text=Avanti')

    // Step 2: Generate seed
    await expect(page.locator('text=Genera la tua Seed Phrase')).toBeVisible()
    await page.click('text=Genera Seed')
    const seedText = await page.locator('[data-testid="generated-seed"]').textContent()
    expect(seedText).toBeTruthy()
    expect(seedText.split(' ').length).toBeGreaterThanOrEqual(12)

    // Copy seed for verification
    const seedPhrase = seedText.trim()

    // Step 3: Verify seed
    await page.click('text=Avanti')
    await expect(page.locator('text=Verifica la tua Seed')).toBeVisible()

    // Fill verification form
    const words = seedPhrase.split(' ')
    for (let i = 0; i < words.length; i++) {
      await page.fill(`[data-testid="word-${i + 1}"]`, words[i])
    }
    await page.click('text=Verifica')

    // Step 4: Initialize wallet
    await expect(page.locator('text=Inizializza Wallet Multi-Chain')).toBeVisible()
    await page.click('text=Inizializza Tutti')

    // Wait for initialization to complete
    await page.waitForSelector('text=Wallet pronto!', { timeout: 30000 })

    // Verify wallet panel is shown
    await expect(page.locator('text=Wallet Test Wallet E2E')).toBeVisible()
  })

  test('should handle wallet recovery from manual seed', async ({ page }) => {
    await page.goto('/')

    await page.click('text=Nuovo Wallet')

    // Setup wallet
    await page.fill('[data-testid="wallet-name"]', 'Recovery Test')
    await page.fill('[data-testid="wallet-password"]', 'RecoveryPass123!')
    await page.fill('[data-testid="wallet-password-confirm"]', 'RecoveryPass123!')
    await page.click('text=Avanti')

    // Choose manual seed entry
    await page.click('text=Inserisci seed manuale')
    const testSeed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    await page.fill('[data-testid="manual-seed"]', testSeed)
    await page.click('text=Avanti')

    // Skip verification for this test
    await page.click('text=Salta Verifica')

    // Initialize
    await page.click('text=Inizializza Tutti')
    await page.waitForSelector('text=Wallet pronto!', { timeout: 30000 })

    await expect(page.locator('text=Wallet Recovery Test')).toBeVisible()
  })

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/')

    await page.click('text=Nuovo Wallet')

    // Try weak password
    await page.fill('[data-testid="wallet-name"]', 'Test Wallet')
    await page.fill('[data-testid="wallet-password"]', '123')
    await page.fill('[data-testid="wallet-password-confirm"]', '123')
    await page.click('text=Avanti')

    // Should show error
    await expect(page.locator('text=Password troppo debole')).toBeVisible()
  })
})