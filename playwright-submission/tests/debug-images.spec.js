const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Debug test: logs image requests and failures, saves a screenshot
// Update PAGE_URL to the page where images are missing (or run as-is to use the demo login page)
const PAGE_URL = process.env.DEBUG_PAGE_URL || 'https://the-internet.herokuapp.com/';

// Ensure output folder exists
const outDir = path.join(__dirname, '..', 'test-results');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

test('log image/network requests and capture screenshot', async ({ page }) => {
  const failedResources = [];
  const imageRequests = [];

  page.on('request', (request) => {
    const url = request.url();
    const type = request.resourceType();
    if (type === 'image') imageRequests.push(url);
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    const failure = request.failure();
    if (request.resourceType() === 'image') {
      failedResources.push({ url, failure: failure && failure.errorText });
    }
  });

  page.on('response', (response) => {
    if (response.request().resourceType() === 'image') {
      const status = response.status();
      if (status >= 400) {
        failedResources.push({ url: response.url(), status });
      }
    }
  });

  // Navigate and wait for network idle
  await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

  // Wait a bit for lazy images to load (configurable)
  const pauseMs = Number(process.env.SLOW_MS) || 1500;
  await page.waitForTimeout(pauseMs);

  // Collect <img> elements on the page and their attributes
  const imgs = await page.$$eval('img', (nodes) => nodes.map(n => ({ src: n.getAttribute('src'), loading: n.getAttribute('loading'), naturalWidth: n.naturalWidth, naturalHeight: n.naturalHeight })));

  const out = {
    page: PAGE_URL,
    timestamp: new Date().toISOString(),
    imageRequests,
    imgs,
    failedResources
  };

  const outPath = path.join(outDir, `images-debug-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  // Save a screenshot for visual inspection
  const shotPath = path.join(outDir, `screenshot-${Date.now()}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  // Print a short summary to the test output
  console.log('\n[images-debug] saved debug JSON:', outPath);
  console.log('[images-debug] saved screenshot :', shotPath);
  if (failedResources.length) {
    console.log('[images-debug] failed image resources:');
    failedResources.forEach((f) => console.log(' -', f.url, f.status || f.failure));
  } else {
    console.log('[images-debug] no failed image resources detected (HTTP-level).');
  }

  // Basic assertion: at least one <img> found
  expect(imgs.length).toBeGreaterThan(0);
});
