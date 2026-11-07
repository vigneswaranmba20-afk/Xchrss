# MASTER PROMPT — VER Chess Intelligence: Mobile-first UX Redesign

You are a senior mobile product designer, accessibility specialist, full-stack JavaScript engineer, and chess learning experience architect. Improve the existing live project without breaking working capabilities.

## Repository and delivery rules
- Repository: vigneswaranmba20-afk/Xchrss
- Existing app: https://vigneswaranmba20-afk.github.io/Xchrss/
- Work in a NEW GitHub branch. Do not commit directly to main.
- Open a pull request for owner approval, with screenshots or test evidence, changed-file summary, and a realistic list of anything untested.
- Keep the app a free, static, installable Android PWA hosted on GitHub Pages. No new subscriptions, API keys, OpenAI charges, servers, or mandatory login.
- Preserve original branding, copyright © 2026 VIGNESWARAN E R and third-party licences (Stockfish GPL-3.0 and Cburnett chess pieces). Never copy proprietary UI, artwork, analysis classification icons, or brand palettes of Chess.com or competing services.

## Current working capabilities — MUST preserve
1. Chess.com public username imports via PubAPI monthly game archives.
2. Lichess public username imports via official public games/PGN export.
3. Unified local library and search filters.
4. PGN uploads, paste, game URL import, chessboard, move navigation and move list.
5. Existing self-hosted Stockfish 19 engine and its WASM file, depth modes, analysis overlay, evaluation graph, missed-opportunity arrows, coach explanations, learning moments and review export.
6. Android install experience, service worker, offline shell and cached engine.
7. Fair-play notice, attribution, copyright and mobile support.

## User-reported failures to solve
1. Chess.com currently looks like the only import provider. Lichess is hidden behind a select menu. Make BOTH Chess.com and Lichess immediately and simultaneously discoverable with independent, visibly labeled inputs and Find buttons.
2. Searching Chess.com sometimes appears to return Lichess games. Result items must visibly identify their source and default to only the new search's results; previously saved games must live in an explicit separate “All saved games” view.
3. Searching a different account such as “Vishnu315” may appear to keep “Vishwanathan319” results. Do not display stale account results as fresh search results. Show an honest empty, loading or error state for the exact requested account and provider, without deleting old locally saved data.
4. Loading takes time, especially Chess.com monthly archives. Show descriptive live progress (“Checking month 2 of 6”), disable duplicate concurrent actions, and give useful error messages for HTTP 404, 429, network timeouts and browser CORS.
5. Games appear far below the board; tapping a game or Analyse requires excessive vertical scrolling. Use a simple Games / Board / Insights navigation flow. Opening a game goes straight to the board, and Analyse is available immediately without finding the old engine panel.
6. Remove needless navigation friction. Keep common actions above the fold on typical Android screens. Maintain legible text, adequate tap targets, visible selected states, keyboard support, focus management and reduced-motion compatibility.

## UI blueprint
- Games: compact header, high-contrast three-destination navigation, two provider search cards side-by-side at usual phone widths, loading and account-specific statuses, current-search and all-saved scopes, filters, game cards with provider badge/result/date/opponent, View board and Analyse buttons.
- Board: chessboard, visible game identity and one-tap Analyse button, Back to games, move controls, local coach. Keep the chessboard visually prominent.
- Insights: engine strength, progress, fingerprint chart, move explorer and learning moments, reachable through a single persistent navigation choice.
- On desktop, use comfortable max-width content and preserve a practical review layout. On mobile, do not require repeated long scrolling just to move between games and analysis.
- Use original VER design language (deep evergreen, warm antique gold, polished type, minimal clutter), not a copied Chess.com layout.

## Data and state correctness
- Two completely independent search forms and provider-specific status regions.
- Search results are scoped to the exact requested provider and account; every result card has a source badge.
- Keep the local multi-provider library, but never misrepresent cached results as a successful fresh search.
- Ensure a missing username, empty account, unsupported variant, aborted game, HTTP error and provider rate-limit each receive a clear explanation.
- Fetch only public, finished standard chess games. Never provide engine assistance for an in-progress game.
- Deduplicate saved PGNs by stable source key; impose sensible import and storage limits.
- Never store tokens or passwords. State that saved PGNs are browser-local and not cloud-synced.

## Engineering
- Prefer self-contained vanilla JavaScript/CSS and existing components; no unnecessary framework or heavyweight dependency.
- Reuse the existing PGN parser and runAnalysis function; do not rewrite Stockfish.
- Keep API requests serial where appropriate (particularly Chess.com archives).
- Update index.html, any new assets, and service worker cache revision together so previously installed Android PWAs can receive the new code.
- If network calls fail, preserve manual PGN upload as a fallback.
- Keep CSP-friendly practices, safe DOM text rendering (textContent for user/provider content), escaped URLs, and validated links.

## Research-informed product principles
- Chess.com analysis: obvious entry into post-game review, board-focused next steps.
- Lichess analysis: keep move controls close to the board and make evaluation secondary to playable exploration.
- Aimchess: connect analysis to learning; avoid overwhelming the player.
- ChessMonitor: unified multi-provider collection with clear provenance and filters.
- Study these products for UX principles but DO NOT reproduce their proprietary assets or UI.

## Acceptance criteria
- At normal Android widths, a new visitor can recognize both Chess.com AND Lichess without opening a select menu.
- Chess.com username A → only A's current search results; Lichess username B → only B's current search results; All saved → records from both.
- A non-existent/empty username returns an honest empty state, not account A's previously imported games.
- Every card identifies its provider and has direct View board and Analyse actions.
- Tap Analyse → the selected PGN loads on the board, the Board destination activates, and existing Stockfish analysis starts.
- Easy one-tap movement among Games, Board, and Insights with minimal scrolling.
- All original PGN, analysis, arrows, copyright, PWA, offline and licence functionality survives.
- No added paid service or per-game AI API fees.
- Test syntax, mocks for both providers, account-switch regressions, zero-result handling, PWA asset references; explicitly state that live mobile/API behavior remains unverified until tested in Android Chrome.
- Do not merge the PR without the owner's approval.

## Research references
- Chess.com help: https://support.chess.com/en/articles/10328363-how-do-i-use-game-review-on-the-app
- Chess.com PubAPI: https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it
- Lichess API specs: https://github.com/lichess-org/api
- Aimchess: https://aimchess.com
- ChessMonitor: https://www.chessmonitor.com/

**North star:** A player should be able to find a public finished game on either platform, open its board and start an insightful local analysis in a few obvious taps, without confusion, stale results or repeated long-distance scrolling.
