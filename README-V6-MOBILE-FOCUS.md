# VER Chess Intelligence v6 — Mobile Focus & Fully Visible Board

**Branch:** feature/ver-chess-v6-mobile-focus
**Workflow:** review in pull request; do not merge or publish to production without owner approval.

## Goal
Fix the clipped chessboard demonstrated in the user's live Android screen walkthrough and remove distracting panels from the Games landing page.

## Changes
- **Full-viewport Board.** On phones up to 850 CSS px wide, the board screen uses a viewport-fitted stage between the navigation tabs and thumb control dock. A custom script measures \`visualViewport.height\`, actual tab and dock rectangles, the board area width/height and reserved comment space. It sets both board dimensions to the largest safe square size, adjusting on browser viewport resize, screen rotation, panel resizing or view changes.
- **The entire 8×8 board remains visible.** No square or piece should be hidden behind the fixed navigation or control dock, even when the address bar expands. On shorter displays the board **shrinks as needed** rather than cropping.
- **Flip at the top.** Rehomes the original Flip control (same event handler) beside the board header and Colour themes; it does not clone or replace the orientation logic.
- **Simpler Board view.** Removes intrusive header/hero on small phones, hides redundant long-form board controls and the giant Move Coach section while reviewing; keeps the single full board, a compact caption, free-space coaching comment and existing thumb dock with Previous / Reset / Next, slider and Analyse.
- **Games landing page centered on Chess.com.** The former welcome banner (“Every move teaches”), large explanatory copy and extra provider card are removed from the visible interface. One inline Chess.com username field plus small Find button is the primary entry point. Optional PGN upload/paste and game filters are collapsed by default.
- **Lichess integration preserved but hidden from new search UI.** This follows the owner's request for a Chess.com-only primary search while avoiding deletion of saved games or breaking the existing API module. Historical saved games remain in local storage; the user can still review them.
- **Learning Moments list removed.** No long separate panel remains on Games.
- **Flying chess comment.** A custom lightweight comment bar below the board briefly appears when a move already has a Stockfish grade (mistake, blunder, missed chance, inaccuracy, best or strong), with the selected move and best move where available. It animates into view without covering any squares. Comments use existing evaluation thresholds and explanation code, **not** invented chess-book quotes or paid AI.
- **Copyright and open-source notices retained.** VER original copyright and Stockfish/Cburnett GPL attribution cannot legally be reassigned to Chess.com. The site's public disclaimer remains independent of Chess.com.
- **Offline PWA preserved.** New assets precached and service-worker shell bumped.

## Changes to code
- New \`ver-chess-v6-mobile.js\`: viewport fitting and actual Flip control relocation.
- New \`ver-chess-v6-mobile.css\`: responsive layout, focus-first Games UI and comment animation.
- New \`ver-chess-flying-coach.js\`: simple deterministic Stockfish-informed comments.
- Updated \`index.html\`: remove hero, hide old learning list, hook coach notifications, load new assets.
- Updated \`ver-chess-v4-library.js\`: compact Chess.com lookup, collapsed optional PGN and saved-game filter, hidden old Lichess discovery UI.
- Updated \`sw.js\`: refresh offline shell to include the three new v6 files.

## Checks completed
- Syntax checks for all inline and linked JS and the service worker.
- Static checks preserving Stockfish, saved game imports, PGN, responsive piece renderer, legal replay and attribution.
- Mock viewport measurement: 320×600, 360×720, 390×820, 430×900 and 800×650. Board width and height fit within the calculated available mobile area and never extend into the dock in these simulated cases.
- Flip and palette controls rehomed into board-title action area in a mock DOM.
- Mock coaching test: no comment without evaluation; mistake appears with Stockfish's preferred move; strong move appears positively; comments hide while analysis runs.
- Offline cache lists all newly created files.

## Phone acceptance checklist before/after merging
1. Open Games: no hero, no long learning-moments panel; an immediately obvious Chess.com username and Find control. Test a known Chess.com public username.
2. Open a game, switch to Board in an Android Chrome tab and in the installed PWA. **All 64 squares and piece silhouettes must be visible simultaneously without scrolling**.
3. Expand or collapse Android Chrome's address bar, rotate the phone, and reopen in full-screen PWA. The entire board must automatically resize and never hide the bottom ranks behind the fixed controls.
4. Tap **Flip** beside the board header and change a Colour theme; board stays fully visible and the same loaded game remains selected.
5. Use large Previous / Reset Board / Next buttons and slider. Move progression still works.
6. Start local Stockfish analysis. Check original progress overlay, status and statistics. After analysis, step to a mistake and confirm a small animated comment appears **below** the board without covering pieces.
7. On Games, optional PGN upload/paste still opens a completed game. Old saved records have not been erased. The fingerprint Insights view remains available.
8. Check at phone portrait widths around 320, 360, 390 and 430 CSS px. Check keyboard focus and reduced-motion behavior.
9. Inspect copyright, Stockfish/Cburnett source attribution and PWA offline support.
10. Confirm GitHub Pages deployment after owner merge. Reopen installed app without clearing site storage (which holds board-theme and game-library preferences).

## Limits
Mock tests and source validation cannot certify actual device viewport behavior. This new sizing algorithm is designed to prevent clipping but needs testing in the owner's Android Chrome/PWA. Book-based coaching is **not** incorporated; the initial comments use local Stockfish evaluation information. Future book-based explanations would require appropriately licensed or user-owned source excerpts and a retrieval design.
