# VER Chess Intelligence — v4.1 Mobile UX Review

Branch: feature/ver-chess-v4-mobile-ux
Status: review only; no automatic merge into main.

## What changed
- Both **Chess.com** and **Lichess** have their own visible username fields and individual Find buttons on the Games landing screen.
- Every search has provider-specific progress messages, including Chess.com monthly archive count.
- The game list defaults to **the latest exact provider+username search**. Older cached results never masquerade as results from a new search.
- A clearly labeled **All saved games** action restores the full 80-game local multi-platform collection.
- Every game displays its platform, outcome, participants, date and direct **View board** / **Analyse** actions.
- The long mixed page is organized into three persistent screen destinations: **Games / Board / Insights**.
- The Board screen has its own **Analyse** button and **Back to games** action. Insights keeps the original engine depth, statistics and move explorer.
- A manual PGN shortcut still exposes the original upload/paste workflow.
- The installed PWA's service worker precaches the revised JS and CSS; the JS request is versioned for existing installs.
- Keyboard arrow navigation, accessible labels, statuses and legible mobile tap targets are included.

## Original functions protected
The original PGN parsing, Lichess URL import, upload/paste, Stockfish 19 WASM engine, game review overlay, move coach, arrows, depth controls, original PWA assets and © 2026 VIGNESWARAN E R copyright are unchanged except for a narrow focus-management improvement when analysis completes.

## Regression tests completed
- JavaScript syntax validation: passed.
- Simulated Chess.com API monthly archives: passed.
- Simulated Lichess public PGN export: passed.
- Most recent searched Chess.com username shows only its own results: passed.
- Switching to a Lichess username shows only that source and username: passed.
- A search with zero games no longer shows previous username's games as fresh results: passed.
- All saved restores both previously imported sources: passed.
- One-tap analysis uses existing PGN importer and runAnalysis: passed.
- Manual PGN option routes to original importer: passed.
- Browser-local saved game records: passed.
- Main branch untouched; review branch only.

## Android acceptance test after review
1. Open the changed app in Android Chrome **after** owner-approved merge. Refresh/reopen twice if the old PWA service worker is initially controlling the page.
2. Confirm two visible, independently editable **Chess.com** and **Lichess** search cards without having to explore a dropdown.
3. Search a known Chess.com username with finished games; confirm progress shows month count and the results list explicitly says Chess.com @username.
4. Search a known Lichess username; confirm fresh results are scoped to Lichess, not the previous Chess.com account.
5. Search a non-existent or game-less account; confirm the empty state identifies the typed username and platform and does not show stale previous games.
6. Tap All saved games; verify both platforms' cards return, source badge visible on each.
7. Tap View board, then Analyse; check the board is shown immediately and the existing Stockfish progress overlay runs without scrolling back to the old analysis panel.
8. Use Games / Board / Insights nav and browser back gestures; test 360, 390 and 430 CSS-pixel portrait widths and landscape.
9. Test filtering, pagination, PGN upload/paste, Lichess URL import, arrows, coach, offline engine, copyright and install.
10. Inspect GitHub Pages Actions for success. Do not merge until approved.

## Known constraints
- The actual Android screen and live cross-origin provider responses could not be tested in this environment. All integration tests use controlled mock API responses.
- Date/site metadata can be absent in public PGNs; the UI has explicit fallbacks.
- Public API rate limits, missing games and browser CORS may prevent imports; the original manual PGN fallback remains available.
- Local storage is device/browser-specific, may be evicted, and does not sync across devices.
- No passwords, OAuth secrets, private games, subscriptions, API charges or separate backend were added.

## Product research
- Chess.com in-app review: https://support.chess.com/en/articles/10328363-how-do-i-use-game-review-on-the-app
- Chess.com PubAPI / branding rules: https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it
- Lichess API: https://github.com/lichess-org/api
- Aimchess: https://aimchess.com/
- ChessMonitor: https://www.chessmonitor.com/

Research informs interface principles but NO proprietary third-party design or brand assets were copied. Original VER styling is retained.
