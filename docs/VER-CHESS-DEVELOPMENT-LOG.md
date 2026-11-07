# VER Chess Intelligence — verified development log

This log separates deployed functionality from work in progress. Entries must be corrected when GitHub Actions or the mobile browser reveals a regression.

## 2026-11-07 — v7.1 Learn Academy foundation

Status: **Pull request testing** (not deployed at time of authoring; verify CI and Pages before updating).

Planned change: add a dedicated fourth Learn tab with two original sample lessons (Knight Fork, Absolute Pin), an independent SmoothBoard chess diagram, six guided lesson stages (Observe, Discover, Animate, Explain, Practice, Review), original short quizzes, reduced-motion behavior and offline assets. Added Playwright tests for lesson geometry, quiz, review preservation and offline PWA loading. Chess engine, saved game history, Stockfish and main game review board remain untouched.

Next: Verify actual full-site Chromium tests; if any fail, fix without merging; then merge and verify GitHub Pages publication.

## 2026-11-07 — v7 interactive Coach on Board

PR [#13](https://github.com/vigneswaranmba20-afk/Xchrss/pull/13) merged as [3fcdb196](https://github.com/vigneswaranmba20-afk/Xchrss/commit/3fcdb196026fb8b954a362a4a09858245c2ba6c4). Visual coach displays complete explanations on Board, animates real PGN moves and legal engine alternatives without mutating the game. [Post-merge Chromium tests passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42398583900); [GitHub Pages deployment passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42398583664).

## 2026-11-07 — v6.3 Lichess search and commentary

PR [#12](https://github.com/vigneswaranmba20-afk/Xchrss/pull/12) merged as a70ea65. Lichess search was restored and complete coaching text made accessible. Tests and Pages deployment passed. Subsequently superseded by v7's on-board explanation.

## Ongoing

Existing hourly VER Chess Development automation is enabled and updated to follow [the Learn roadmap](./VER-CHESS-LEARN-ROADMAP.md), use private book references conceptually and issue concise ChatGPT status reports every run. Direct WhatsApp sending remains unavailable without a verified supported integration.
