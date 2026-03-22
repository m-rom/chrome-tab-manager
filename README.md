# Tab Manager - Chrome Extension

A Chrome Side Panel extension that groups all your open tabs by domain, sorted by most recently accessed. Designed for users who work with many tabs and need a better way to stay organized.

<p align="center">
  <img src="store/screenshots/01-light-overview.png" alt="Tab Manager — Light Theme" width="640">
</p>

<p align="center">
  <img src="store/screenshots/02-dark-overview.png" alt="Tab Manager — Dark Theme" width="640">
</p>

### Search & Multi-Language

<p align="center">
  <img src="store/screenshots/03-search.png" alt="Tab Manager — Search" width="640">
  <img src="store/screenshots/04-german.png" alt="Tab Manager — German" width="640">
</p>

## Features

- **Domain grouping** — Tabs are grouped by website domain in an accordion layout
- **Sorted by recency** — Most recently accessed domains and tabs appear at the top
- **Cross-window support** — See tabs from all Chrome windows in one place
- **Window grouping toggle** — Optionally group tabs by window, or mix them all together
- **Window filter** — Filter to show only tabs from a specific window
- **Search** — Filter tabs by title or URL in real-time
- **Chrome tab grouping** — Group all tabs of a domain into a native Chrome tab group with one click, with automatic color coding and domain name labels; works across multiple windows simultaneously
- **Close actions** — Close individual tabs, all tabs of a domain, or all tabs older than 7 days
- **Keyboard shortcut** — `Cmd+M` (Mac) / `Ctrl+M` (Windows/Linux) to toggle the side panel
- **Quick-open banner** — Clickable banner on the page edge to open/close the panel, configurable (left/right/off)
- **Light & dark theme** — Follows your system theme automatically, with a manual toggle
- **Multi-language** — English, German, French, and Spanish (auto-detected from browser, switchable)
- **Live updates** — The tab list updates automatically when you open, close, or switch tabs
- **Incognito support** — Can display incognito tabs when enabled

## Installation

### From Chrome Web Store

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/tab-manager/maloipbklbokfhfnfpombeeaoalomlcd) — updates are delivered automatically.

### For Development

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `extension/` folder
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
| Open/close via shortcut | `Cmd+M` (Mac) / `Ctrl+M` (Windows/Linux) |
| Open/close via banner | Click the edge banner on the page |
| Configure banner position | Left/Right/Off buttons in the panel |
| Switch to a tab | Click on it in the list |
| Close a tab | Hover and click the **x** button |
| Group tabs by domain | Hover the domain header and click the **folder icon** |
| Ungroup tabs | Hover a grouped domain and click the **folder-minus icon** |
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
- [Playwright](https://playwright.dev/) for E2E testing

## Project Structure

```
├── extension/                    # Chrome Extension (load this in chrome://extensions)
│   ├── manifest.json             # Extension manifest (Manifest V3)
│   ├── background.js             # Service worker: tab event forwarding
│   ├── sidepanel.html            # Side panel markup
│   ├── sidepanel.css             # Styles with light/dark theme
│   ├── sidepanel.js              # UI logic, rendering, event handling
│   ├── i18n.js                   # Translations (en, de, fr, es)
│   ├── banner.js                 # Content script: edge banner on pages
│   ├── banner.css                # Banner styling and positioning
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── tests/                        # Playwright E2E tests
│   ├── fixtures.js               # Chrome + Extension launch fixture
│   ├── sidepanel.spec.js         # Side panel core UI tests
│   ├── close-actions.spec.js     # Tab close actions
│   ├── search.spec.js            # Search functionality
│   ├── theme.spec.js             # Theme switching
│   ├── banner.spec.js            # Edge banner tests
│   ├── window-management.spec.js # Window filter + grouping
│   ├── tab-grouping.spec.js     # Chrome tab group feature
│   └── i18n.spec.js              # Language switching
├── playwright.config.js          # Playwright configuration
├── package.json
└── README.md
```

## Testing

The project includes an end-to-end test suite using [Playwright](https://playwright.dev/) that loads the extension in a real Chrome browser.

```bash
npm install                      # Install dependencies
npm test                         # Run all tests
npx playwright test --headed     # Run with visible browser
npx playwright test --ui         # Interactive UI mode
```

## License

MIT
