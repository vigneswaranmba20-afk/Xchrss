# VER Chess Learn — autonomous development roadmap

Version: 2026-11-07. Owner-approved; use alongside the existing hourly VER Chess Development automation.

## Product promise

Chess teaching must be visible on the chessboard itself. Users should observe, discover, animate, explain, practice and review real chess relationships. Each tactical label must be verified with legal chess rules; an attack pattern does not automatically mean a forced material gain. Build as part of the existing installable Android PWA without paid AI APIs or disrupting saved games.

## Learning tracks

- Tactical foundations: fork, absolute pin, relative pin, skewer, discovered attack, double attack, double check, back-rank mate
- Tactical combinations: overloaded defenders, deflection, decoy, clearance, interference, zwischenzug, removal of defender
- King safety: checking lines, mating nets, escape squares, defensive resources
- Strategy: development, center control, outposts, open files, pawn structures, weak squares and coordination
- Endgames: king activity, opposition, passed pawn races, rook activity, material exchanges, basic theoretical mates

## Release sequence

| Release | Scope | Acceptance checks |
| --- | --- | --- |
| v7.1 | Learn tab, reusable six-step lesson player, two independently authored fork/pin positions, quiz | Position legality, mobile regression, offline shell, original game preserved |
| v7.2 | Board-position fork and pin detection; positive and negative FEN fixtures | No false claim of a forced tactic without evaluation; exact squares grounded |
| v7.3 | Skewer, discovered attack and back-rank mate; richer practice | Correct annotation + alternate legal replies |
| v7.4 | Game-to-lesson bridge from completed imported PGNs | Link motif from real ply to correct concept lesson without mutating PGN |
| v7.5 | Multi-move combinations and practice | Legal Stockfish principal variation replay, no invented PV |
| v7.6 | Strategy and king-safety analysis | Distinguish structural observations from quantitative heuristic scores |
| v7.7 | Endgame academy | Verified theoretical endgame outcomes and legal variations |
| v8.0 | Integrated personalized chess learning progress | Local, privacy-preserving user history and honest progress metrics |

## Pedagogy, book references and originality

Conceptually consult the owner's available Google Drive chess books when accessible, including Dave Regis *Chess Tactics and Combinations*, Edward Lasker *Chess Strategy*, *The King in Jeopardy*, and *Exchanging to Win in the Endgame*. Verify chapter-specific assertions against source before attribution. Do not copy protected text, figures, position illustrations or substantive selections into the publicly accessible site. Lesson diagrams and explanations must be independently created. Store citation/provenance separately if used in future.

## UI/UX discovery and research

Evaluate modern mobile accessibility, SVG/path storytelling, CSS/Web Animations API, Motion, GSAP, Anime.js, Sass, and low-motion responsive teaching approaches. Prefer existing self-hosted SmoothBoard and native CSS as the zero-cost baseline. Add third-party runtimes only when their measured Android experience justifies weight and licensing.

## Release gates

Every change needs a focused branch/PR, legal position unit fixtures, Playwright checks at widths 320/360/390/430, offline tests, user-game persistence checks and verified GitHub Pages deployment. Failures block merge. Weekly review should summarize actual deployed milestones, errors and next work, not promise deadlines.

## Progress notifications

After *every* hourly run, generate a concise ChatGPT report with: phase, completed work, evidence, PR/commit and CI/deployment links, blockers, next task. The owner requested WhatsApp; no authenticated WhatsApp message integration is currently connected, so do not imply delivery there. Offer future WhatsApp delivery only after a supported, explicitly connected sender is verified.
