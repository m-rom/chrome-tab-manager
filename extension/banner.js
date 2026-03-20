(() => {
  if (document.getElementById('tab-manager-banner')) return;

  const banner = document.createElement('button');
  banner.id = 'tab-manager-banner';
  banner.title = 'Tab Manager';
  banner.innerHTML = `<svg viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm1 4h12v2H4V8zm1 4h10v2H5v-2z"/></svg>`;

  function applyState(side, visible) {
    banner.className = side || 'right';
    banner.style.display = visible === false ? 'none' : '';
  }

  chrome.storage.local.get(['bannerSide', 'bannerVisible'], (result) => {
    applyState(result.bannerSide, result.bannerVisible);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    chrome.storage.local.get(['bannerSide', 'bannerVisible'], (result) => {
      applyState(result.bannerSide, result.bannerVisible);
    });
  });

  banner.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'toggle-side-panel' });
  });

  document.body.appendChild(banner);
})();
