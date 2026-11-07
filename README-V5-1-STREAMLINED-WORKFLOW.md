# VER Chess Intelligence v5.1 — Streamlined Games, Insights and Board Colours

Review branch: feature/ver-chess-v5-refined-workflow
Production remains unchanged until the owner merges the pull request.

## User requirements implemented

1. **Games is the unified entry point.** Two visible, separate Chess.com and Lichess public-username search cards remain on the Games screen.
2. **Compact PGN support directly below the searches.** Existing file upload, paste, and multi-game selector elements are relocated into the Games section, preserving their working handlers. The optional PGN row uses an Upload PGN button and collapsible Paste PGN controls, with no giant dropzone.
3. **Remove duplicate importing UI from Insights.** The previous Drop your PGN, public Lichess URL importer and Try example game controls have been removed from the visible app, with their obsolete event handlers removed as well. Username imports and manual PGN import remain.
4. **Insights leads directly to Engine analysis.** The redundant Game insights title strip is gone. The destination scrolls to the engine strength/progress panel, whose Analyse button is available there. Users can also start analysis from the existing Board thumb dock; the buttons are never duplicated on the same screen.
5. **Five board palettes.** Classic green, Warm wood, Ocean blue, Slate night and High contrast. A compact Colours control in the Board header opens an accessible palette picker. Board colour preferences are saved in browser localStorage, and applied as CSS variables without remounting squares/pieces or resetting the game.
6. **Accessibility and responsive layout.** Swatches have visible names and selected states, modal focus is restored to the trigger after closing, board coordinate colours have >=4.5:1 calculated contrast on light and dark squares, and palette controls adapt to narrow mobile widths.
7. **PWA cache version updated.** The new theme script and style are included in the offline shell; the modified game library script is versioned to ensure existing Android installs can refresh.

## Protected capabilities

- Chess.com and Lichess public username game importing and clear source-specific search results.
- Existing PGN parsing, multi-game selection, legal move navigation and self-hosted Stockfish 19.
- Original VER SmoothBoard v5, locally bundled Cburnett pieces, large Previous / Next dock, swipe and scrubber.
- Move coaching, overlays, position arrows, analysis depth, statistics, learning moments and export.
- Existing Android installable PWA manifest, engine service-worker caching, copyright © 2026 VIGNESWARAN E R and separate Stockfish/Cburnett licences.
- No paid APIs, login, backend, or subscriptions.

## Automated checks completed

- JavaScript syntax: original inline scripts, updated Games library, theme module, service worker.
- PGN relocation: Upload / file input, Paste textarea / action, multi-game selector all land in Games.
- App view navigation: default Games; imported PGN opens Board; Insights targets the engine panel.
- Board theme unit test: previously saved theme is read before page content initializes; five palettes populate the dialog; selecting a palette writes browser-local preference and does not rerender the board.
- CSS balance, all PWA asset paths, Stockfish preservation and owner/third-party attribution.
- Colour contrast calculation for square coordinate labels on all five board themes.

## Android acceptance checklist before merging

- [ ] In Games, locate two username forms and the compact Upload PGN / Paste PGN option directly beneath them.
- [ ] Upload a completed standard game PGN; confirm its Board view opens without scrolling.
- [ ] Paste a valid PGN; confirm Board opens and existing move navigation still works.
- [ ] If a file contains several games, confirm the list selector appears in the Games PGN area and can switch the loaded game.
- [ ] Click Insights. The first main panel should say Engine analysis; verify Quick/Balanced/Deep and Analyse are visible.
- [ ] Start analysis from Insights and from the Board dock, verifying original progress overlay, Stop control and results.
- [ ] On the Board, tap Colours and test all five palettes. Move pieces and flip the board, then close/reopen the PWA and confirm the palette persists.
- [ ] Test both username providers, board navigation, local saved game library, move arrows, PWA offline engine, copyright and credits.
- [ ] Confirm previous giant Drop your PGN panel, URL input and Try example buttons are not visible in Insights.
- [ ] After owner-approved merge, verify GitHub Pages deployment succeeds, then reopen the installed Android PWA to receive the new app cache.

## Limitations

The automated tests use simulated DOM and API interactions. Real Android Chrome rendering, third-party API responses and device-specific performance must be verified after release. Do not merge without owner review.
