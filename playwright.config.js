const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    // Extensions don't work in headless mode
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        // Browser launch is handled by the custom fixture
      },
    },
  ],
});
