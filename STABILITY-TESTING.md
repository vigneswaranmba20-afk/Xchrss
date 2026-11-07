# VER Chess Intelligence — Stability Gate

The current v6.2 layout has already been merged. This change adds **tests and process only**, with no chess UI, Stockfish, import, or CSS changes.

## Why
Earlier CSS patches caused the board to shrink to a miniature and then disappear, while GitHub Pages deployments continued to report success. The proper release signal must be **a real browser rendering test**, not merely a successful deployment.

## How to run
Requires Node 22+, Python 3, and Chromium/Playwright.

```sh
npm install
npx playwright install chromium
npm run test:stability
```

GitHub Actions executes this automatically on new pull requests, pushes to main, or manually through `workflow_dispatch`. The tests use a local static HTTP server; **no Stockfish API charge, server subscription, or Chess.com login** is needed. The live public site is not modified.

## Release-blocking tests
- Four phone viewport sizes (320×600, 360×720, 390×820, 430×900).
- All **64 squares** must exist and be at least **97% visible** after accounting for the board's actual parent clipping, the top navigation and the bottom dock.
- Board size must not collapse to a tiny square even when CSS yields non-zero width.
- All 32 pieces must render in the initial position.
- PGN paste opens the correct game.
- Previous, Next, Reset to move zero, Flip and Analyse control remain present and functional.
- Games → Insights (fingerprint) → Board preserves the loaded game and visible board.
- The installed service worker can load the app shell when the browser goes offline.

## Results
**The suite is newly added and not yet certified green.** Treat any failure as a blocker, review its Playwright screenshot and trace, and fix the underlying cause before releasing further changes. Check the PR's GitHub Actions status.

## Limits
Chromium in GitHub Actions tests the actual checked-out static web app, not a hand-built HTML fixture. It is much stronger than prior mocks but is **not identical to Android Chrome on the owner's physical phone**. The final release signoff still includes one short Android check. This suite does not currently verify Stockfish evaluation accuracy or public-provider API uptime; those are separate concerns.

## Stability-first release policy
1. No new features while a board or workflow regression is open.
2. Every future UI PR must pass the stability suite and be reviewed; do not merge a red PR.
3. Keep previous pieces, local games, theme preferences and PWA offline cache working.
4. Treat real phone screenshots as regression evidence, not as an invitation to layer more CSS fixes.
5. Add a failing test before fixing any newly discovered regression.

**Note:** GitHub Actions test results do not automatically block a manual merge unless branch protection/rulesets require them. That repo setting needs a separate explicit decision.
