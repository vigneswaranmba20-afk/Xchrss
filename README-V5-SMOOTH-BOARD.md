# VER Chess Intelligence v5 — Smooth Review Board (PR review build)

This release addresses the user's **actual Android screenshot**: duplicate Analyse actions, cramped navigation, a tall missed-chance banner before the board, choppy piece rendering, and tiny buttons far from the thumb area.

## Why the original board felt rough

The original renderBoard function regenerated 64 HTML squares plus fresh img elements whenever the position changed. This made SVG loading, browser layout and visual transitions more expensive than necessary. The v5 renderer keeps all 64 squares and up to 32 active pieces as persistent DOM nodes and only updates transforms, highlights and arrow overlays.

## What changed

- Original, dependency-free **VER Chess SmoothBoard v5** renderer using one stable 64-square grid and individually retained piece elements.
- Piece movement uses short GPU-friendly transform transitions; flipping orientation resets without an unnecessary full-board animation.
- All 12 high-resolution **Cburnett SVG chess piece drawings** are bundled locally (GPLv2+; credits and licence included) so they are consistent, crisp and available offline. No images are refetched during move navigation.
- Critical-move banner is relocated **below the board**, avoiding an extra large block above the chessboard.
- Redundant Analyse action in the old quick bar and Insights is hidden, leaving **one clear Analyse button** in the new Board thumb toolbar.
- Large left-side **Previous** and right-side **Next** buttons remain reachable by both thumbs; a range scrubber can jump to a chosen move, and horizontal board swipes step through move history.
- The dock stays visible while reviewing, independent of the page scroll. The existing arrows/flip/compare controls are still available below the board.
- Original move list and critical moments no longer rebuild on every normal navigation tap; they update when game data/analysis changes.
- The original Stockfish, PGN parser, Chess.com/Lichess username searches, game library, move coach, analysis overlay, PWA manifest and copyrighted original VER materials are preserved.
- Service worker precaches the new renderer, touch controls, CSS and bundled artwork. Also fixes offline cache matching for versioned JS/CSS requests.
- No external chessboard library, paid API, new server, account login or subscription.

## Code files

- NEW ver-chess-piece-art.js (Cburnett GPLv2+ locally bundled art)
- NEW ver-chess-smooth-board.js (original custom renderer)
- NEW ver-chess-smooth-ui.css (mobile-first board and thumb controls)
- NEW ver-chess-touch-review.js (mobile gestures, navigation dock and controls)
- NEW GPL-2.0-CBURNETT-LICENSE.txt (separate artwork license)
- UPDATED index.html (delegates rendering to new custom board; preserves fallback)
- UPDATED sw.js (caches new assets and handles query-versioned URLs offline)
- UPDATED COPYRIGHT.md (accurate third-party artwork attribution)

## Checks performed

- JavaScript syntax validation for all new JS files, original inline scripts and service worker — passed.
- Mock DOM board test: initial 32 pieces, exactly 64 squares, one root initialization, reused moving pawn node, expected chess-square transform, arrow overlay, highlights, board flip — passed.
- Touch-control unit tests: Previous, Next, scrubber, swipe-left progression, sole Analyse handoff, terminal move disabling and analysis-in-progress disabling — passed.
- CSS brace balance, PWA asset references, preservation of original copyright and Stockfish code — passed.

## Android acceptance checklist before merging

1. Review the PR and keep main unchanged until approval. GitHub Pages does not automatically publish the feature branch.
2. After merging, let the GitHub Pages deployment succeed. Open Chrome or relaunch the installed PWA; refresh once or twice if it still shows an old service-worker-controlled copy. Avoid clearing site data unnecessarily because it also deletes the local saved game library.
3. Open a Chess.com or Lichess game in the Board tab. The small game-title line should be visible above the board; critical-move callouts should appear below, not above, the chessboard.
4. Compare piece quality, especially the knight, king, queen and pawns, with the original screenshot. They should be SVG-sharp without momentary emoji/glyph fallback during move navigation.
5. Use large Previous (left thumb) and Next (right thumb) buttons, range scrubber, swipe left/right on board and Flip. Verify move sequence and orientation, arrows and square highlights.
6. Confirm there is only one primary Analyse action on the Board screen. Start the engine and verify the existing analysis progress overlay and Stop control.
7. Check Games and Insights tabs, input from Chess.com and Lichess, filtered library, PGN upload/paste, normal navigation, learning moments and review export.
8. Test full-screen installed PWA, offline game review after the engine is cached and preserved copyright/licence notices.

## Limitations

The code and mock DOM behavior were tested, but **live Android Chrome visual/performance testing is not possible here**. Smoothness varies by phone hardware and browser; the changes eliminate the main re-render problem but must be checked on the user's device before claiming a flawless experience.

## Research

- Chessground: https://github.com/lichess-org/chessground — studied efficient DOM updates, animation and mobile-touch interaction; its code was NOT copied.
- cm-chessboard: https://github.com/shaack/cm-chessboard — studied SVG animation and modularity; its code was NOT copied.
- Existing Cburnett artwork: https://github.com/lichess-org/lila/tree/master/public/piece/cburnett — original artwork separately GPLv2+ licensed and credited.
