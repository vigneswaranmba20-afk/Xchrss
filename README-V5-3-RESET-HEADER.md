# VER Chess Intelligence v5.3 — Reset Board and Compact Header

This patch implements the owner's latest Android screenshot feedback.

## Changes

- Replaces the **middle Review Position readout** between Previous and Next with a large, touch-friendly **↺ Reset Board** button.
- Reset navigates to **move 0 of the current imported game**, using the existing legal replay controller. It does not clear the PGN, chess username library, move history, current theme, or Stockfish results.
- The move number (`39 / 51`, etc.) is retained beside the range scrubber.
- Reset is disabled when already at move 0, when there is no loaded game, or while the engine is actively analysing.
- Removes the large **Offline-ready / Stockfish 19** information banner above the tabs. The underlying hidden status element remains because the installed PWA script still updates it.
- Preserves the visible **Install App** action, installation dialog, service worker and cached offline Stockfish.
- Updates versioned CSS/JS references and service-worker app cache so Android-installed copies can receive the new design.

## Tests completed

- Mock control test started at move 39 / 51, selected Reset, and confirmed move 0 / 51 with game identity and analysis state unaffected.
- Previous and Next still function and increment/decrement correctly after reset.
- Reset is disabled during active analysis, at move zero, and without a game.
- Verified the offline banner is visually hidden while PWA installation and engine caching code remain.
- JavaScript parsing and CSS structure checks passed.
- Existing provider imports, PGN processing, board themes, legal navigation, copyright and GPL credits are untouched.

## Owner's Android acceptance checks

1. Open Board for a loaded game in the latest GitHub Pages build.
2. Confirm the large middle button says **Reset Board**.
3. On an intermediate move (for example 39/51), tap Reset. The board should show its opening position at **0/51**, keeping the loaded game intact.
4. Tap Next and Previous; they should work normally. The slider should display the current move number.
5. Check that the old **Offline-ready / Stockfish 19** banner above Games/Board/Insights is gone.
6. Confirm Install App still opens the install dialog, and Stockfish analysis still works.
7. Reopen the installed Android PWA to refresh its cache; do not clear site data, which holds saved games and board themes.

**Limitations:** Automated controls were tested with a mock DOM. Real mobile-browser layout and installed PWA behavior must still be inspected after the owner merges the PR.
