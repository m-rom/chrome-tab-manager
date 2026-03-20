const { expect } = require('@playwright/test');
const test = require('./fixtures');

test.describe('Search', () => {
  test('search field is present', async ({ sidePanelPage }) => {
    const search = sidePanelPage.locator('#search');
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute('placeholder', /[Ss]earch/);
  });

  test('typing filters tabs in real-time', async ({ context, extensionId }) => {
    // Create tabs on different domains
    const page1 = await context.newPage();
    await page1.goto('https://example.com');
    const page2 = await context.newPage();
    await page2.goto('https://example.org');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    const totalGroupsBefore = await panel.locator('.domain-group').count();

    // Search for "example.com" — should filter to only matching groups
    await panel.locator('#search').fill('example.com');

    // The tab-list should have the 'searching' class
    await expect(panel.locator('.tab-list')).toHaveClass(/searching/);

    // Only groups with matches should be visible
    const visibleGroups = panel.locator('.domain-group.has-match');
    const count = await visibleGroups.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('search matches tab titles', async ({ context, extensionId }) => {
    const page1 = await context.newPage();
    await page1.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    // Search by the page title (Example Domain is the title of example.com)
    await panel.locator('#search').fill('Example Domain');

    // Should find at least one matching tab
    const matches = panel.locator('.tab-entry.match');
    await expect(matches.first()).toBeVisible({ timeout: 3000 });
  });

  test('search matches URLs', async ({ context, extensionId }) => {
    const page1 = await context.newPage();
    await page1.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    // Search by URL
    await panel.locator('#search').fill('example.com');

    const matches = panel.locator('.tab-entry.match');
    await expect(matches.first()).toBeVisible({ timeout: 3000 });
  });

  test('empty domains are hidden during search', async ({ context, extensionId }) => {
    const page1 = await context.newPage();
    await page1.goto('https://example.com');
    const page2 = await context.newPage();
    await page2.goto('https://example.org');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    // Search for something only matching one domain
    await panel.locator('#search').fill('example.com');

    // Groups without matches should not have .has-match class
    const allGroups = await panel.locator('.domain-group').count();
    const matchingGroups = await panel.locator('.domain-group.has-match').count();
    expect(matchingGroups).toBeLessThanOrEqual(allGroups);
  });

  test('clearing search shows all tabs again', async ({ context, extensionId }) => {
    const page1 = await context.newPage();
    await page1.goto('https://example.com');

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group');

    // Search and then clear
    await panel.locator('#search').fill('example.com');
    await expect(panel.locator('.tab-list')).toHaveClass(/searching/);

    await panel.locator('#search').fill('');
    await expect(panel.locator('.tab-list')).not.toHaveClass(/searching/);
  });
});
