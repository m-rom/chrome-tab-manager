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

// Track open side panel ports per window
const panelPorts = new Map();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    // Side panel connects per window, not per tab
    const windowId = port.sender?.tab?.windowId;
    if (windowId) panelPorts.set(windowId, port);
    port.onDisconnect.addListener(() => {
      if (windowId) panelPorts.delete(windowId);
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'toggle-side-panel' && sender.tab) {
    const windowId = sender.tab.windowId;
    const tabId = sender.tab.id;
    const existingPort = panelPorts.get(windowId);

    if (existingPort) {
      // Panel is open — tell it to close itself
      try {
        existingPort.postMessage({ type: 'close' });
      } catch (e) {
        panelPorts.delete(windowId);
      }
      sendResponse({ ok: true });
    } else {
      // Panel is closed — open it
      chrome.sidePanel.open({ tabId }).then(() => {
        sendResponse({ ok: true });
      }).catch((err) => {
        sendResponse({ ok: false, error: err.message });
      });
    }
    return true;
  }
});
