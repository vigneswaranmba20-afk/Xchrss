# VER Chess Intelligence v4 — Phase 1 (review build)

**Branch:** feature/ver-chess-v4-phase1
**Deployment:** Not deployed to the production GitHub Pages site until the pull request is merged.

## Included

- **Chess.com:** enter a public username; read the official PubAPI archive index, then read the latest monthly archives **sequentially** to reduce rate-limit risk. Fetches up to the six most recent available months and retains up to 40 recent finished standard games per search.
- **Lichess:** enter a public username and export up to 40 most recent public game PGNs from the official games-by-user endpoint.
- **Unified library:** combine records from both providers, deduplicate by source, sort most recent first, and limit locally saved records to 80.
- **Quick filters:** platform, win/loss/draw, opponent and opening text.
- **Actions:** open a game's PGN on the existing chessboard, or tap Analyse to launch the original, self-hosted Stockfish 19 analysis.
- **Android PWA:** new script included in offline app shell. Previously imported game records saved in browser localStorage (where available), and can be reopened offline.

## Preserved

The existing chessboard, original PGN file/paste import, move coach, move arrows, self-hosted engine, analysis progress overlay, depth controls, PWA manifest, licensing and original copyright text are intact. v4 is an add-on script rather than a rewrite.

## Privacy and costs

- Only a typed public username is sent to the chosen provider.
- No account password, OAuth secret, OpenAI API key or paid backend.
- The list and PGNs are stored locally in the user's browser and are not synced across devices.
- Stockfish runs locally. Network data and battery use still apply.
- Only **completed standard games** are shown. Do not run engine assistance in ongoing games or violate platform fair-play rules.
- VER Chess is independent and not affiliated with either platform; provider proprietary review visuals and branding are not reused.

## Manual acceptance test (Android Chrome)

1. Load the GitHub Pages site **after** approving and merging the PR; the branch is not itself deployed by Pages.
2. Under 00 / Your game library, choose Chess.com, enter a public username with completed standard games, and tap Find games.
3. Verify names and dates; tap Open board and check existing chessboard/navigation.
4. Tap Analyse and confirm Stockfish starts through the existing progress overlay, without paid API calls.
5. Import a Lichess username and verify that both providers appear in one library.
6. Test platform/result/search filters, Show more, refresh restoring saved records and Clear saved games.
7. After caching the engine, go offline; confirm saved PGNs open and can be analyzed. Username searches require internet.
8. Check original manual PGN upload/paste, public Lichess URL import, move arrows, copyright text and PWA install.

## Validation already done

- New library JavaScript syntax parsed successfully.
- Mock Chess.com archive and mock Lichess PGN tested end-to-end through the import functions.
- Verified merged two-game list, win filter, browser persistence and one-tap invocation of existing analysis function.
- All changes committed to a feature branch, not main.

**Testing limitation:** live API endpoints, browser CORS responses and real Android Chrome behavior could not be tested from the development environment. Error messages are included for HTTP 404/429, network, CORS and timeouts. The original PGN import remains available if a provider blocks a browser request.

## References

- Chess.com PubAPI: https://www.chess.com/news/view/published-data-api
- Lichess API: https://lichess-org.github.io/api/#tag/Games/operation/apiGamesUser

## Changed files

- New: ver-chess-v4-library.js
- Updated: index.html (loads the add-on)
- Updated: sw.js (refreshes offline app shell and precaches the new script)
- New: README-V4-PHASE1.md
