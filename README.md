# Tab Manager - Chrome Extension

A Chrome Side Panel extension that groups all your open tabs by domain, sorted by most recently accessed. Designed for users who work with many tabs and need a better way to stay organized.

## Features

- **Domain grouping** — Tabs are grouped by website domain in an accordion layout
- **Sorted by recency** — Most recently accessed domains and tabs appear at the top
- **Cross-window support** — See tabs from all Chrome windows in one place
- **Window grouping toggle** — Optionally group tabs by window, or mix them all together
- **Window filter** — Filter to show only tabs from a specific window
- **Search** — Filter tabs by title or URL in real-time
- **Close actions** — Close individual tabs, all tabs of a domain, or all tabs older than 7 days
- **Light & dark theme** — Follows your system theme automatically, with a manual toggle
- **Multi-language** — English, German, French, and Spanish (auto-detected from browser, switchable)
- **Live updates** — The tab list updates automatically when you open, close, or switch tabs
- **Incognito support** — Can display incognito tabs when enabled

## Installation

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the repository folder
6. Click the extension icon in the toolbar to open the Side Panel

### Incognito tabs

To include incognito tabs in the list:

1. Go to `chrome://extensions`
2. Click **Details** on "Tab Manager"
3. Enable **Allow in Incognito**

> **Note:** Chrome extensions can only access tabs within their own profile. Tabs from other Chrome profiles are not visible — this is a Chrome security limitation.

## Usage

| Action | How |
|--------|-----|
| Open the panel | Click the extension icon in the toolbar |
| Switch to a tab | Click on it in the list |
| Close a tab | Hover and click the **x** button |
| Close all tabs of a domain | Hover the domain header and click **Close all** |
| Close old tabs | Click **Close old (>7d)** in the header |
| Search | Type in the search field |
| Filter by window | Use the window dropdown |
| Group by window | Toggle the **Windows** button |
| Switch theme | Click the sun/moon icon |
| Change language | Use the language dropdown |

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript, HTML, CSS
- No external dependencies
- CSS custom properties for theming

## Project Structure

```
├── manifest.json      # Extension manifest (Manifest V3)
├── background.js      # Service worker: tab event forwarding
├── sidepanel.html     # Side panel markup
├── sidepanel.css      # Styles with light/dark theme
├── sidepanel.js       # UI logic, rendering, event handling
├── i18n.js            # Translations (en, de, fr, es)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## License

MIT
