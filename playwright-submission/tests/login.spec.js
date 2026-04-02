const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Tests generated from the feature description (docs/1_feature_description.txt)
// Using the demo site: https://the-internet.herokuapp.com/login

const BASE = 'https://the-internet.herokuapp.com/login';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

test.describe('Demo App - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  // Pause after each test to make the UI visible for manual observation.
  // Use the SLOW_MS environment variable to control this value (milliseconds).
  test.afterEach(async ({ page }, testInfo) => {
    const ms = Number(process.env.SLOW_MS) || 1500;
    await page.waitForTimeout(ms);

    const safeTitle = testInfo.title.replace(/[^a-z0-9_-]/gi, '_');
    const screenshotPath = path.join(SCREENSHOT_DIR, `${safeTitle}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('[screenshot] ', screenshotPath);
  });

  test('successful login with valid credentials', async ({ page }) => {
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    await page.click('button[type="submit"]');

    await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
    await expect(page).toHaveURL(/\/secure/);
  });

  test('login fails with incorrect password', async ({ page }) => {
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'wrongPassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('#flash')).toContainText('Your password is invalid!');
    await expect(page).toHaveURL(BASE);
  });

  test('login fails with empty credentials shows validation message', async ({ page }) => {
    // Submit with both fields empty
    await page.click('button[type="submit"]');

    // The demo site treats empty as invalid; check for invalid username or password message
    await expect(page.locator('#flash')).toBeVisible();
    await expect(page.locator('#flash')).toContainText(/invalid/i);
    await expect(page).toHaveURL(BASE);
  });

  test('login resists simple SQL injection attempt', async ({ page }) => {
    // Common SQL injection string
    await page.fill('#username', "' OR '1'='1");
    await page.fill('#password', "' OR '1'='1");
    await page.click('button[type="submit"]');

    // The demo app should reject it (treat as invalid credentials)
    await expect(page.locator('#flash')).toBeVisible();
    await expect(page.locator('#flash')).toContainText(/invalid/i);
    await expect(page).toHaveURL(BASE);
  });

  test('logged-in user can logout and return to login page', async ({ page }) => {
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');
    await page.click('button[type="submit"]');

    await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
    await page.click('a[href="/logout"]');

    await expect(page.locator('#flash')).toContainText('You logged out of the secure area!');
    await expect(page).toHaveURL(BASE);
  });
});
