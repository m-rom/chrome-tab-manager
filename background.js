chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

const TAB_EVENTS = ['onCreated', 'onRemoved', 'onUpdated', 'onActivated', 'onMoved', 'onDetached', 'onAttached'];

TAB_EVENTS.forEach(event => {
  if (chrome.tabs[event]) {
    chrome.tabs[event].addListener(() => {
      chrome.runtime.sendMessage({ type: 'tabs-changed' }).catch(() => {});
    });
  }
});

chrome.windows.onRemoved.addListener(() => {
  chrome.runtime.sendMessage({ type: 'tabs-changed' }).catch(() => {});
});
