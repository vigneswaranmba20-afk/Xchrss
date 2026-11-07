# VER Chess v6.1 — tiny-board regression hotfix

**Review branch:** feature/ver-chess-v6-1-board-fit-fix
**Live main:** unchanged until owner review/merge.

## User-reported regression (Android screenshot)

- The board is only a tiny square, surrounded by a large unusable empty area. The owner expected a full, comfortably sized 8×8 board that fits between the top tabs and the bottom thumb controls.
- The centre of the thumb toolbar unexpectedly says **Review Position** again rather than **Reset Board**. This suggests a mixed/stale browser service-worker cache; source on main already contains Reset Board.

## Root-cause mitigation

The previous v6 fitter used \`wrap.clientHeight\` to choose the board size, while the board itself participated in the same flex container sizing. This is a self-referential measurement that can shrink the board when ResizeObserver calls the fitter again.

v6.1 measures the **independent bounds** of the actual top navigation, fixed bottom dock, game title, optional board footer and reserved floating comment. The largest safe square board size is the minimum of viewport width and remaining vertical space. The observation is restricted to nav, dock and title—**not** the board or its flex wrapper.

A small override stylesheet makes the board wrapper occupy the entire remaining flex stage. It avoids shrink-to-content behaviour.

The review toolbar and fit script are referenced by **unique new filenames**, \`ver-chess-touch-review-v6-1.js\` and \`ver-chess-viewport-fit-v6-1.js\`, rather than relying solely on \`?v=\` query parameters. This prevents old service workers that ignore query strings from serving cached old copies. The new files, plus \`ver-chess-v6-1-fit.css\`, are precached by the version-bumped PWA shell. **No saved game data is cleared**.

## Features preserved

- Chess.com public username game import, saved game library, optional PGN import and previous saved Lichess records.
- Local Stockfish 19, mobile swipe/scrubber, Previous/Next, Reset Board, Flip and colour themes.
- Flying coach from engine evaluations, fingerprint Insights.
- Stable local SVG board renderer and existing arrows / move replay.
- Installable Android PWA, offline engine cache, original VER copyright and Cburnett/Stockfish source attribution.

## Browser layout fixture test (real headless Chromium)

The board and fixed top/bottom controls were exercised in a real Chromium layout fixture that replicates the relevant flex and viewport CSS and uses the new fit formula. Results:

| Viewport (CSS px) | Board square (CSS px) | Width utilisation | Fully above bottom dock |
|---|---:|---:|---|
| 320 × 600 | 257 | 80% | Yes |
| 360 × 720 | 342 | 95% | Yes |
| 390 × 820 | 372 | 95% | Yes |
| 430 × 900 | 412 | 96% | Yes |
| 800 × 650 | 307 | 38% (height-limited) | Yes |

This is better evidence than the earlier geometry-only mock checks, **but not a full live-app screenshot**. Actual Android Chrome and installed-PWA testing are still needed.

## Android acceptance checklist

1. Review and approve this PR; \`main\` remains unchanged until merged.
2. After GitHub Pages completes, close all VER Chess tabs/windows and reopen the live site once while connected to the internet. Do **not** clear browser/site data; it contains saved games/themes.
3. On Board in portrait, confirm all 64 squares and pieces are visible and the board occupies most of the available width.
4. Check the golden middle control reads **Reset Board**, not Review Position. From move 10/19, tap Reset: it must return to 0/19 without losing the game.
5. Collapse/expand Chrome's address bar, rotate the phone, or switch between Games/Board/Insights: the board must stay visible and auto-fit without becoming a miniature.
6. Confirm top Flip and Colour controls, bottom Previous/Next, move slider and Analyse still work. After analysis, verify coaching comments remain below the board.
7. Confirm Chess.com username search, optional PGN paste/upload, saved game library and offline Stockfish still work.

## Limitations
Live GitHub Pages/Android browser rendering cannot be exercised from this development environment. Do not call this fix confirmed on the owner's phone until they validate the new display.
