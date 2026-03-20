const { expect } = require('@playwright/test');
const test = require('./fixtures');

test.describe('Quick-open Banner', () => {
  test('banner appears on page with right position by default', async ({ context, extensionId }) => {
    // Clear any stored banner settings first
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group, .empty-state');

    // Set banner to right (default)
    await panel.locator('#banner-right').click();

    // Open a regular page
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Wait for the banner to be injected by the content script
    const banner = page.locator('#tab-manager-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Should have 'right' class
    await expect(banner).toHaveClass(/right/);
  });

  test('banner position changes to left', async ({ context, extensionId }) => {
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group, .empty-state');

    // Change banner to left
    await panel.locator('#banner-left').click();

    // Open a page and check
    const page = await context.newPage();
    await page.goto('https://example.com');

    const banner = page.locator('#tab-manager-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toHaveClass(/left/);
  });

  test('banner disappears when turned off', async ({ context, extensionId }) => {
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group, .empty-state');

    // Turn banner off
    await panel.locator('#banner-off').click();

    // Open a page and check
    const page = await context.newPage();
    await page.goto('https://example.com');

    const banner = page.locator('#tab-manager-banner');
    // Banner should exist in DOM but be hidden (display: none)
    await page.waitForSelector('#tab-manager-banner', { state: 'attached', timeout: 5000 });
    await expect(banner).toBeHidden();
  });

  test('banner setting buttons show active state', async ({ sidePanelPage }) => {
    // Click Left — should be active
    await sidePanelPage.locator('#banner-left').click();
    await expect(sidePanelPage.locator('#banner-left')).toHaveClass(/active/);
    await expect(sidePanelPage.locator('#banner-right')).not.toHaveClass(/active/);
    await expect(sidePanelPage.locator('#banner-off')).not.toHaveClass(/active/);

    // Click Right — should be active
    await sidePanelPage.locator('#banner-right').click();
    await expect(sidePanelPage.locator('#banner-right')).toHaveClass(/active/);
    await expect(sidePanelPage.locator('#banner-left')).not.toHaveClass(/active/);

    // Click Off — should be active
    await sidePanelPage.locator('#banner-off').click();
    await expect(sidePanelPage.locator('#banner-off')).toHaveClass(/active/);
    await expect(sidePanelPage.locator('#banner-left')).not.toHaveClass(/active/);
    await expect(sidePanelPage.locator('#banner-right')).not.toHaveClass(/active/);
  });

  test('banner setting persists after panel reload', async ({ context, extensionId }) => {
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group, .empty-state');

    // Set to left
    await panel.locator('#banner-left').click();
    await expect(panel.locator('#banner-left')).toHaveClass(/active/);

    // Reload
    await panel.reload();
    await panel.waitForSelector('.domain-group, .empty-state');

    // Should still show left as active
    await expect(panel.locator('#banner-left')).toHaveClass(/active/);
  });
});
