const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    headless: false,
    // slowMo slows down Playwright operations (ms) so you can visually observe actions
    // Adjust by setting the SLOW_MS environment variable (value in ms) when running if needed.
    launchOptions: { slowMo: 500 },
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10 * 1000,
    ignoreHTTPSErrors: true
  },
  reporter: [['list'], ['html', { open: 'never' }]]
});
