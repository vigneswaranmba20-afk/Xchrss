# VER Chess v7.2 — isolated geometric detector foundation

2026-11-08. This module is **not loaded by the live app** until the game-to-lesson integration has been separately validated. It does not alter the board, saved games, Stockfish, or offline PWA cache.

- `knightForks(fen)` identifies a knight currently attacking at least two opposing occupied squares.
- `absolutePins(fen)` identifies a bishop/rook/queen ray through exactly one opposing non-king piece to the opposing king.
- Each result contains the actual FEN-derived squares and an explicit **geometry-only** label.
- These are observations, not claims of a forced win, material advantage, correct move, or accuracy. The side to move is not a filter; both sides' geometry is reported.
- This first module validates piece placement, row widths, side-to-move token, and exactly one king of each color. It does **not** certify full FEN legality, king-in-check consistency, move legality or engine-backed tactical soundness. Consumers must use the existing chess rules and Stockfish before claiming a tactic is actionable.
- Fixtures cover positive fork/pin positions, before/after lesson positions, one target, own pieces, blocking pieces, relative vs absolute pin, rook pin and malformed FEN.
- Zero runtime dependencies; pure functions, compatible with browser global and Node CommonJS.
- CI runs `node --test tests/ver-chess-motifs.test.cjs` before the existing Playwright mobile stability gate. No production script reference yet.

Next: integrate with legal-move validation, add positive/negative move-level examples, and then wire non-invasive highlights into Learn after a separate browser regression.
