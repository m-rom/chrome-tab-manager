const { expect } = require('@playwright/test');
const test = require('./fixtures');

test.describe('Multi-language (i18n)', () => {
  test('language dropdown shows 4 languages', async ({ sidePanelPage }) => {
    const langSelect = sidePanelPage.locator('#lang-select');
    await expect(langSelect).toBeVisible();

    const options = langSelect.locator('option');
    await expect(options).toHaveCount(4);

    // Verify all 4 languages are present
    const values = await options.evaluateAll(opts => opts.map(o => o.value));
    expect(values).toEqual(expect.arrayContaining(['en', 'de', 'fr', 'es']));
  });

  test('switching to German changes UI text', async ({ sidePanelPage }) => {
    const langSelect = sidePanelPage.locator('#lang-select');

    // Switch to German
    await langSelect.selectOption('de');

    // Verify German translations
    await expect(sidePanelPage.locator('#search')).toHaveAttribute('placeholder', 'Tabs suchen...');
    await expect(sidePanelPage.locator('#close-old')).toContainText('Alte schließen');
    await expect(sidePanelPage.locator('#banner-label')).toContainText('Schnellöffner-Banner');
  });

  test('switching to French changes UI text', async ({ sidePanelPage }) => {
    const langSelect = sidePanelPage.locator('#lang-select');

    await langSelect.selectOption('fr');

    await expect(sidePanelPage.locator('#search')).toHaveAttribute('placeholder', 'Rechercher des onglets...');
    await expect(sidePanelPage.locator('#close-old')).toContainText('Fermer anciens');
  });

  test('switching to Spanish changes UI text', async ({ sidePanelPage }) => {
    const langSelect = sidePanelPage.locator('#lang-select');

    await langSelect.selectOption('es');

    await expect(sidePanelPage.locator('#search')).toHaveAttribute('placeholder', 'Buscar pestañas...');
    await expect(sidePanelPage.locator('#close-old')).toContainText('Cerrar antiguas');
  });

  test('language setting persists after reload', async ({ context, extensionId }) => {
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await panel.waitForSelector('.domain-group, .empty-state');

    // Switch to German
    await panel.locator('#lang-select').selectOption('de');
    await expect(panel.locator('#search')).toHaveAttribute('placeholder', 'Tabs suchen...');

    // Reload
    await panel.reload();
    await panel.waitForSelector('.domain-group, .empty-state');

    // Should still be German
    await expect(panel.locator('#lang-select')).toHaveValue('de');
    await expect(panel.locator('#search')).toHaveAttribute('placeholder', 'Tabs suchen...');

    // Reset to English for other tests
    await panel.locator('#lang-select').selectOption('en');
  });

  test('switching back to English restores English text', async ({ sidePanelPage }) => {
    const langSelect = sidePanelPage.locator('#lang-select');

    // Switch to German then back to English
    await langSelect.selectOption('de');
    await expect(sidePanelPage.locator('#search')).toHaveAttribute('placeholder', 'Tabs suchen...');

    await langSelect.selectOption('en');
    await expect(sidePanelPage.locator('#search')).toHaveAttribute('placeholder', 'Search tabs...');
  });
});
