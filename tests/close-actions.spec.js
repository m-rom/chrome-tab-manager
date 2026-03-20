const { expect } = require('@playwright/test');
const test = require('./fixtures');

test.describe('Close Actions', () => {
  test('close button appears on tab hover', async ({ context, extensionId }) => {
    const target = await context.newPage();
    await target.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    // Expand the example.com group
    const group = panel.locator('.domain-group', { has: panel.locator('.domain-name', { hasText: 'example.com' }) });
    if (!(await group.evaluate(el => el.classList.contains('expanded')))) {
      await group.locator('.domain-header').click();
    }

    const tabEntry = group.locator('.tab-entry').first();
    const closeBtn = tabEntry.locator('.tab-close');

    // Close button should be hidden by default (opacity: 0)
    await expect(closeBtn).toHaveCSS('opacity', '0');

    // Hover to reveal
    await tabEntry.hover();
    await expect(closeBtn).toHaveCSS('opacity', '1');
  });

  test('close all button appears on domain header hover', async ({ context, extensionId }) => {
    const target = await context.newPage();
    await target.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    const group = panel.locator('.domain-group', { has: panel.locator('.domain-name', { hasText: 'example.com' }) });
    const closeAllBtn = group.locator('.domain-close');

    // Hidden by default
    await expect(closeAllBtn).toHaveCSS('opacity', '0');

    // Hover to reveal
    await group.locator('.domain-header').hover();
    await expect(closeAllBtn).toHaveCSS('opacity', '1');
  });

  test('close all shows confirmation dialog', async ({ context, extensionId }) => {
    const target = await context.newPage();
    await target.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    const group = panel.locator('.domain-group', { has: panel.locator('.domain-name', { hasText: 'example.com' }) });

    // Hover and click close all
    await group.locator('.domain-header').hover();
    await group.locator('.domain-close').click();

    // Confirmation dialog should appear
    const dialog = panel.locator('#confirm-dialog');
    await expect(dialog).not.toHaveClass(/hidden/);
    await expect(panel.locator('#confirm-message')).toContainText('example.com');
  });

  test('cancelling close all keeps tabs open', async ({ context, extensionId }) => {
    const target = await context.newPage();
    await target.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    const group = panel.locator('.domain-group', { has: panel.locator('.domain-name', { hasText: 'example.com' }) });
    await group.locator('.domain-header').hover();
    await group.locator('.domain-close').click();

    // Click cancel
    await panel.locator('#confirm-cancel').click();

    // Dialog should be hidden
    await expect(panel.locator('#confirm-dialog')).toHaveClass(/hidden/);

    // Tab should still exist
    const exampleGroup = panel.locator('.domain-name', { hasText: 'example.com' });
    await expect(exampleGroup).toBeVisible();
  });

  test('confirming close all removes domain tabs', async ({ context, extensionId }) => {
    const target = await context.newPage();
    await target.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    const group = panel.locator('.domain-group', { has: panel.locator('.domain-name', { hasText: 'example.com' }) });
    await group.locator('.domain-header').hover();
    await group.locator('.domain-close').click();

    // Click confirm (Close button)
    await panel.locator('#confirm-ok').click();

    // Wait for the domain group to disappear
    await expect(panel.locator('.domain-name', { hasText: 'example.com' })).toBeHidden({ timeout: 5000 });
  });

  test('close old shows dialog', async ({ sidePanelPage }) => {
    await sidePanelPage.locator('#close-old').click();

    const dialog = sidePanelPage.locator('#confirm-dialog');
    await expect(dialog).not.toHaveClass(/hidden/);
  });
});
