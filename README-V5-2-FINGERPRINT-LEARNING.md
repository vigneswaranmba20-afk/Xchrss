# VER Chess Intelligence v5.2 — Fingerprint-first Insights and Learning Moments on Games

Branch: feature/ver-chess-v5-2-fingerprint-learning
Release status: review only — main is unchanged until the owner approves and merges the pull request.

## Changes requested and implemented

### Insights
- **Game Fingerprint is now the first visible panel** when opening Insights.
- The bulky Engine Analysis section is **removed from the visible interface**, but its hidden DOM controls are preserved because the existing self-hosted Stockfish engine, Board Analyse button and progress overlay still use them. Analysis has NOT been removed.
- The previous Move Explorer section is removed. Its render function no longer recreates a hidden moves list; a tiny hidden compatibility element remains for existing references.
- Existing game fingerprint evaluation chart, stats, SVG visualizations and all engine computation continue unchanged.

### Games landing page
- **Learning Moments now appears below the Chess.com/Lichess username searches and optional PGN import**, before the saved game collection.
- The Learning Moments panel is the original engine-generated list, moved into the Games layout rather than duplicated. It supports White/Black filters and up to 20 ranked mistakes, misses and inaccuracies.
- The panel labels the **currently loaded game** so the player knows which game's insights are being shown.
- Tapping a learning moment first jumps the existing legal-replay board to the precise half-move (ply) and then switches to **Board**. Existing move arrows and comparisons remain available.
- When no analysis exists, the page explains that a completed game must be analysed from Board first.

### Preserved
- Chess.com and Lichess public-username lookup, separate provider status, deduplicated local library, game filters.
- Optional PGN upload/paste below the two username forms.
- VER SmoothBoard piece artwork and transitions, board themes, large two-thumb move dock, swipe, scrubber and Flip.
- Board one-tap Analyse action, self-hosted Stockfish 19 WASM engine, analysis overlay and Stop.
- Fingerprint statistics, position evaluation, coach, critical move arrows, original VER copyright and third-party software/art attribution.
- Android installable PWA and offline engine caching. No paid APIs or server added.

## Automated validation completed
- JavaScript syntax checks for the inline chess engine and modified game-library code.
- Mock navigation: Insights opens at Game Fingerprint (not the hidden engine section); Games moments panel is rehomed underneath the PGN controls.
- Mock learning moment: the selected move triggers both a matching jump (ply 2 in test) and Board activation, with source game name visible.
- Preserve existing Chess.com/Lichess search scripts and manual PGN handlers.
- CSS brace balance, PWA cache version and original Stockfish/copyright markers.

## Android manual acceptance checklist
1. In Games, verify both Chess.com/Lichess username fields, compact PGN upload/paste, **Learning Moments**, then saved games.
2. Open a completed game from either provider and tap Board → Analyse. Wait for the normal analysis overlay to complete.
3. Return to Games; ensure Learning Moments shows named findings from the selected game.
4. Tap a finding (for example, "18... Rf8 · A critical turning point"). The UI should switch to Board, showing the precise move/position and the existing stronger-move arrows.
5. Change White/Black filter in Learning Moments and repeat.
6. Tap Insights. The first visible panel should be **Game Fingerprint**, followed by the remaining statistical panels. Engine Analysis and Move Explorer must **not** appear.
7. Verify the Board's Analyse button still starts Stockfish even though its older engine settings panel is hidden.
8. Verify themes, board navigation, optional PGN upload/paste, previous saved library and offline installed PWA remain functional.
9. After approval and merge, confirm GitHub Pages Actions deployment is successful and reopen the installed Android PWA to refresh the service-worker-controlled version. Avoid clearing site storage; it stores the local game library and board-theme preference.

## Limitations
The automated tests use a mock DOM, not real Chrome screenshot rendering or actual Stockfish analysis on the user's Android device. The release still requires a manual visual and interaction check after approval. Learning Moments are calculated for the currently loaded analysed game in the session; the browser's saved game library persists, but engine evaluations are not automatically persisted across app restarts.

