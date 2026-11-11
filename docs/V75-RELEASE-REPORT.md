# VER Chess Intelligence v7.5 — verified release report

Both workstreams are released at https://vigneswaranmba20-afk.github.io/Xchrss/ .
All device evidence below is **Chromium mobile emulation**. **Physical Android
testing remains PENDING** in Chrome and the installed PWA.

## Results

| Workstream | Final tests | Release result |
| --- | --- | --- |
| A — Android/PWA | 57 browser + 65 Node passed; zero failures | Released, CI/Pages/live hashes and production smoke passed |
| B — combination | 76 browser + 71 Node passed; zero failures or skips | Released, final-head and post-merge CI, Pages/live hashes and production smoke passed |

Review-board production results: **100% visibility, 64 squares, zero horizontal
overflow or internal board scroll** at 320×600, 360×800, 393×852, 412×915 and
800×360. Navigation, Flip, Reset, imported PGNs, Insights and Read full work.
Landscape review is compact (102 px board); portrait remains the comfortable mode.

PWA checks passed: cached fallback on HTTP failure, coalesced engine retries,
interrupted-update recovery and Reload update, saved library PGN/localStorage
preservation, closing/reopening offline, local file import, cached Learn, and a
real offline Stockfish WASM `uciok`. The engine/art caches and saved storage are
preserved. Current shell: `ver-chess-shell-v7-7-combination-2026-11-11`.

**Lure, then fork** teaches **Rh8+ Kxh8 Nf7+ Kh7 Nxd8**, with **…Kg8 Nxd8** as
the alternative. The valid original FEN, exhaustive legal replies, SAN and board
states agree between production rules and independent python-chess. Local
Stockfish 19 Lite at depth 22 selects Rh8+ and the complete main line (+678 cp
initially, from White's perspective). This is finite-depth analysis, not a mate
proof; lesson wording describes the queen-for-rook exchange.

Observe, Discover, Animate, Explain, Practice and Review are complete. Legal
selection, tap/drag, keyboard, Pause, Previous/Next move, Replay, Flip, Exit,
both defenses, constructive mistake feedback, reduced motion, leaving/hiding,
rapid taps and cold offline use pass. Original Knight fork and Absolute pin are
preserved, and their keyboard controls no longer navigate the hidden review game.

Actual piece interpolation was measured. Latest full local sample: mean
16.662 ms, p95/max 16.700 ms. An earlier concurrent sample included an 83.300 ms
outlier; isolated follow-up mean was 16.663 ms. These short runner measurements
are retained in evidence and do not certify phone FPS.

## GitHub evidence

| | A | B |
| --- | --- | --- |
| Branch | `feature/v75-android-pwa-20261111` | `feature/v75-animated-combination-20261111` |
| Final commit | `c6c5ab378a2b9bdbca35575e72deaa123e68b2b6` | `845493727535c66c353fbee088206e3c6d7bc201` |
| Merge | `639e65fb4d2fd985f5862a3ce965169cccfab531` | `7b73a4f8044fae8dff2ac9a4892a2b4ffff25f4b` |
| PR | [#46](https://github.com/vigneswaranmba20-afk/Xchrss/pull/46) | [#47](https://github.com/vigneswaranmba20-afk/Xchrss/pull/47) |
| Final-head CI | [43084058165](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084058165) | [43093556602](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43093556602) |
| Post-merge CI | [43084371341](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084371341) | [43094243606](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43094243606) |
| Pages | [43084370636](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43084370636) | [43094242217](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43094242217) |
| Production evidence | [A JSON](release-evidence/v75-workstream-a-production.json), 19:09 UTC | [B JSON](release-evidence/v75-workstream-b-production.json), 20:13 UTC |

All linked final-head/post-merge CI and Pages runs above succeeded. Production
hashes match the release tree. Actual CI and production screenshots were inspected;
successful CI artifacts retain the mobile/lesson screenshots for seven days.

The earlier B [CI 43091980548](https://github.com/vigneswaranmba20-afk/Xchrss/actions/runs/43091980548)
failed at unmerged `e43a33e`: expanded reasoning left a 130 px board against the
unchanged >140 px requirement. After screenshot/trace inspection, the fix reserves
more space for the board and makes Review concise. Final `8454937` passed the
same assertions. **No unresolved automated failures, skipped gates or forced
merges remain.**

## Evidence and remaining work

- [Chess verification and reproduction](TACTICAL-COMBINATION.md), including the
  independent [python-chess](release-evidence/v75-combination-python.json) and
  [Stockfish](release-evidence/v75-combination-stockfish.json) records.
- [Local QA measurements and tested asset hashes](release-evidence/v75-workstream-b-local-qa.json).
- Owner: complete the [Android-only checklist](ANDROID-PWA-DEVICE-QA.md), including
  installed update, real touch ergonomics, offline restart and saved PGN checks.
  Never uninstall or clear storage to update.
- Limits: optional reasoning scrolls internally on the smallest screen; phone
  accessibility/text scaling and performance are unverified. Provider API tests
  use deterministic fixtures and do not establish current third-party uptime.
- Next smallest test improvement: start from the actual PR #45 service worker,
  retain a saved library PGN, and automate a v7.4→v7.5 upgrade while asserting the
  existing engine is reused. Physical installed-app validation remains separate.

Mission began at 18:54:16 UTC on
`8d2314942fc0c3f72fad49aa2608a0cccef0f3e1`; PRs #44/#45 were confirmed present.
Workstream B began only after A's release gates passed. At 20:14:54 UTC, about
81 minutes had elapsed. Only evidence/checkpoint finalization remains, inside the
150-minute ceiling; the feature cutoff is 20:54:16 UTC and absolute stop is
21:24:16 UTC. Codex allowance/reset information is not exposed and remains unknown.
