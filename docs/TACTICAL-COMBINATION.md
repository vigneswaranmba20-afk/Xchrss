# Lure, then fork

One original VER lesson, using the existing chess rules, local piece art and
SmoothBoard renderer. No book diagram, paid API, network engine or animation
library is required.

Starting FEN (White to move):

```text
3q2k1/8/5P2/4N3/8/8/8/K6R w - - 0 1
```

Main line: **1. Rh8+ Kxh8 2. Nf7+ Kh7 3. Nxd8**.

Alternative: **2…Kg8 3. Nxd8**. These are all legal replies to the knight check.
After Rh8+, Kxh8 is the only legal reply. The f6 pawn matters: without it, the
king could escape to g7. After the lure, a knight check attacks king and queen
together; Black must answer the check before saving the queen.

The line exchanges a rook for a queen. The lesson stops at that material gain
and does not claim immediate mate. The remaining endgame is a separate task.
Premature Nf7 does not check the king on g8; Qf8 is a legal queen escape.

The six stages ask the learner to observe the king/queen geometry, choose a
legal candidate, watch or step through the continuation, explain each current
position, play all three White moves independently, and review the transferable
pattern. Mistakes preserve the position. Optional reasoning compares both king
defenses. Playback starts only after a move choice or explicit demonstration.

Pause, Previous, Next move, Replay, Flip and Exit use the same immutable line
snapshots as the commentary. Actual moves have a short input guard; changing a
stage does not delay piece selection. Leaving Learn, exiting, or hiding the page
cancels scheduled playback and drag state. A paused practice reply has a Continue
control. The existing Knight fork, Absolute pin and protected review board remain
separate.

The active player is pinned below navigation so focus or incidental page scrolling
cannot displace its board. Its keyboard events stay separate from the review
game's global navigation shortcuts. It fits the available portrait viewport, with a compact landscape layout
for short screens. Optional deeper reasoning scrolls within its panel and reduces
the lesson board size on the smallest screen. No review-board sizing rule is
changed by the lesson. CSS removes piece transitions for reduced motion.

Reproduce verification:

```sh
node --test tests/ver-chess-*.test.cjs tests/game-lesson-index.test.cjs
npm run test:stability
node scripts/verify-combination-engine.cjs
```

The fixtures load the actual production rule implementation and compare every
FEN, SAN, legal response and final position to the independent
[python-chess evidence](release-evidence/v75-combination-python.json).
[Bundled Stockfish evidence](release-evidence/v75-combination-stockfish.json)
records depth 22, MultiPV results, engine/WASM hashes and score perspective.
Stockfish selects Rh8+ and the demonstrated main line; finite-depth evaluation
is not a tablebase proof. python-chess was used in a temporary QA environment
and is not an application or CI dependency.

Browser tests verify actual piece interpolation, frame timing, both practice
lines, mistakes, rapid taps, keyboard/touch cancellation, replay/back/next,
visibility changes, offline reopening and all six stages at the requested Android
portrait sizes. Measurements describe the Chromium runner. Physical Android and
installed-PWA ergonomics remain **PENDING**, using the
[phone-only checklist](ANDROID-PWA-DEVICE-QA.md).
