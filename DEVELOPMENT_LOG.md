## 2026-11-11 · v7.5 final verified application release

- **Both workstreams RELEASED and production verified.** A: PR #46, merge `639e65fb4d2fd985f5862a3ce965169cccfab531`, 57 Chromium + 65 Node passed. B: [PR #47](https://github.com/vigneswaranmba20-afk/Xchrss/pull/47), final fix `845493727535c66c353fbee088206e3c6d7bc201`, guarded merge **`7b73a4f8044fae8dff2ac9a4892a2b4ffff25f4b`**, **76 Chromium + 71 Node passed**, zero failures/skips at the release head.
- B final-head [CI 43093556602](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43093556602), post-merge [CI 43094243606](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43094243606), and [Pages 43094242217](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43094242217): **success**. Earlier failed CI `43091980548` is superseded by the verified correction; no size or visibility assertion was lowered. Inspected both failed and successful actual CI screenshots/traces.
- Production **20:13 UTC PASS**: seven deployed asset SHA-256 hashes match the merged release; review boards 100% visible at 320×600, 360×800, 393×852, 412×915 and 800×360, zero overflow/internal scroll. New lesson opening positions 100% visible at all four requested portrait sizes. Completed the full line and **independent Practice against …Kg8 while offline**, checked every playback position's visibility, real offline Stockfish `uciok`, cached original lessons, fresh offline reopening/local PGN import, unchanged review snapshots/storage and no page errors. Production fork and review screenshots inspected. Evidence: [v75-workstream-b-production.json](docs/release-evidence/v75-workstream-b-production.json).
- Final small-screen layout: optional reasoning scrolls within a 120 px panel; local board 171 px (successful CI screenshot also exceeds the unchanged >140 px gate), local Review board 238 px. Latest full-run interpolation timing: mean 16.662 ms, p95/max 16.700 ms; earlier concurrent 83.300 ms outlier remains recorded. No handset FPS claim.
- Full report with branches, commits, all CI/Pages links and remaining work: [V75-RELEASE-REPORT.md](docs/V75-RELEASE-REPORT.md). **Physical Android remains PENDING**, with the phone-only checklist; do not uninstall or clear storage. External-provider uptime and physical installed-app ergonomics are not certified. Next smallest test improvement: actual PR #45→v7.5 worker migration with saved-library/engine-reuse assertions.
- **CP5, 20:14:54 UTC:** about 81 minutes elapsed, finalization only. No more feature work. Start/allowance limits remain as recorded below. This final documentation/evidence branch `docs/v75-release-verification-20261111` must pass its own CI and Pages checks; it changes no application assets or cache versions.

## 2026-11-11 · v7.5 Workstream B — implementation and release-candidate history

- Began only after Workstream A's release gates passed, at **19:10:33 UTC** (about 16 minutes elapsed). Separate branch `feature/v75-animated-combination-20261111`, based on A merge `639e65fb4d2fd985f5862a3ce965169cccfab531`. At 19:37 UTC about 43 minutes had elapsed; finalization reserve remains 20:54:16 UTC and absolute stop 21:24:16 UTC. Allowance/reset information remains unknown.
- Original **Lure, then fork** position: `3q2k1/8/5P2/4N3/8/8/8/K6R w - - 0 1`. Full line **Rh8+ Kxh8 Nf7+ Kh7 Nxd8**; alternative **…Kg8 Nxd8**. Production legal rules and independent python-chess agree on every FEN, SAN and exhaustive legal response. The f6 pawn prevents …Kg7 after Rh8+; premature Nf7 allows Qf8. No proprietary diagram or lesson copied.
- Bundled Stockfish 19 Lite WASM, one thread, Hash 32 MB, depth 22: best move `h1h8`, main PV starts with the full five-ply lesson, initial score **+678 cp from White's perspective**. Both king defenses after Nf7+ are analyzed separately (scores from Black's perspective are recorded). Finite-depth evidence does not prove mate; lesson wording limits its conclusion to exchanging a rook for the queen. Reproduce with `node scripts/verify-combination-engine.cjs`. Evidence is in `docs/release-evidence/v75-combination-{python,stockfish}.json`.
- Isolated six-stage player in Learn: Observe without spoilers/autoplay, legal candidate selection, calm transform movement/capture fades and short arrows, synchronized explanations with optional reasoning, three-move independent Practice against either defense, and a transferable pattern review. Pause/Previous/Next move/Replay/Flip/Exit, keyboard, touch dragging/cancellation, rapid-tap guards, page-visibility pause/Continue, and timer/ghost cleanup on leaving are implemented. New content and assets are cached offline; engine/storage caches are preserved. Existing two lessons, review board, imports, engine and Insights remain regression gates.
- First focused pass: **12 browser tests + 5 chess-content tests passed**, zero failures. Subsequent tests add engine-evidence correlation, flipped input, visibility pause, live-drag exit, and all six stages/optional reasoning across 320×600, 360×800, 393×852 and 412×915. Actual screenshots inspected at the fork, captures, review and smallest screen. At 320×600 default boards measured 185–278 px; expanded reasoning uses 146 px with internal text scrolling. All measured visibility fractions exceed 99.8%, with no horizontal overflow. Protected Board >97% assertions are unchanged; the catalog count intentionally increases to three while asserting both original lessons remain.
- Measured visible rook interpolation in headless Chromium: 26 frame intervals, mean **16.665 ms**, p95 **16.700 ms**, maximum **16.800 ms** in the focused run. This is runner evidence, **not physical Android FPS certification**. A new landscape check reproduced an unreadably small new lesson board (75 px on opening, 31 px during playback at 800×360); the scoped landscape layout now passes with the board beside controls.
- First full run passed **72 browser + 71 Node**, but actual screenshot review caught intermittent page displacement of the new player during playback. A focused rerun did not reproduce it; per-ply visibility checks and an explicit accidental/focus-scroll regression now guard it. Pin only the active combination player below the navigation, preserving the review board's existing geometry. That pass then succeeded with **73 browser** tests. Keyboard-boundary audit also reproduced Left moving a hidden imported review from ply 1 to 0; stop Left/Right propagation inside the new player. The next full pass succeeded with **74 browser + 71 Node**, with 100% visibility at all five playback positions. The same leak was then reproduced in **both original lessons** (two targeted failures); the global review handler now respects defaultPrevented and stays inactive in Learn. Added guards for both lessons, tab-arrow navigation and still-working Board shortcuts. Final combined validation is running before release. Before/after screenshots and failure traces are retained locally; CI retains the final successful screenshots. No assertion threshold was lowered.
- Final local gate at **19:55 UTC** (about 61 minutes elapsed): **76 Chromium browser tests + 71 Node fixtures passed, zero failures, zero skips**. The final concurrent motion sample showed mean **21.667 ms**, p95/max **83.300 ms**. Isolated follow-up passed with visible interpolation, 26 frame intervals, mean **16.663 ms**, p95 **16.700 ms**, max **16.800 ms**. Both samples are retained; no claim of handset 60 FPS is made. Raw counts, tested asset hashes, viewport and playback measurements are in [v75-workstream-b-local-qa.json](docs/release-evidence/v75-workstream-b-local-qa.json). Only release verification and evidence/checkpoint documentation remain; no further feature work is planned.
- Physical Android remains **PENDING**. Final-head CI, guarded merge, Pages/live-hash verification and production browser smoke must pass before this candidate is described as released. Details: [TACTICAL-COMBINATION.md](docs/TACTICAL-COMBINATION.md).
- **CP4 / CI gate blocked and repaired on branch:** [43091980548](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43091980548) at `e43a33ed81341b272a8b463b77fe324a22c47aea` passed 75 browser cases and all 71 Node fixtures, but the expanded-reasoning check failed twice at 320×600: board width **130 px**, below the unchanged **>140 px** requirement. Downloaded and inspected the actual CI screenshot and trace. CI leaves less vertical space than the local runner. Cap the smallest-screen reasoning panel at 120 px (internal scrolling), shorten Review and omit its redundant deeper-reasoning disclosure. No thresholds or assertions change. Require a fresh final-head full CI before merge. At **20:04:49 UTC**, about 71 minutes elapsed; feature work is complete and release gates remain mandatory.

## 2026-11-11 · v7.5 Workstream A — RELEASED and production verified

- [PR #46](https://github.com/vigneswaranmba20-afk/Xchrss/pull/46), branch `feature/v75-android-pwa-20261111`, fix **`c6c5ab378a2b9bdbca35575e72deaa123e68b2b6`**, merge **`639e65fb4d2fd985f5862a3ce965169cccfab531`**. Final-head [CI 43084058165](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084058165), post-merge [CI 43084371341](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084371341), and [Pages 43084370636](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084370636) succeeded. **57 browser + 65 Node passed, zero failures**.
- Production browser verified at **19:09 UTC**: matching SHA-256 bytes for index.html, sw.js and landscape rescue CSS; all 64 squares **100% visible** at 320×600, 360×800, 393×852, 412×915 and 800×360; zero horizontal overflow/internal board scroll. Navigation/Read full, cached Learn moves, closing/reopening offline, local PGN import and real offline Stockfish `uciok` passed, no page errors. Actual production screenshots inspected. Permanent evidence: [v75-workstream-a-production.json](docs/release-evidence/v75-workstream-a-production.json). Physical Android remains PENDING.

## 2026-11-11 · v7.5 Workstream A — implementation checkpoint

- Mission start: **18:54:16 UTC**; initial/fetched main **`8d2314942fc0c3f72fad49aa2608a0cccef0f3e1`**. PRs #44 (`7885c90`) and #45 are ancestors. No repository AGENTS.md or open PRs found. Working branch: `feature/v75-android-pwa-20261111`. Codex allowance/reset information is inaccessible and remains unknown; no billing/account changes. Finalization reserve begins **20:54:16 UTC**; absolute ceiling **21:24:16 UTC**. At the first fix checkpoint (19:03 UTC), about nine minutes had elapsed. Workstream B has not started.
- Baseline: `npm run test:stability -- --workers=2`: **48 passed, 0 failed**. `node --test tests/ver-chess-*.test.cjs tests/game-lesson-index.test.cjs`: **65 passed, 0 failed**. Sandbox prevents local server/test subprocesses; actual browser and fixture runs use the approved outer executor. No existing assertions or thresholds changed.
- Reproduced an HTTP 503 bypassing a valid cached app shell and concurrent engine retries issuing duplicate WASM downloads (3 requests instead of the expected failed request + one retry). Cache fallback now handles unsuccessful HTTP responses, and a shared in-flight download map reuses completed engine files and coalesces simultaneous requests. Engine/art cache names, saved-game storage and the user-controlled Reload update flow are preserved. Shell version: `ver-chess-shell-v7-7-android-recovery-2026-11-11`.
- Reproduced landscape clipping at **800×360**; a later rescue style overrode the existing short-screen footer rule, leaving too little room for the fitter. Restore footer hiding only for short landscape screens. Protected portrait dimensions and fitter logic are unchanged. Landscape remains compact; comfortable handset ergonomics still need physical testing.
- New actual-Chromium QA covers **320×600, 360×800, 393×852, 412×915 and 800×360**: Find, local file import, all 64 squares, >97% visibility, no horizontal overflow, Flip/Next/Previous/Reset, legal Read full alternative, Insights, Learn taps and portrait resizing without losing game state. All six focused layout tests pass. Inspected real before/after screenshots and failure traces; corrected the new harness's initial erroneous use of body's short content box as a fixed-element clipping box, retaining the >97% gate.
- Three focused PWA tests pass: `/Xchrss/` scope, real HTTP failures, failed/incomplete update then successful retry, saved library PGNs/localStorage preserved, no repeated engine downloads, closing the page then reopening offline, local PGN file import, cached Learn interaction, and **real Stockfish WASM worker `uciok` while offline**. Provider fixture is deterministic; external provider uptime is not established. Manifest already has standalone, relative start URL/scope and maskable icons.
- Owner-only Android checklist: [ANDROID-PWA-DEVICE-QA.md](docs/ANDROID-PWA-DEVICE-QA.md). **Physical Android: PENDING**; all current evidence is automated Chromium mobile emulation. Do not uninstall or clear storage.
- Final local regression: **57 browser + 65 Node passed, zero failures**. Release gate: final-head CI, guarded merge, Pages deployment and production asset/browser verification must pass before this checkpoint is called released. CI now retains Android/PWA screenshots on successful runs.

## 2026-11-10 · v7.4 PR #44 verified release — CP4 / CP5 final checkpoint

- **Released:** protected mobile Board remains fully visible; exact-position game-to-Learn suggestions now appear in **Insights → Lessons from this game**. Matching is not tactical evaluation or chess accuracy. This supersedes the earlier proposed/draft status below.
- Fix `db75e389057ad98b8390f94115f65253f47c9db5`; PR #44 merge `7885c90acb08c0e0826a27024cdc248693809285`. Final-head CI [42773981046](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42773981046), post-merge CI [42774433969](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42774433969), Pages [42774433710](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42774433710): **success**. Each full validation: **48 browser + 65 Node = 113 passed, 0 failed**.
- **Production browser smoke PASS at 07:19:45 UTC:** https://vigneswaranmba20-afk.github.io/Xchrss/ . All 64 squares visible; exact visible fraction **1.0 (100%)** for legal engine-alternative animation at **320×600 and 393×852**; `.left.scrollTop=0`, window scrollY=0. Read full, Played, Done, Next, Previous, Flip, Reset and Insights work. No page errors. Production screenshots inspected.
- Verified SHA-256 equality against the release tree for live index.html, recommendation UI, matcher, game-position index and sw.js (fresh release query). Evidence: [production-smoke.json](docs/release-evidence/v74-pr44-production-smoke.json). This verifies the actual deployed assets rather than a stale page.
- Verified service-worker control, current shell `ver-chess-shell-v7-7-review-lessons-2026-11-10`, user-controlled Reload update prompt, fresh offline reload, offline FEN-PGN import → exact lesson suggestion → Learn animation under reduced motion, and unchanged review state/FENs/localStorage. Engine cache retained; no storage clearing or uninstall required.
- **CP5:** no additional feature implemented: allowance/reset/weekly/shared-session usage remain unknown, so this run conservatively completed release recovery and documentation. Next independently testable increment: one original two-move tactical combination with legal FEN/continuation and defensive-response fixtures, staged explanations, mobile/reduced-motion/offline tests, separate branch/PR and deployment gate. Do not call it winning without supporting analysis. No book-specific attribution was added.
- **Limitations:** physical Android installed-PWA update, touch/keyboard ergonomics and fresh offline startup still need a real-device check. Open online, use Reload update when offered, then reopen offline; preserve saved PGNs. External Chess.com/Lichess regressions use deterministic intercepted responses; no claim of third-party service availability. Optional lesson matching remains limited to the two exact catalog positions.
- This follow-up checkpoint changes documentation/evidence only; its own CI/Pages state must be checked before its merge. The application-release evidence above remains tied to the exact verified PR #44 merge.

## 2026-11-10 · PR #44 release recovery — CP1 diagnosis / CP2 fix / CP3 local validation

- Execution START_TIME: `2026-11-10 07:04:43 UTC`. Codex allowance, five-hour reset, weekly restrictions and other sessions' shared usage are not exposed; all remain **unknown**. Conservative bounded release recovery; finalization by 10:04:43 UTC, absolute stop 10:34:43 UTC. No optional feature work planned while allowance is unknown.
- Concurrency: refreshed all origin refs; PR #44 remains at `ebd9eaeb9ea1a9c04628c068b811a8d2285e27af`, main at `bb31adc8cfb53707f3d1e6f04d221da911042d44`. Automation lookup reported VER Chess Development disabled (last run 06:29 UTC); this execution did not change automation settings. No newer competing commits observed. Recheck before every ref update and merge.
- **CP1:** newest failing [CI run 42768798909](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42768798909), job 129671507311, shows unchanged 277×277 board displaced from top 130.5 to −47.5, window scrollY 0, dock top 484, suggestions top 313 / height 153.5; visible fraction `0.5288808664259927`. Local 320×600 reproduction: board 289×289, visible fraction `0.610726643598616`, `.left.scrollTop=160`, container height 408 / scrollHeight 568. Actual failure screenshot and trace inspected. The added card is a sibling after the full-height board inside the fixed overflow-hidden stage; its extra scroll range allows internal scrolling during coach interaction. This is displacement, not board resizing or window scrolling.
- Main comparison at 320×600 and requested 393×852: unchanged main passes all three Read full checks, with no extra `.left` overflow. Standalone geometry also verified both branches at 393×852; the original failure is timing-sensitive there, while the existing 320×600 regression reproduces reliably. Do not claim a deterministic 393×852 baseline failure.
- **CP2 fix commit:** `db75e389057ad98b8390f94115f65253f47c9db5` (tree `ef6a8693f709278349cfd5e4339766ec1205c619`): moved recommendations into scrollable Insights and restricted visibility to that view; entering Insights refreshes from immutable game-position snapshots. Board sizing, renderer, coach, engine, parser and saved-game code unchanged. Added all three newly loaded lesson bridge scripts to shell precache and online-refresh handling; bumped only the shell cache, preserving engine/art caches and localStorage.
- **CP3 local:** full Chromium suite **48 passed / 0 failed**; Node tactical/index fixtures **65 passed / 0 failed** (run outside sandbox so fixture subprocesses execute). Original Read full assertions remain >97%; added 393×852 alternative-animation coverage, zero internal scroll, screenshots and JSON geometry attachments. Both alternative boards measured **1.0 (100%) visibility**. New fresh-offline-reload test imports an actual FEN PGN, opens its exact-match lesson via Insights, and verifies unchanged review state/FENs/localStorage. Screenshots inspected at 320×600 and 393×852, plus Insights recommendation UI.
- **CP4 RELEASE VERIFIED:** [PR #44](https://github.com/vigneswaranmba20-afk/Xchrss/pull/44) merged with expected-head guard as `7885c90acb08c0e0826a27024cdc248693809285`, confirmed on main. Final-head [CI 42773981046](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42773981046) and post-merge [CI 42774433969](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42774433969) succeeded. Both run all 48 Chromium tests and 65 Node fixtures, zero failures. Legacy [Pages deployment 42774433710](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/42774433710) completed successfully for that exact merge SHA, serving main `/`.
- **CP5 next:** a separate, small combinations lesson with a legal FEN, validated continuation, Observe → Discover → Animate → Explain → Practice → Review, reduced motion and offline tests. Do not add it during release recovery. Physical installed Android update/reload, touch and offline startup remain pending device checks; never clear saved-game storage to update.

## 2026-11-10 · v7.4 visible exact-position Learn suggestions — PROPOSED, NOT RELEASED

- Proposed an isolated, read-only card adjacent to the existing review Board. It compares immutable reviewed-position FEN snapshots with the two original Learn lesson positions and offers touch-friendly navigation only on exact matches.
- The card explains that matching is not tactical evaluation, forced material gain or chess accuracy. No game state, saved data, Stockfish, board renderer or PWA cache implementation is changed.
- Added a 393×852 Chromium offline/reduced-motion regression and board-markup preservation check. Await CI and real-device/deployment verification; do not merge if tests fail.
- The current two-lesson catalog may rarely match imported games. A later separately tested feature can introduce validated motif-based recommendations rather than falsely presenting exact matches as discovered tactics.

# VER Chess — development log

## 2026-11-10 · v7.4 read-only review position snapshots — PROPOSED, NOT RELEASED

- Expose `VERChessReviewControls.positionFens()` as a frozen array of serialized board positions, starting at ply zero. It copies FEN strings from existing in-memory game states; no PGN, saved games, Stockfish or board rendering is changed.
- Added mobile Chromium regression asserting immutable snapshots, initial-position format, ply count, and unchanged board/review state.
- Foundation for a future visible Game-to-Lesson recommendation bridge; this alone does not imply tactical opportunities or accuracy. Await CI, merge and deployment verification.

## 2026-11-10 · v7.4 browser-runtime/offline regression — PROPOSED, NOT RELEASED

- Added an actual-site Playwright check for the browser-global Game-to-Lesson index at 393×852 with reduced motion and network disabled after initial loading.
- Checks exact-position results, input immutability, frozen results, and preservation of the existing board markup. Unlike the earlier browser test, this exercises loaded browser scripts rather than importing the Node module.
- Test-only change; no app code, storage, service worker, or dependencies changed. Requires passing CI before merge and post-merge deployment verification.
- Historical pending-release entries below reflect their status when written; PR #39 and PR #40 were subsequently merged. Their live-site status must be verified independently.

## 2026-11-09 · v7.4 read-only game position index — proposed, NOT RELEASED

- Added a standalone offline helper that scans a supplied array of game FENs and returns zero-based ply indices with exact lesson matches. Does not modify games, lessons, engine state or storage.
- Added positive/negative Node fixtures and a 393×852 actual-site Playwright board-preservation regression. Matching means identical placement and side to move, **not** tactical merit or chess accuracy.
- Not yet wired to the game-review UI; no new dependencies or service-worker changes. Await PR CI, mobile/offline gates, merge and Pages verification before claiming release.


## 2026-11-09 · v7.4 conservative piece-count validation — CI pending, NOT RELEASED

- Rebased the previously conflicted PR #35 change onto the latest main after the PWA freshness release. Reject positions with more than eight pawns or sixteen pieces per side in the offline exact-position lesson matcher.
- Added positive/negative Playwright fixtures. This is not complete FEN legality or tactical evaluation. No stable board, PGN, saved-game or service-worker changes.
- Require full PR stability checks, mobile/offline regression review, merge and post-merge Pages verification before marking released.

## 2026-11-09 · PWA online freshness and installed-app update recovery

- Confirmed the public GitHub Pages assets were published for PR #37, but the installed service worker could keep serving cached JS/CSS instead of fetching newer releases.
- Switches same-origin app-shell assets to network-first with offline cache fallback; Stockfish engine remains cache-first, preserving offline analysis and avoiding repeated large downloads.
- Added a visible **Reload update** action when a new service worker takes control; never interrupt an in-progress game automatically.
- Requests service-worker update checks after app launch and on registration; includes browser regression coverage for stale cache replacement, offline fallback and the reload prompt.
- Remaining manual check: installed Android PWA must be opened online once and the update reload tapped to take the new release; avoid clearing app storage or uninstalling, which can delete locally saved PGNs.


## 2026-11-09 · Independent, horizontal account searches

- Each Find button now has its own loading state, duplicate-submit guard, and accessible busy indicator. Searching one platform leaves the other platform's controls and status alone.
- Searches can complete in either order: only the most recently submitted search updates Current search; both platforms still save their results. A late failure stays with its own platform, and selecting Saved games during a search preserves that view.
- Chess.com and Lichess now appear in two equal columns on phones and larger screens, with aligned username fields and Find buttons. Input labels remain distinct for screen readers.
- Updated the installed app's shell cache. Added browser regressions for isolated requests, overlapping responses, failures, saved-view preservation, and layout at 320, 390, 720, and 1280 pixels. CI and deployment evidence are recorded on the associated GitHub PR and Actions runs.

## 2026-11-09 · Playable Learn lesson boards

- Fixed the display-only Knight fork and Absolute pin lesson boards: white pieces now accept tap/click-to-move, mouse/touch dragging, and keyboard selection.
- Legal destinations appear as dots. Illegal moves leave the position unchanged; legal attempts move the piece and update the commentary below the board. Correct moves draw the tactical relationships and satisfy the Practice step.
- Added Try again, retained the attempted position and feedback when flipping, and made quiz answers use the same board/feedback path. Lesson state remains separate from imported games and analysis.
- Bumped the app-shell cache for installed/offline users. The observation cache regression now checks the active cache instead of an obsolete version name.
- Validation: seven new Chromium interaction/offline tests pass; all nine Node fixture suites pass. The existing browser checks passed apart from their obsolete cache-name assertion, and all six observation tests passed after updating that assertion. Pull-request CI and Pages deployment are verified separately in GitHub.
- Physical Android verification remains a user-device check. Open online once, then close and reopen the installed app to receive the new cached lesson code.

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
