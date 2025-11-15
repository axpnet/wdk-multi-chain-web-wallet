// e2e/wallet.spec.js - Test end-to-end per funzionalità wallet
import { test, expect } from '@playwright/test'

test.describe('Wallet Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create a test wallet first
    await page.goto('/')

    // Create wallet
    await page.click('text=Nuovo Wallet')
    await page.fill('[data-testid="wallet-name"]', 'E2E Test Wallet')
    await page.fill('[data-testid="wallet-password"]', 'TestPass123!')
    await page.fill('[data-testid="wallet-password-confirm"]', 'TestPass123!')
    await page.click('text=Avanti')

    // Generate and save seed
    await page.click('text=Genera Seed')
    await page.click('text=💾 Salva Seed (Sicuro)')
    await page.click('text=Conferma Salvataggio')
    await page.click('text=Avanti')

    // Skip verification for speed
    await page.click('text=Salta Verifica')
    await page.click('text=Avanti')

    // Initialize wallet
    await page.click('text=Inizializza Tutti')
    await page.waitForSelector('text=Wallet pronto!', { timeout: 30000 })
  })

  test('should display wallet balances', async ({ page }) => {
    // Check if balances are loaded
    await page.waitForSelector('[data-testid="balance-eth"]', { timeout: 10000 })

    // Should show some balance information (even if 0)
    const ethBalance = await page.locator('[data-testid="balance-eth"]').textContent()
    expect(ethBalance).toBeDefined()
  })

  test('should switch between chains', async ({ page }) => {
    // Click chain selector
    await page.click('[data-testid="chain-selector"]')

    // Select Polygon
    await page.click('text=Polygon')
    await expect(page.locator('[data-testid="active-chain"]')).toContainText('Polygon')

    // Select BSC
    await page.click('[data-testid="chain-selector"]')
    await page.click('text=BSC')
    await expect(page.locator('[data-testid="active-chain"]')).toContainText('BSC')
  })

  test('should show receive modal with QR code', async ({ page }) => {
    // Click receive button
    await page.click('[data-testid="receive-btn"]')

    // Modal should appear
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('text=Ricevi')).toBeVisible()

    // QR code should be present
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible()

    // Address should be displayed
    const address = await page.locator('[data-testid="wallet-address"]').textContent()
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/) // Ethereum address format
  })

  test('should show send form for active chain', async ({ page }) => {
    // Click send button
    await page.click('[data-testid="send-btn"]')

    // Send modal should appear
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('text=Invia')).toBeVisible()

    // Should show current chain
    await expect(page.locator('text=ETH')).toBeVisible()

    // Form fields should be present
    await expect(page.locator('[data-testid="recipient-address"]')).toBeVisible()
    await expect(page.locator('[data-testid="send-amount"]')).toBeVisible()
  })

  test('should validate send form', async ({ page }) => {
    await page.click('[data-testid="send-btn"]')

    // Try to send without filling fields
    await page.click('[data-testid="send-confirm"]')

    // Should show validation errors
    await expect(page.locator('text=Indirizzo richiesto')).toBeVisible()
    await expect(page.locator('text=Importo richiesto')).toBeVisible()

    // Fill invalid address
    await page.fill('[data-testid="recipient-address"]', 'invalid-address')
    await page.fill('[data-testid="send-amount"]', '1.5')

    // Should show address validation error
    await expect(page.locator('text=Indirizzo non valido')).toBeVisible()
  })

  test('should access security settings', async ({ page }) => {
    // Click security button
    await page.click('[data-testid="security-btn"]')

    // Security dialog should appear
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('text=Sicurezza')).toBeVisible()

    // Should show security options
    await expect(page.locator('text=Cambia Password')).toBeVisible()
    await expect(page.locator('text=Gestisci Backup')).toBeVisible()
    await expect(page.locator('text=Auto-Lock')).toBeVisible()
  })

  test('should lock and unlock wallet', async ({ page }) => {
    // Lock wallet
    await page.click('[data-testid="lock-btn"]')

    // Should show lock screen
    await expect(page.locator('text=Wallet Bloccato')).toBeVisible()

    // Unlock with password
    await page.fill('[data-testid="unlock-password"]', 'TestPass123!')
    await page.click('[data-testid="unlock-btn"]')

    // Should show wallet again
    await expect(page.locator('text=E2E Test Wallet')).toBeVisible()
  })

  test('should switch theme', async ({ page }) => {
    // Check initial theme
    const bodyClass = await page.locator('body').getAttribute('class')
    expect(bodyClass).toContain('theme-')

    // Switch to dark theme
    await page.click('[data-testid="theme-dark"]')
    await expect(page.locator('body')).toHaveClass(/theme-dark/)

    // Switch to light theme
    await page.click('[data-testid="theme-light"]')
    await expect(page.locator('body')).toHaveClass(/theme-light/)
  })
})