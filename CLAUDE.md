# Chrome Tab Manager Extension

A Chrome extension that provides a sidebar for managing browser tabs with search, grouping, theming, and multi-window support.

## Tech Stack

- Vanilla JavaScript (no framework)
- Chrome Extensions API (Manifest V3)
- Playwright for E2E testing

## Project Structure

- `extension/` — Chrome extension source (manifest, background, sidepanel, i18n, icons)
- `tests/` — Playwright E2E test specs
- `tests/fixtures.js` — Custom fixture that launches Chrome with the extension loaded

## Running Tests

```bash
npm install
npm test                          # run all E2E tests
npx playwright test --headed      # run with visible browser
npx playwright test tests/foo.spec.js  # run a single spec
```

Tests require a real (non-headless) Chromium instance because Chrome extensions don't work in headless mode.

## Pull Request Guidelines

Every PR should follow this structure:

### Required Sections

- **Why** — What problem does this solve? What motivated this change?
- **What changed** — Concise bullet list of the actual changes (WHAT, not HOW)
- **How it works** — Brief technical explanation for non-trivial changes
- **Files changed** — Table of key files with one-line descriptions
- **Testing** — How was this tested? What should reviewers verify?
- **Screenshots** — Before/after screenshots for any UI changes

### Checklist

- Changes are scoped to the stated goal (no unrelated modifications)
- No new permissions added without justification
- i18n strings added for all 4 languages (de, en, es, fr) if UI text changed
- E2E tests added/updated for new features or behavior changes
- Existing tests still pass (`npm test`)
- README updated if user-facing behavior changed

## Release Process

The extension is published to the Chrome Web Store (unlisted) via GitHub Actions. The workflow is triggered by pushing a git tag.

### How to release a new version

1. **Bump the version** in `extension/manifest.json` (follow semver: `major.minor.patch`)
2. **Commit the version bump**:
   ```bash
   git add extension/manifest.json
   git commit -m "Bump version to X.Y.Z"
   git push
   ```
3. **Create and push a tag** (must match the manifest version):
   ```bash
   git tag vX.Y.Z
   git push --tags
   ```
4. The GitHub Action (`.github/workflows/publish.yml`) will:
   - Run all E2E tests
   - Verify the tag version matches `manifest.json`
   - Build the ZIP and upload to Chrome Web Store
   - Publish automatically

### Build script

```bash
./scripts/build.sh    # creates dist/tab-manager-vX.Y.Z.zip for manual upload
```

### Required GitHub Secrets

These secrets must be configured in the repo (Settings → Secrets → Actions):

- `CHROME_EXTENSION_ID` — Extension ID from Chrome Developer Dashboard
- `CHROME_CLIENT_ID` — Google OAuth 2.0 Client ID
- `CHROME_CLIENT_SECRET` — Google OAuth 2.0 Client Secret
- `CHROME_REFRESH_TOKEN` — OAuth refresh token for Chrome Web Store API

### Store Listing

- `store/listing-en.md` — English store description
- `store/listing-de.md` — German store description
- `docs/privacy-policy.html` — Privacy policy (hosted via GitHub Pages)
