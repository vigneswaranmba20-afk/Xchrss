# VER Chess Insights — Metric contract v0.1

Status: research/design specification, **not implemented metrics**. Updated 2026-11-07. Scope: imported PGN and Chess.com games, locally analyzed with self-hosted Stockfish. No cloud API required. This document does not change the existing board.

## Non-negotiable truthfulness

- A motif is a **position fact** only when verified against legal moves and attack relations. A motif is a **useful tactic** only if a concrete line, engine result, or mate proof shows it improves the outcome.
- A pattern count must state whether it counts positions, moves, or distinct opportunities. Deduplicate repeated positions and multiple targets within one event.
- Never show arbitrary 0–100 percentages as "accuracy". A score is unavailable until its mathematical definition, sampling policy, and validation suite are implemented. An engine evaluation is not a probability or a strategic score.
- If Stockfish fails to load or a game has not been analyzed, display "Not analyzed" rather than 0 or a fabricated value. Display search depth, engine version, analysis budget and any partial-analysis caveats.
- Keep UI explanations original; source books are conceptual research references, not application assets or licensed text.

## Input and position pipeline

1. Parse PGN using the site's legal-move chess model, preserving move number, side to move, SAN, UCI, FEN before/after each move and game metadata. Reject malformed moves without crashing the UI.
2. Establish per-position legal moves, attack maps, defended squares, pin rays, piece inventory, king safety and pawn structure. Always check side-to-move and whether a king is in check.
3. Evaluate candidate moves using a fixed local Stockfish configuration; store evaluation from a **single perspective** (white's or mover's, explicitly documented), mate scores separately, and principal variation. Avoid comparing raw centipawns across different engine settings.
4. Classify phases transparently: opening identification requires a maintained, attributable opening reference; endgame is a heuristic phase tag (material/queen presence), not a chess law. Do not infer book moves from engine preferences.
5. Each insight links to the exact ply and FEN in the board viewer; navigating back restores prior review state. Analysis data is cached by game hash + engine/config version, not confused with locally saved games.

## Proposed detector definitions (not yet coded)

| Insight | Candidate rule | Critical false-positive guard |
| --- | --- | --- |
| Knight fork | One knight legally attacks at least two opponent pieces after a move | Count one event per knight/move; verify targets and that the move is tactically viable |
| Pin | A sliding attacker, intervening piece and higher-value/king target lie on the same unobstructed ray | Distinguish absolute pin to king from relative pin; pinned piece's legal mobility matters |
| Skewer | A sliding attack forces a more valuable front piece away, exposing a rear piece | Mere collinearity is insufficient; verify forcing move and plausible gain |
| Discovered attack | Moving one friendly piece exposes a slider's newly opened attack | Compare pre/post attack maps; do not count already open attacks |
| Double check | The resulting legal position has two distinct checking attackers | Use legal check state, not pseudo-legal attacks alone |
| Mate threat | A candidate continuation creates a forced mate within a documented search horizon | A single checking move is not a mate threat; retain line and horizon |
| King safety | Observable open files near king, pawn shelter, legal attackers and forcing checks | Label as descriptive indicators, not a universal accuracy percentage |
| Pawn structure | Isolated, doubled, backward candidate, passed and connected pawns from board geometry | Backward-pawn definitions vary; document rule and test exceptions |
| Piece activity | Legal mobility, centralization, supported outposts and open-file occupancy | Mobility under check/pins and material imbalance must be handled |
| Endgame decisions | Changes in tablebase WDL where a licensed local tablebase exists, otherwise bounded engine-eval swing | Do not claim theoretical win/draw/loss without a tablebase or proof |

## Dashboard labels

**Overview:** game metadata, analysis status, engine settings, move classifications when validated, and jump-to-move findings.

**Openings:** name/ECO only if backed by an explicit opening reference; otherwise "Unknown opening". Opening errors can be engine-evaluation observations, not "book move" claims.

**Tactics:** verified motifs, opportunity vs execution vs missed chance, exact move links and short variations.

**Strategy:** descriptive pawn/king/piece observations first. Later introduce explicitly named, versioned heuristic indices only after calibration; never call them engine accuracy.

**Endgames:** phase-qualified events, passed-pawn changes, king activation, and conversion evaluation; theoretical claims require stronger proof.

## Verification matrix for implementation PRs

- Unit/position tests: positive and negative FENs for each motif, pinned knight pseudo-attacks, absolute vs relative pins, castling/en-passant edge cases, promotions, stalemate/checkmate, repeated positions and invalid PGN.
- Engine tests: stable evaluation perspective, mate scores, engine missing/timeout, cancellation, incomplete analysis and deterministic configuration.
- Browser regression: existing Playwright suite must stay green; 390px mobile viewport must show full board; PGN import, Chess.com import, Reset, Flip, Previous/Next, Stockfish, PWA installation/offline and local saved games must not regress.
- New UI tests: "Not analyzed" before engine results; tap finding -> correct ply/FEN; tabs accessible via keyboard/touch; large game does not freeze main thread; no fabricated statistics.
- Release gate: pass relevant tests, inspect CI and screenshots, merge focused PR, confirm Pages deployment. On regressions revert to last known stable version.

## Research source mapping (not embedded)

- Dave Regis, *Chess Tactics and Combinations*: motif vocabulary and worked-position taxonomy.
- Edward Lasker, *Chess Strategy*: development, mobility, center and pawn weaknesses.
- Lev Alburt and Sam Palatnik, *The King in Jeopardy*: king attack and defensive themes.
- *Exchanging to Win in the Endgame*: transitions, exchange decisions and pawn structures.

No book files, passages or diagrams are included in the repository.

## Release log

- **2026-11-07 — specification v0.1:** defined falsifiable detection contracts and validation gates. No runtime or UI change. No claim that these metrics are already implemented.
