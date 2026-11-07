# VER Chess v6.2 — visible chessboard regression fix

**Scope:** Android phone Board view only. Changes are on a review branch and do not modify the deployed `main` branch.

## Confirmed root cause

The v4 game library inserts a `div.verv4-reviewbar` before the original board panel under `.left`. That means the CSS selector `.main > .left > .panel:first-child` used in v6 never matches the real chessboard panel. The v6.1 hotfix additionally assigned `height:0!important` to `.board-wrap`, intending it to flex-grow. However, without a flex parent, that wrapper stays at **zero height** and clips the board. The screenshot exactly matches this failure: game title, position caption and bottom dock visible but chessboard missing.

## Fix

- Mark the existing board section explicitly as `class="panel ver-board-panel"`.
- Load new uniquely named `ver-chess-v6-2-board-rescue.css` after older styles, addressing `section.ver-board-panel` rather than relying on element order.
- Make the board panel a real full-height flex column on mobile; return `.board-wrap` to `height:auto` and `flex:1 1 auto` so the eight ranks remain visible.
- Leave the independent v6.1 viewport sizing algorithm and original SmoothBoard renderer untouched. CSS provides a responsive square fallback if the sizing script is late.
- Reassert the gold `Reset Board` styling in the fresh stylesheet to prevent an unstyled white control when older PWA CSS is cached.
- Bump the PWA app shell to `ver-chess-shell-v6-2-board-visible-2026-11-07`, precache and route the new CSS. This does not clear games or change Stockfish engine caching.

## Browser regression proof (local Chromium layout reproduction)

The reproduction includes a hidden reviewbar *before* the chessboard panel, the v6 first-child selector, v6.1 zero-height wrapper and the corrective CSS, then measures the rendered board and dock rectangles in headless Chromium.

| Viewport (CSS pixels) | Broken board visible height | Fixed board dimensions | Entire board visible above controls? |
|---|---:|---:|---|
| 320 × 600 | 2 px | 300 × 300 px | Yes |
| 360 × 720 | 2 px | 340 × 340 px | Yes |
| 390 × 820 | 2 px | 370 × 370 px | Yes |
| 430 × 900 | 2 px | 410 × 410 px | Yes |

**Important:** These results are from a structurally equivalent Chromium fixture, not the complete live GitHub Pages page or the owner's Android phone. The user must still validate after merge.

## Android acceptance checklist

1. After an approved merge and successful GitHub Pages deploy, reopen the installed PWA (or Chrome tab) while online. **Do not clear site storage**.
2. Open Games → a completed game → Board. Verify a full 8×8 chessboard with all pieces fills most of the phone width.
3. Confirm the board remains visible when Chrome's URL bar expands/collapses and after rotating the device.
4. Confirm the centre control is a styled gold **Reset Board**, and Previous/Next/Analyse/Flip/Colours still work.
5. Confirm the coaching bubble appears below—not over—the pieces, after local Stockfish analysis.
6. Confirm the Chess.com username importer and local PGN/saved game library are unchanged.

## Preserved

Stockfish 19, locally bundled Cburnett chess pieces, theme picker, PWA offline support, PGN importer, Chess.com lookup, saved games and original VER copyright/licences.
