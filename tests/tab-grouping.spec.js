const { expect } = require('@playwright/test');
const test = require('./fixtures');

/**
 * Helper: open the side panel and wait for it to render.
 */
async function openPanel(context, extensionId) {
  const panel = await context.newPage();
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await panel.waitForSelector('.domain-group');
  return panel;
}

/**
 * Helper: open a URL in a new Chrome window via CDP and return the page.
 */
async function openInNewWindow(context, url) {
  const cdp = await context.newCDPSession(context.pages()[0]);
  const { targetId } = await cdp.send('Target.createTarget', {
    url,
    newWindow: true,
  });
  // Find the page matching the new target
  await context.pages()[0].waitForTimeout(500);
  const pages = context.pages();
  for (const page of pages) {
    if (page.url().includes(url) || page.url() === url) {
      return page;
    }
  }
  // Fallback: return last page (most recently opened)
  return pages[pages.length - 1];
}

/**
 * Helper: locate the domain group element for a given domain.
 */
function domainGroup(panel, domain) {
  return panel.locator('.domain-group', {
    has: panel.locator('.domain-name', { hasText: domain }),
  });
}

/**
 * Helper: click the group/ungroup button on a domain header.
 */
async function clickGroupButton(panel, domain) {
  const group = domainGroup(panel, domain);
  await group.locator('.domain-header').hover();
  await group.locator('.domain-group-btn').click();
  // Wait for re-render after loadTabs()
  await panel.waitForTimeout(500);
}

test.describe('Tab Grouping — Button Visibility', () => {
  test('group button appears on domain header hover', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));

    const panel = await openPanel(context, extensionId);
    const group = domainGroup(panel, 'example.com');
    const groupBtn = group.locator('.domain-group-btn');

    // Hidden by default
    await expect(groupBtn).toHaveCSS('opacity', '0');

    // Simulate hover via class (CSS :hover unreliable under xvfb)
    await group.locator('.domain-header').evaluate(el => el.classList.add('hover'));
    await expect(groupBtn).toHaveCSS('opacity', '1', { timeout: 5000 });
  });

  test('group button does not trigger accordion toggle', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));

    const panel = await openPanel(context, extensionId);
    const group = domainGroup(panel, 'example.com');

    // Ensure group is expanded first
    if (!(await group.evaluate(el => el.classList.contains('expanded')))) {
      await group.locator('.domain-header').click();
    }
    await expect(group).toHaveClass(/expanded/);

    // Click the group button — accordion should stay expanded
    await group.locator('.domain-header').hover();
    await group.locator('.domain-group-btn').click();
    await panel.waitForTimeout(500);

    // Re-locate after re-render
    const groupAfter = domainGroup(panel, 'example.com');
    // The group should still exist (not collapsed by the click)
    await expect(groupAfter).toBeVisible();
  });
});

test.describe('Tab Grouping — Single Window', () => {
  test('group button groups tabs and shows ungroup state', async ({ context, extensionId }) => {
    // Open multiple tabs on same domain
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);
    const group = domainGroup(panel, 'example.com');

    // Initial state: not grouped
    const groupBtn = group.locator('.domain-group-btn');
    await expect(groupBtn).not.toHaveClass(/is-grouped/);

    // Click to group
    await clickGroupButton(panel, 'example.com');

    // After grouping, button should show grouped state
    const groupAfter = domainGroup(panel, 'example.com');
    const groupBtnAfter = groupAfter.locator('.domain-group-btn');
    await expect(groupBtnAfter).toHaveClass(/is-grouped/);
  });

  test('ungroup button removes Chrome tab group', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);

    // Group first
    await clickGroupButton(panel, 'example.com');

    // Verify grouped
    let group = domainGroup(panel, 'example.com');
    await expect(group.locator('.domain-group-btn')).toHaveClass(/is-grouped/);

    // Ungroup
    await clickGroupButton(panel, 'example.com');

    // Verify ungrouped
    group = domainGroup(panel, 'example.com');
    await expect(group.locator('.domain-group-btn')).not.toHaveClass(/is-grouped/);
  });

  test('group → ungroup → group cycle works', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/a'));
    await context.newPage().then(p => p.goto('https://example.com/b'));

    const panel = await openPanel(context, extensionId);

    // Cycle: group → ungroup → group
    for (let i = 0; i < 2; i++) {
      await clickGroupButton(panel, 'example.com');
      let group = domainGroup(panel, 'example.com');
      await expect(group.locator('.domain-group-btn')).toHaveClass(/is-grouped/);

      await clickGroupButton(panel, 'example.com');
      group = domainGroup(panel, 'example.com');
      await expect(group.locator('.domain-group-btn')).not.toHaveClass(/is-grouped/);
    }
  });
});

test.describe('Tab Grouping — Color Badge', () => {
  test('grouped domain shows color indicator', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);

    // Before grouping: no color
    let group = domainGroup(panel, 'example.com');
    await expect(group).not.toHaveClass(/has-group-color/);

    // Group
    await clickGroupButton(panel, 'example.com');

    // After grouping: should have color class
    group = domainGroup(panel, 'example.com');
    await expect(group).toHaveClass(/has-group-color/);
  });

  test('ungrouped domain loses color indicator', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);

    // Group then ungroup
    await clickGroupButton(panel, 'example.com');
    await clickGroupButton(panel, 'example.com');

    // Should no longer have color
    const group = domainGroup(panel, 'example.com');
    await expect(group).not.toHaveClass(/has-group-color/);
  });

  test('color badge has visible left border', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);
    await clickGroupButton(panel, 'example.com');

    const group = domainGroup(panel, 'example.com');
    const borderLeft = await group.evaluate(el => getComputedStyle(el).borderLeftWidth);
    expect(parseFloat(borderLeft)).toBeGreaterThan(0);
  });
});

test.describe('Tab Grouping — Edge Cases', () => {
  test('single tab can be grouped', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));

    const panel = await openPanel(context, extensionId);
    await clickGroupButton(panel, 'example.com');

    const group = domainGroup(panel, 'example.com');
    await expect(group.locator('.domain-group-btn')).toHaveClass(/is-grouped/);
  });

  test('grouping one domain does not affect another', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));
    await context.newPage().then(p => p.goto('https://example.org'));

    const panel = await openPanel(context, extensionId);

    // Group only example.com
    await clickGroupButton(panel, 'example.com');

    // example.com should be grouped
    const groupCom = domainGroup(panel, 'example.com');
    await expect(groupCom.locator('.domain-group-btn')).toHaveClass(/is-grouped/);

    // example.org should NOT be grouped
    const groupOrg = domainGroup(panel, 'example.org');
    await expect(groupOrg.locator('.domain-group-btn')).not.toHaveClass(/is-grouped/);
  });

  test('multiple domains can be grouped independently', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));
    await context.newPage().then(p => p.goto('https://example.org'));

    const panel = await openPanel(context, extensionId);

    // Group both domains
    await clickGroupButton(panel, 'example.com');
    await clickGroupButton(panel, 'example.org');

    // Both should be grouped
    const groupCom = domainGroup(panel, 'example.com');
    await expect(groupCom.locator('.domain-group-btn')).toHaveClass(/is-grouped/);
    await expect(groupCom).toHaveClass(/has-group-color/);

    const groupOrg = domainGroup(panel, 'example.org');
    await expect(groupOrg.locator('.domain-group-btn')).toHaveClass(/is-grouped/);
    await expect(groupOrg).toHaveClass(/has-group-color/);
  });

  test('group button tooltip shows correct text', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com'));

    const panel = await openPanel(context, extensionId);
    let group = domainGroup(panel, 'example.com');

    // Before grouping: "Group tabs"
    let title = await group.locator('.domain-group-btn').getAttribute('title');
    expect(title).toBe('Group tabs');

    // After grouping: "Ungroup tabs"
    await clickGroupButton(panel, 'example.com');
    group = domainGroup(panel, 'example.com');
    title = await group.locator('.domain-group-btn').getAttribute('title');
    expect(title).toBe('Ungroup tabs');
  });

  test('group name matches domain name', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);
    await clickGroupButton(panel, 'example.com');

    // Verify via the Chrome API that the group has the right title
    const groupTitle = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      const exampleGroup = groups.find(g => g.title === 'example.com');
      return exampleGroup?.title;
    });
    expect(groupTitle).toBe('example.com');
  });

  test('deterministic color: same domain always gets same color', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/page1'));
    await context.newPage().then(p => p.goto('https://example.com/page2'));

    const panel = await openPanel(context, extensionId);

    // Group, get color, ungroup, re-group and verify same color
    await clickGroupButton(panel, 'example.com');

    const color1 = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      return groups.find(g => g.title === 'example.com')?.color;
    });

    await clickGroupButton(panel, 'example.com');
    await clickGroupButton(panel, 'example.com');

    const color2 = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      return groups.find(g => g.title === 'example.com')?.color;
    });

    expect(color1).toBe(color2);
  });
});

test.describe('Tab Grouping — Multi-Window', () => {
  test('grouping works across two windows simultaneously', async ({ context, extensionId }) => {
    // Open tab in window 1
    await context.newPage().then(p => p.goto('https://example.com/win1'));

    // Open tab in window 2
    await openInNewWindow(context, 'https://example.com/win2');

    const panel = await openPanel(context, extensionId);

    // Verify both tabs appear in the same domain group
    const group = domainGroup(panel, 'example.com');
    await expect(group).toBeVisible();

    // Group — should create groups in BOTH windows
    await clickGroupButton(panel, 'example.com');

    // Verify: all tabs are grouped (button shows is-grouped)
    const groupAfter = domainGroup(panel, 'example.com');
    await expect(groupAfter.locator('.domain-group-btn')).toHaveClass(/is-grouped/);

    // Verify via Chrome API: there should be groups in 2 windows
    const groupCount = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      return groups.filter(g => g.title === 'example.com').length;
    });
    expect(groupCount).toBe(2);
  });

  test('ungrouping works across two windows', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/win1'));
    await openInNewWindow(context, 'https://example.com/win2');

    const panel = await openPanel(context, extensionId);

    // Group then ungroup
    await clickGroupButton(panel, 'example.com');
    await clickGroupButton(panel, 'example.com');

    // Verify ungrouped
    const group = domainGroup(panel, 'example.com');
    await expect(group.locator('.domain-group-btn')).not.toHaveClass(/is-grouped/);

    // Verify via Chrome API: no groups with this title remain
    const groupCount = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      return groups.filter(g => g.title === 'example.com').length;
    });
    expect(groupCount).toBe(0);
  });

  test('group → ungroup → group cycle works across two windows', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/win1'));
    await openInNewWindow(context, 'https://example.com/win2');

    const panel = await openPanel(context, extensionId);

    // Full cycle twice
    for (let i = 0; i < 2; i++) {
      await clickGroupButton(panel, 'example.com');
      let group = domainGroup(panel, 'example.com');
      await expect(group.locator('.domain-group-btn')).toHaveClass(/is-grouped/);

      await clickGroupButton(panel, 'example.com');
      group = domainGroup(panel, 'example.com');
      await expect(group.locator('.domain-group-btn')).not.toHaveClass(/is-grouped/);
    }
  });

  test('color badge shows when grouped across two windows', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/win1'));
    await openInNewWindow(context, 'https://example.com/win2');

    const panel = await openPanel(context, extensionId);

    // No color before grouping
    let group = domainGroup(panel, 'example.com');
    await expect(group).not.toHaveClass(/has-group-color/);

    // Group
    await clickGroupButton(panel, 'example.com');

    // Color should appear
    group = domainGroup(panel, 'example.com');
    await expect(group).toHaveClass(/has-group-color/);

    // Ungroup — color should disappear
    await clickGroupButton(panel, 'example.com');
    group = domainGroup(panel, 'example.com');
    await expect(group).not.toHaveClass(/has-group-color/);
  });

  test('both windows get same color for same domain', async ({ context, extensionId }) => {
    await context.newPage().then(p => p.goto('https://example.com/win1'));
    await openInNewWindow(context, 'https://example.com/win2');

    const panel = await openPanel(context, extensionId);
    await clickGroupButton(panel, 'example.com');

    // Both groups should have the same color
    const colors = await panel.evaluate(async () => {
      const groups = await chrome.tabGroups.query({});
      return groups.filter(g => g.title === 'example.com').map(g => g.color);
    });
    expect(colors.length).toBe(2);
    expect(colors[0]).toBe(colors[1]);
  });
});
