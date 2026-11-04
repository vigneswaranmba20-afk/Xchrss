# VER Chess Intelligence — Android PWA (v3)

This package upgrades the existing project hosted at `https://vigneswaranmba20-afk.github.io/Xchrss/` into an installable Progressive Web App. It **does not** change PGN parsing, arrows, coach, game review, or your copyright statement.

## Update on Android — GitHub Pages

1. Open the **Xchrss** GitHub repository on `main`.
2. Upload or replace these files in the repository **root**: `index.html`, `manifest.json`, `sw.js`, `.nojekyll`.
3. Upload the four PNG icon files (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `icon-180.png`) to the **repository root** beside `index.html`. They are deliberately in the root so the GitHub mobile uploader can select them without creating folders. `icon-source.svg` is optional source artwork.
4. Keep your existing `engine/stockfish-19-lite-single.js` and `engine/stockfish-19-lite-single.wasm` **unchanged**; they are already installed in your repository. This ZIP intentionally doesn't duplicate the engine's large binary assets.
5. Keep your existing other files. This package includes `COPYRIGHT.md` and the Stockfish GPL text for reference and licensing. Commit changes to `main`.
6. Open `https://vigneswaranmba20-afk.github.io/Xchrss/` in Chrome, preferably in a normal tab (not the GitHub app's in-app browser). After deployment, refresh once and let the engine cache. Tap **↓ Install App**, or Chrome **⋮ → Install app / Add to Home screen**.
7. Launch from the installed home-screen icon. On your first online visit, Stockfish's .js and .wasm are cached locally (~1.8 MB). You can then import locally stored PGN files and review them offline, subject to device cache retention.

## What's new

- Browser-compatible web app manifest and custom 192/512 px Android icons.
- A full-screen, standalone app view without browser chrome when installed through a supported browser.
- Service worker for offline application shell, Stockfish JS+WASM and previously fetched chess SVG artwork.
- A clear install button, Android instructions, and offline-engine caching status.
- Fix to use GET instead of HEAD when checking self-hosted Stockfish: the GET request can be served from offline cache.

## Important caveats

- The service worker works only on HTTPS / localhost; opening `index.html` directly from Downloads is not a PWA install test.
- New public Lichess URL imports require an internet connection. Local PGN import works offline.
- Chess piece SVG artwork is served from a third-party CDN; previously loaded pieces are cached when the service worker controls the page; glyph fallbacks are retained.
- The browser may clear its caches to reclaim storage. The engine must then be downloaded again.
- Do not use engine analysis for assistance in live games or in violation of online-chess fair-play rules.
- This is a PWA, not a Google Play Store APK/AAB. Publishing to Play Store is a separate future project.
- The original website has embedded third-party Stockfish and Cburnett attribution. Stockfish is GPL-3.0; Cburnett piece artwork has a separate GPLv2+ licence. Retain source and licence references when distributing.

## Quick validation

Open: `https://vigneswaranmba20-afk.github.io/Xchrss/manifest.json` and `https://vigneswaranmba20-afk.github.io/Xchrss/sw.js`. Both should load without 404. Then load the website, install it, and test a completed PGN. For a first-time offline test, load a sample game and start a quick analysis while connected, then turn off Wi-Fi/mobile data, reopen the installed app and analyse again.
