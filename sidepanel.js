// State
let allTabs = [];
let expandedDomains = new Set();
let groupByWindow = false;
let filterWindowId = null;

// Elements
const tabListEl = document.getElementById('tab-list');
const searchEl = document.getElementById('search');
const tabCountEl = document.getElementById('tab-count');
const closeOldEl = document.getElementById('close-old');
const themeToggleEl = document.getElementById('theme-toggle');
const windowToggleEl = document.getElementById('window-toggle');
const windowToggleLabelEl = document.getElementById('window-toggle-label');
const windowFilterEl = document.getElementById('window-filter');
const langSelectEl = document.getElementById('lang-select');
const confirmDialog = document.getElementById('confirm-dialog');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmOk = document.getElementById('confirm-ok');

// Apply all translatable strings to the UI
function applyTranslations() {
  searchEl.placeholder = t.searchPlaceholder;
  closeOldEl.textContent = t.closeOld;
  themeToggleEl.title = t.themeToggle;
  windowToggleLabelEl.textContent = t.windowGrouping;
  confirmCancel.textContent = t.cancel;
  confirmOk.textContent = t.close;
  updateWindowToggle();
  updateWindowFilter();
  render();
}

// Language selector
function initLangSelect() {
  langSelectEl.innerHTML = '';
  for (const lang of getAvailableLanguages()) {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.label;
    langSelectEl.appendChild(opt);
  }
  langSelectEl.value = currentLang;
}

langSelectEl.addEventListener('change', async () => {
  await setLanguage(langSelectEl.value);
  applyTranslations();
});

// Theme management
async function initTheme() {
  const { themePreference } = await chrome.storage.local.get('themePreference');
  if (themePreference === 'light' || themePreference === 'dark') {
    document.documentElement.setAttribute('data-theme', themePreference);
  }
}

themeToggleEl.addEventListener('click', async () => {
  const current = document.documentElement.getAttribute('data-theme');
  const isDark = current === 'dark' ||
    (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  await chrome.storage.local.set({ themePreference: next });
});

// Window grouping toggle
async function initSettings() {
  const { groupByWindowPref } = await chrome.storage.local.get('groupByWindowPref');
  groupByWindow = groupByWindowPref || false;
  updateWindowToggle();
}

windowToggleEl.addEventListener('click', async () => {
  groupByWindow = !groupByWindow;
  await chrome.storage.local.set({ groupByWindowPref: groupByWindow });
  updateWindowToggle();
  render();
});

function updateWindowToggle() {
  windowToggleEl.classList.toggle('active', groupByWindow);
  windowToggleEl.title = groupByWindow ? t.windowGroupingOn : t.windowGroupingOff;
}

// Window filter
windowFilterEl.addEventListener('change', () => {
  const val = windowFilterEl.value;
  filterWindowId = val === 'all' ? null : Number(val);
  render();
});

// Confirmation dialog
let confirmResolve = null;

function showConfirm(message) {
  confirmMessage.textContent = message;
  confirmDialog.classList.remove('hidden');
  return new Promise(resolve => { confirmResolve = resolve; });
}

confirmCancel.addEventListener('click', () => {
  confirmDialog.classList.add('hidden');
  if (confirmResolve) confirmResolve(false);
});

confirmOk.addEventListener('click', () => {
  confirmDialog.classList.add('hidden');
  if (confirmResolve) confirmResolve(true);
});

// Data loading
async function loadTabs() {
  allTabs = await chrome.tabs.query({});
  updateWindowFilter();
  render();
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'other';
  }
}

function getRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.now;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getFaviconUrl(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return '';
  }
}

// Update window filter dropdown
function updateWindowFilter() {
  const windowIds = [...new Set(allTabs.map(t => t.windowId))];
  const currentValue = windowFilterEl.value;

  windowFilterEl.innerHTML = `<option value="all">${t.allWindows}</option>`;
  windowIds.forEach((wid, i) => {
    const count = allTabs.filter(tab => tab.windowId === wid).length;
    const opt = document.createElement('option');
    opt.value = wid;
    opt.textContent = `${t.windowLabel} ${i + 1} (${count})`;
    windowFilterEl.appendChild(opt);
  });

  if ([...windowFilterEl.options].some(o => o.value === currentValue)) {
    windowFilterEl.value = currentValue;
  } else {
    windowFilterEl.value = 'all';
    filterWindowId = null;
  }

  windowFilterEl.closest('.filter-row').style.display = windowIds.length > 1 ? '' : 'none';
}

// Group tabs by domain
function groupDomains(tabs) {
  const domains = new Map();
  for (const tab of tabs) {
    const domain = getDomain(tab.url || '');
    if (!domains.has(domain)) {
      domains.set(domain, []);
    }
    domains.get(domain).push(tab);
  }

  for (const [, domainTabs] of domains) {
    domainTabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  }

  const sorted = [...domains.entries()].sort(
    (a, b) => (b[1][0].lastAccessed || 0) - (a[1][0].lastAccessed || 0)
  );

  return sorted.map(([domain, tabs]) => ({
    domain,
    tabs,
    favicon: getFaviconUrl(tabs[0].url || ''),
  }));
}

// Rendering
function render() {
  let tabs = filterWindowId ? allTabs.filter(tab => tab.windowId === filterWindowId) : allTabs;

  const totalTabs = tabs.length;
  const totalWindows = new Set(tabs.map(tab => tab.windowId)).size;

  tabCountEl.textContent = t.tabsInWindows(totalTabs, totalWindows);

  tabListEl.innerHTML = '';

  if (totalTabs === 0) {
    tabListEl.innerHTML = `<div class="empty-state"><p>${t.noTabs}</p></div>`;
    return;
  }

  if (groupByWindow && totalWindows > 1) {
    const windows = new Map();
    for (const tab of tabs) {
      if (!windows.has(tab.windowId)) windows.set(tab.windowId, []);
      windows.get(tab.windowId).push(tab);
    }

    let windowIndex = 0;
    for (const [windowId, windowTabs] of windows) {
      windowIndex++;
      const windowHeader = document.createElement('div');
      windowHeader.className = 'window-header';
      windowHeader.textContent = t.windowHeader(windowIndex, windowTabs.length);
      tabListEl.appendChild(windowHeader);

      const domainGroups = groupDomains(windowTabs);
      for (const group of domainGroups) {
        renderDomainGroup(group, windowId);
      }
    }
  } else {
    const domainGroups = groupDomains(tabs);
    for (const group of domainGroups) {
      renderDomainGroup(group, null);
    }
  }

  if (searchEl.value.trim()) {
    applySearch(searchEl.value.trim());
  }
}

function renderDomainGroup(group, windowId) {
  const domainKey = windowId ? `${windowId}:${group.domain}` : `all:${group.domain}`;
  const isExpanded = expandedDomains.has(domainKey);

  const domainEl = document.createElement('div');
  domainEl.className = `domain-group${isExpanded ? ' expanded' : ''}`;
  domainEl.dataset.domainKey = domainKey;

  const header = document.createElement('div');
  header.className = 'domain-header';
  header.innerHTML = `
    <span class="domain-arrow">&#9654;</span>
    ${group.favicon ? `<img class="domain-favicon" src="${group.favicon}" alt="">` : ''}
    <span class="domain-name">${escapeHtml(group.domain)}</span>
    <span class="domain-age">${getRelativeTime(group.tabs[0].lastAccessed)}</span>
    <span class="domain-count">${group.tabs.length}</span>
    <button class="domain-close">${t.closeAll}</button>
  `;

  header.addEventListener('click', (e) => {
    if (e.target.closest('.domain-close')) return;
    toggleDomain(domainKey, domainEl);
  });

  header.querySelector('.domain-close').addEventListener('click', async (e) => {
    e.stopPropagation();
    const tabIds = group.tabs.map(tab => tab.id);
    const confirmed = await showConfirm(
      t.confirmCloseAllDomain(group.tabs.length, group.domain)
    );
    if (confirmed) {
      await chrome.tabs.remove(tabIds);
    }
  });

  domainEl.appendChild(header);

  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'domain-tabs';

  for (const tab of group.tabs) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab-entry';
    tabEl.dataset.tabId = tab.id;
    tabEl.dataset.searchText = `${(tab.title || '').toLowerCase()} ${(tab.url || '').toLowerCase()}`;

    const isActive = tab.active;

    tabEl.innerHTML = `
      <div class="tab-active-dot ${isActive ? '' : 'inactive'}"></div>
      <span class="tab-title ${isActive ? '' : 'inactive-tab'}">${escapeHtml(tab.title || 'Untitled')}</span>
      <span class="tab-age">${getRelativeTime(tab.lastAccessed)}</span>
      <button class="tab-close" title="${t.closeTab}">&times;</button>
    `;

    tabEl.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });

    tabEl.querySelector('.tab-close').addEventListener('click', async (e) => {
      e.stopPropagation();
      await chrome.tabs.remove(tab.id);
    });

    tabsContainer.appendChild(tabEl);
  }

  domainEl.appendChild(tabsContainer);
  tabListEl.appendChild(domainEl);
}

function toggleDomain(key, el) {
  if (expandedDomains.has(key)) {
    expandedDomains.delete(key);
    el.classList.remove('expanded');
  } else {
    expandedDomains.add(key);
    el.classList.add('expanded');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Search
searchEl.addEventListener('input', () => {
  const query = searchEl.value.trim();
  if (!query) {
    tabListEl.classList.remove('searching');
    document.querySelectorAll('.tab-entry').forEach(el => el.classList.remove('match'));
    document.querySelectorAll('.domain-group').forEach(el => el.classList.remove('has-match'));
    return;
  }
  applySearch(query);
});

function applySearch(query) {
  const q = query.toLowerCase();
  tabListEl.classList.add('searching');

  document.querySelectorAll('.domain-group').forEach(groupEl => {
    let hasMatch = false;
    groupEl.querySelectorAll('.tab-entry').forEach(tabEl => {
      const matches = tabEl.dataset.searchText.includes(q);
      tabEl.classList.toggle('match', matches);
      if (matches) hasMatch = true;
    });
    groupEl.classList.toggle('has-match', hasMatch);
  });
}

// Close old tabs
closeOldEl.addEventListener('click', async () => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const allCurrentTabs = await chrome.tabs.query({});

  const oldTabs = allCurrentTabs.filter(tab => {
    if (tab.active) return false;
    if (tab.lastAccessed && tab.lastAccessed < sevenDaysAgo) return true;
    return false;
  });

  if (oldTabs.length === 0) {
    await showConfirm(t.noOldTabs);
    return;
  }

  const confirmed = await showConfirm(t.confirmCloseOld(oldTabs.length));
  if (confirmed) {
    await chrome.tabs.remove(oldTabs.map(tab => tab.id));
  }
});

// Listen for tab changes from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'tabs-changed') {
    loadTabs();
  }
});

// Initialize
async function init() {
  await initI18n();
  initLangSelect();
  await initTheme();
  await initSettings();
  applyTranslations();
  await loadTabs();
}

init();

// Auto-expand the first domain group on initial load
const observer = new MutationObserver(() => {
  const firstGroup = tabListEl.querySelector('.domain-group:not(.expanded)');
  if (firstGroup && expandedDomains.size === 0) {
    const key = firstGroup.dataset.domainKey;
    expandedDomains.add(key);
    firstGroup.classList.add('expanded');
    observer.disconnect();
  }
});
observer.observe(tabListEl, { childList: true });
