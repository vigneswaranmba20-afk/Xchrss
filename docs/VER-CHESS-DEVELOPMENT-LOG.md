# VER Chess Intelligence — verified development log

This log separates deployed functionality from work in progress. Entries must be corrected when GitHub Actions or the mobile browser reveals a regression.

## 2026-11-07 — v7.1 Learn Academy foundation

Status: **Deployed and verified**. [PR #14](https://github.com/vigneswaranmba20-afk/Xchrss/pull/14) merged as [544b5bc](https://github.com/vigneswaranmba20-afk/Xchrss/commit/544b5bcba75450528662b3d615fe244535de5ada); [pre-merge Chromium tests passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42400841349), [post-merge Chromium tests passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42400950200), [GitHub Pages deployment passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42400949674).

Planned change: add a dedicated fourth Learn tab with two original sample lessons (Knight Fork, Absolute Pin), an independent SmoothBoard chess diagram, six guided lesson stages (Observe, Discover, Animate, Explain, Practice, Review), original short quizzes, reduced-motion behavior and offline assets. Added Playwright tests for lesson geometry, quiz, review preservation and offline PWA loading. Chess engine, saved game history, Stockfish and main game review board remain untouched.

Next: Build small positive and negative tactical position fixtures for fork and absolute-pin detectors (v7.2), then connect only verified motifs to game analysis. Keep researching mobile interaction design without enlarging the stable board.

## 2026-11-07 — v7 interactive Coach on Board

PR [#13](https://github.com/vigneswaranmba20-afk/Xchrss/pull/13) merged as [3fcdb196](https://github.com/vigneswaranmba20-afk/Xchrss/commit/3fcdb196026fb8b954a362a4a09858245c2ba6c4). Visual coach displays complete explanations on Board, animates real PGN moves and legal engine alternatives without mutating the game. [Post-merge Chromium tests passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42398583900); [GitHub Pages deployment passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42398583664).

## 2026-11-07 — v6.3 Lichess search and commentary

PR [#12](https://github.com/vigneswaranmba20-afk/Xchrss/pull/12) merged as a70ea65. Lichess search was restored and complete coaching text made accessible. Tests and Pages deployment passed. Subsequently superseded by v7's on-board explanation.

## Ongoing

Existing hourly VER Chess Development automation is enabled and updated to follow [the Learn roadmap](./VER-CHESS-LEARN-ROADMAP.md), use private book references conceptually and issue concise ChatGPT status reports every run. Direct WhatsApp sending remains unavailable without a verified supported integration.

## 2026-11-08 — v7.2 tactical edge-case coverage

[PR #16](https://github.com/vigneswaranmba20-afk/Xchrss/pull/16) merged as [f559f378](https://github.com/vigneswaranmba20-afk/Xchrss/commit/f559f3781453c02ab85c4578632a2306888d0d4d). [Pre-merge checks passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42406293100), [post-merge checks passed](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42411630062), and [Pages deployment succeeded](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42411629691). These are automated browser/Node checks, not a physical Android-device certification.

## 2026-11-08 — v7.3 geometric king-skewer detector

[PR #17](https://github.com/vigneswaranmba20-afk/Xchrss/pull/17) merged as [28dd388](https://github.com/vigneswaranmba20-afk/Xchrss/commit/28dd388da6567a0ed139b96782d46347ab40ed54) after [successful PR checks](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42411704043). [Pages deployment succeeded](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42415874570); the post-merge stability gate must also be checked separately. This is an isolated geometric detector, **not** a claim of legal or winning tactics, and it is not yet wired into imported games or Learn.

Additional queen-skewer positive/negative FEN fixtures are proposed in [PR #18](https://github.com/vigneswaranmba20-afk/Xchrss/pull/18). Do not mark those tests as passed or deployed until their CI and Pages checks finish. Next: complete edge-case validation, then implement discovered-attack observations with a clear distinction between visual alignment and forced tactical gain.
