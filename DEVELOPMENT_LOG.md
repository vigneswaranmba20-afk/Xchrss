# VER Chess — development log

## 2026-11-08 · v7.3 Learn observation quiz (PR #24 merged; Pages unverified)
- Added original, offline, FEN-based **back-rank geometry** questions with detector-checked yes/no feedback; isolated module, not yet wired into the Learn UI.
- Added Node regression tests for positive/negative fixtures, input validation and non-misleading explanations.
- **Release gate:** PR #24 pre-merge tactical/Chromium workflow passed (run 42463431044); merged as 33bdb0979b4622f93fd188a3a7bcd8167b13c95d. GitHub Pages deployment remains unverified. Do not describe this as a deployed feature.
- Baseline: main commit `7cc17419d897b6cd5bd5414ed45a80af0399247c` (PR #23). No production board files changed.
- Outstanding: verify Pages deployment for main, integrate accessible Learn UI and offline caching in a separate tested PR; physical Android verification remains pending.

## 2026-11-08 · mobile/offline quiz browser regression (PR pending)
- Added Playwright Chromium tests exercising the real browser quiz modules at a 393×852 mobile viewport, checking correct/incorrect feedback, invalid inputs, and consistent in-memory quiz behavior after network is disabled.
- Offline limitation: this checks an already-loaded module after disconnection, **not** fresh offline startup, service-worker caching, or physical Android behavior.
- Release gate: branch tests and Pages deployment not yet verified; no production board changes.

## 2026-11-08 · v7.3 tactical foundations
- PRs #18–#23 previously merged, adding and testing skewer, discovered-attack and back-rank geometry observations.
- Pre-merge GitHub Actions stability runs were reported passing for PRs #18–#23, but post-merge Pages deployment has not been independently confirmed. Geometry is **not** proof of legal checkmate, forced wins, or objective move accuracy.
