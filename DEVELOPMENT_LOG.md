# VER Chess — development log

## 2026-11-09 · v7.4 piece-count FEN guard — PR validation pending, NOT RELEASED
- Proposed conservative rejection of positions with more than eight pawns or sixteen total pieces for either side. Added positive/negative Playwright fixtures for nine pawns (both colors), seventeen white pieces and existing valid positions.
- No claim of complete FEN legality or tactical soundness; no board, PGN, engine, storage, or PWA changes. Require branch CI and post-merge Pages verification before release.

## 2026-11-09 · v7.4 matcher invalid-position hardening — PR pending, NOT RELEASED
- Reject FEN inventories without exactly one king of each color, or with pawns on rank one/eight; avoid suggesting lessons for clearly impossible positions.
- Added positive and negative Playwright fixtures and non-mutation checks. Does not establish full FEN legality, check constraints, forced tactics or chess accuracy.
- No changes to review Board, game data, engine or offline service worker. Await PR CI, post-merge Pages verification and physical Android testing before claiming release.

## 2026-11-09 · v7.4 exact-position lesson matching foundation — proposed, NOT RELEASED
- Added a standalone, offline-capable helper that matches a game's FEN to a lesson only when piece placement and side to move agree exactly. Halfmove/fullmove counters are ignored; no tactical opportunity or accuracy is inferred.
- Added a 393×852 Playwright regression for positive/negative/invalid matches and unchanged existing board DOM.
- Not wired to the visible game library or Learn UI yet. This is a cautious foundation, not a completed game-to-lesson bridge.
- Release gate: PR CI and all existing browser/position/offline checks must pass before merge; Pages deployment and independent Android verification outstanding.


## 2026-11-09 · Verified v7.3 release ledger (supersedes earlier pending-status wording)
Earlier entries below were written at PR creation time and retain their historical status snapshots. The following later checks supersede those *pending* labels; they are not evidence of physical Android testing or independent public-site accessibility.

| PR | Scope | Merge commit | Post-merge evidence | Limitations |
| --- | --- | --- | --- | --- |
| [#27](https://github.com/vigneswaranmba20-afk/Xchrss/pull/27) | Visible observation practice | Previously merged | [Stability](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42510227796), [Pages](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42510227166) reported successful | No physical Android check |
| [#28](https://github.com/vigneswaranmba20-afk/Xchrss/pull/28) | Offline precache and reload test | `234da411cf62db91be95a78c37d4cf95e56e4cf9` | [Stability](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42520052876), [Pages](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42520053759) reported successful | Independent offline launch on device outstanding |
| [#29](https://github.com/vigneswaranmba20-afk/Xchrss/pull/29) | Keyboard focus | `bed5e870c0fb6d6db9141a1540cfaf430367ad06` | [Pre-merge CI](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42525176556) passed | Post-merge run not recorded here |
| [#30](https://github.com/vigneswaranmba20-afk/Xchrss/pull/30) | Answer accessibility context | `9c2e40969170da9251cd9a3c24ba369c11b82787` | [Stability](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42540316770), [Pages](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42540316397) reported successful | Screen-reader/device testing outstanding |
| [#31](https://github.com/vigneswaranmba20-afk/Xchrss/pull/31) | First-attempt session review | `5ecd4b342f1f38266ef60916dc25fef6cb545192` | [Stability](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42556407364), [Pages](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42556406982) reported successful | Live public-site and physical Android tests outstanding |

These workflow results are based on previously reported GitHub Actions outcomes. They must be rechecked against the GitHub UI before a new release; a successful Pages job is not proof that the public site loads on every Android device. No objective chess accuracy is inferred from practice results. Next: v7.4 game-to-lesson bridge with positive/negative fixtures, board-preservation checks, offline and mobile regressions.


## 2026-11-09 · v7.3 observation practice review — PR awaiting validation
- Proposed a session-only first-attempt practice summary after all three detector-checked questions, with an explicit warning that it is **not chess move accuracy**. Restart clears the session tally. No persistent storage or engine metrics.
- Added 393×852 Playwright browser regression for incorrect/correct attempts, summary and reset. Review Board, PGN, Stockfish and PWA unchanged.
- **NOT RELEASED:** branch CI, mobile/offline regressions and Pages deployment must pass before merge. Physical Android and independent live-site checks outstanding.

## 2026-11-09 · v7.3 quiz answer accessibility context — PR pending
- Proposed a small, isolated improvement: both observation answer buttons reference the current position counter and question using `aria-describedby`, so keyboard/screen-reader focus has position context after advancing.
- Added a 393×852 Playwright browser regression checking answer descriptions and updated position context.
- **Release gate: NOT VERIFIED.** Branch CI, mobile browser checks and Pages deployment pending; do not merge until tests pass. No stable Board, Stockfish, PGN, saved-game or PWA changes.

## 2026-11-09 · v7.3 keyboard-accessible observation practice — awaiting CI
- Proposed focused keyboard focus management: after a correct answer disables the answer buttons, focus moves to Next; advancing a position returns focus to the first enabled answer.
- Added a real-site Playwright 393×852 keyboard-only regression covering Enter activation and focus transitions.
- **Release gate: NOT VERIFIED.** Await branch CI and browser checks; do not merge or claim deployment before passing. No review Board, saved games, Stockfish, or PWA cache changes.


## 2026-11-08 · v7.3 visible observation practice — pending PR verification
- Added an isolated, in-app Learn practice card with three detector-checked back-rank geometry questions, yes/no feedback, a separate SmoothBoard, and touch-friendly controls. Existing review Board and saved-game state are not intentionally mutated.
- Added actual-site Playwright checks for 393×852 viewport, incorrect/correct answers, board DOM preservation, and loaded-then-offline interaction with reduced motion.
- **Release gate: NOT VERIFIED.** Branch CI and browser screenshots must pass before merging; Pages deployment and physical Android verification remain pending. Do not claim this feature is live.
- Scope is geometric observations only, never forced checkmate or objective accuracy. No paid services or new third-party dependencies.


## 2026-11-08 · v7.3 PR #25 verified post-merge CI and Pages workflow
- PR #25 merged as `f68149bed05d43214da4c6889d0cd4e23d6033ac` after successful pre-merge CI (run 42485200882). Browser coverage includes a 393×852 Chromium viewport and loaded-then-offline quiz behavior; it does **not** establish fresh offline startup or physical Android functionality.
- **Post-merge verification:** stability run [42490397466](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42490397466) completed successfully: tactical fixtures, actual-site Chromium tests, and mobile screenshot upload all passed.
- **Pages workflow:** [42490397250](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42490397250) completed successfully, including build, deploy and report-build-status jobs. This confirms GitHub Actions reported a successful Pages deployment, **not** independent live-site accessibility or mobile-device functionality.
- **Release scope:** tests and development documentation only; existing Board, Stockfish, local games and PWA application code unchanged. Quiz module is still not integrated into the visible Learn interface.
- **Next:** independently open the live Pages site, verify loaded assets/offline launch and Android UI; then build an accessible Learn quiz UI in a separate focused PR with Playwright checks.

## 2026-11-08 · v7.3 Learn observation quiz (PR #24 merged; Pages unverified)
- Added original, offline, FEN-based **back-rank geometry** questions with detector-checked yes/no feedback; isolated module, not yet wired into the Learn UI.
- Added Node regression tests for positive/negative fixtures, input validation and non-misleading explanations.
- **Release gate:** PR #24 pre-merge tactical/Chromium workflow passed (run 42463431044); merged as 33bdb0979b4622f93fd188a3a7bcd8167b13c95d. GitHub Pages deployment remains unverified. Do not describe this as a deployed feature.
- Baseline: main commit `7cc17419d897b6cd5bd5414ed45a80af0399247c` (PR #23). No production board files changed.
- Outstanding: verify Pages deployment for main, integrate accessible Learn UI and offline caching in a separate tested PR; physical Android verification remains pending.

## 2026-11-08 · mobile/offline quiz browser regression (PR pending)
- Added Playwright Chromium tests exercising the real browser quiz modules at a 393×852 mobile viewport, checking correct/incorrect feedback, invalid inputs, and consistent in-memory quiz behavior after network is disabled.
- Offline limitation: this checks an already-loaded module after disconnection, **not** fresh offline startup, service-worker caching, or physical Android behavior.
- Release gate: branch tests and Pages deployment not yet verified; no production board changes.

## 2026-11-08 · v7.3 tactical foundations
- PRs #18–#23 previously merged, adding and testing skewer, discovered-attack and back-rank geometry observations.
- Pre-merge GitHub Actions stability runs were reported passing for PRs #18–#23, but post-merge Pages deployment has not been independently confirmed. Geometry is **not** proof of legal checkmate, forced wins, or objective move accuracy.
