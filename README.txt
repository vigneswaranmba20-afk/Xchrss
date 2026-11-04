VER CHESS INTELLIGENCE
======================
A free, responsive chess review web app for completed standard-chess games.

START ON ANDROID
----------------
1. Download index.html. Open it in Chrome, or publish it as index.html on GitHub Pages.
2. From Chess.com Android: open a FINISHED game > More > Export PGN.
   From Lichess: open a finished game and download its PGN (or copy the public game URL).
3. In this page, choose the PGN file, paste its content, or paste a Lichess game URL.
4. Select Quick, Balanced, or Deep, then tap "Analyse entire game".
5. Tap a move, see best-move advice, and choose "Better move" to see the suggestion on the board.
6. Tap "Save review" to download a plain-text report for later.

WORKS WITH
----------
- Standard chess PGN, including promotions, castling, checks, en passant, comments,
  header tags, and multiple games in one PGN (choose from the dropdown).
- Public Lichess individual-game links (if your browser allows direct API fetching).
- Chess.com exported PGN. Direct Chess.com game page URLs are not supported.

ENGINE & INTERNET
-----------------
- The full chess board and PGN replay work without chess library downloads.
- The first engine analysis downloads Stockfish 19 Lite WASM in your browser
  from jsDelivr; the app can retry via unpkg and an older-compatible JavaScript
  fallback. Internet access is needed for loading the engine files.
- No OpenAI API, account, subscription, or chess analysis server needed.
- If engine loading is blocked in a local-file viewer, publishing index.html
  on GitHub Pages (HTTPS) is recommended.
- Depth 8 is quick; 11 and 14 may take longer on a phone, depending on the
  position and your device.

HONEST LIMITS
-------------
- Move grades and centipawn losses are estimates at the chosen search depth;
  this is not Chess.com's or Lichess's official game review classification.
- The app explains chess moves with heuristic coaching text and engine lines,
  not with a conversational LLM. Books aren't needed to get started.
- This is for games already completed. Do not use engine advice during live play.
- Standard chess only (not Chess960 or other variants).
- Lichess URL import can fail because of browser or API restrictions; PGN
  file upload remains the reliable option.

SOURCES / LICENSES
------------------
- Stockfish.js by Nathan Rugg / Stockfish developers, GPL-3.0:
  https://github.com/nmrugg/stockfish.js
- The game UI and PGN move generator in index.html are purpose-built for this app.
- This is an independent project, not endorsed by Chess.com or Lichess.

HOST ON GITHUB PAGES
--------------------
Place index.html at the top level of a public GitHub Pages repository.
GitHub Pages will show the site at your Pages URL when published.
