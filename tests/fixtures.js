const { test: base, chromium } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname, '..', 'extension');

/**
 * Custom fixture that launches Chrome with the extension loaded.
 * Provides `context`, `extensionId`, and a helper to open the side panel page.
 */
module.exports = base.extend({
  // Override context to launch with the extension
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--disable-default-apps',
      ],
    });
    await use(context);
    await context.close();
  },

  // Derive extensionId from the service worker
  extensionId: async ({ context }, use) => {
    let serviceWorker;

    // Check if a service worker is already registered
    const existing = context.serviceWorkers();
    if (existing.length > 0) {
      serviceWorker = existing[0];
    } else {
      serviceWorker = await context.waitForEvent('serviceworker');
    }

    const url = serviceWorker.url();
    // chrome-extension://<id>/background.js
    const id = url.split('/')[2];
    await use(id);
  },

  // Helper: opens the side panel HTML directly in a new tab (for UI testing)
  sidePanelPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    // Wait for the panel to initialize (tabs loaded and rendered)
    await page.waitForSelector('.domain-group, .empty-state');
    await use(page);
  },
});
